// ============ GAME ORCHESTRATOR ============
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { World } from './world.js';
import { Effects } from './effects.js';
import { Player } from './player.js';
import { Bots } from './bots.js';
import { UI } from './ui.js';
import { GamepadInput } from './gamepad.js';
import { economy } from './economy.js';
import { MODES, CONTROL_POINTS, SPAWNS, WEAPONS, REWARDS } from './config.js';
import { clamp, rand, pick, rayAABB, raySphere, makeAABB } from './util.js';
import { audio } from './audio.js';

const SENS_BASE = 0.0021;

export class Game {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.05, 340);
    this.scene.add(this.camera);
    // Dedicated short-range fill so the first-person viewmodel reads against dark cover.
    this.viewLight = new THREE.PointLight(0xbfe9ef, 2.2, 3.2, 2);
    this.viewLight.position.set(0.24, 0.02, -0.12);
    this.camera.add(this.viewLight);
    this.clock = new THREE.Clock();
    this.settings = economy.profile.settings;
    this.profile = economy.profile;
    this.input = {
      forward: false, back: false, left: false, right: false, sprint: false, crouch: false,
      jump: false, fire: false, ads: false, reload: false, swap: false, grenade: false, melee: false,
      // Controller channels stay separate so pad and mouse/keyboard can mix cleanly.
      moveX: 0, moveZ: 0, padSprint: false, padCrouch: false, padJump: false,
      padFire: false, padAds: false, padReload: false, padSwap: false, padGrenade: false, padMelee: false
    };
    this.touch = { adsToggle: false };
    this.inputMode = 'mk';
    this.keys = {};
    this.inMatch = false;
    this.paused = false;
    this.matchState = 'menu';
    this.matchTime = 0;
    this.matchElapsed = 0;
    this.timeRemaining = 0;
    this.pointerLocked = false;
    this.mouseVelX = 0;
    this.mouseVelY = 0;
    this.debugMode = false;
    this.selectedMode = 'tdm';
    this.mode = MODES.tdm;
    this.points = {};
    this.grenades = [];
    this.zoneRadius = 48;
    this.zoneCenter = new THREE.Vector2(0, 0);
    this.matchSrn = 0;
    this.killStreak = 0;
    this.bestStreak = 0;
    this.botCounter = 0;
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = 0;
    this.lastHudUpdate = 0;
    this.respawnAt = 0;
    this.deathHandled = false;
    this._captureCount = 0;

    this.initRenderer();
    this.world = new World(this.scene, this.renderer);
    this.effects = new Effects(this.scene);
    this.player = new Player(this);
    this.bots = new Bots(this);
    this.ui = new UI(this);
    this.gamepad = new GamepadInput(this);
    this.setupComposer();
    this.loadoutApplied = false;
    this.player.applyLoadout();
    this.player.spawn({ x: 0, z: 40 }, 0);
    this.player.viewmodel.visible = false;
    this.bots.setup(MODES.tdm, this.settings.difficulty || 'regular');
    this.matchState = 'menu';
    this.bindInput();
    this.applySettings();
    this.applyQuality(economy.profile.settings.quality || 'medium');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.ui.applyTouchSetting();
    this.clock.start();
    this.loop();
    this.showMenu();
    this.hideBoot();
  }

  hideBoot() {
    setTimeout(() => {
      const boot = document.getElementById('boot');
      document.getElementById('boot-fill').style.width = '100%';
      document.getElementById('boot-status').textContent = 'UPLINK ESTABLISHED';
      boot.classList.add('out');
      setTimeout(() => boot.classList.add('hidden'), 650);
    }, 500);
    let p = 0;
    const iv = setInterval(() => {
      p += 13 + Math.random() * 20;
      if (p > 95) { clearInterval(iv); p = 95; }
      document.getElementById('boot-fill').style.width = p + '%';
    }, 120);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.baseFov = this.settings.fov || 80;
    this.camera.fov = this.baseFov;
  }

  setupComposer() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5), 0.52, 0.55, 0.82);
    this.composer.addPass(this.bloom);
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.bloom.resolution.set(w * 0.5, h * 0.5);
    this.checkOrientation();
  }

  checkOrientation() {
    const hint = document.getElementById('rotate-hint');
    const portrait = window.innerHeight > window.innerWidth;
    hint.classList.toggle('hidden', !(portrait && this.inMatch && this.touchEnabled && this.matchState === 'live'));
  }

  // ---------- input ----------
  bindInput() {
    const isTouch = () => this.touchEnabled;
    document.addEventListener('keydown', e => {
      if (e.repeat) {
        if (['Space', 'KeyR'].includes(e.code)) e.preventDefault();
        return;
      }
      this.keys[e.code] = true;
      if (e.code === 'Escape') {
        if (this.inMatch && this.matchState !== 'over') this.pause();
        return;
      }
      if (!this.inMatch || this.matchState !== 'live') return;
      switch (e.code) {
        case 'KeyW': this.input.forward = true; break;
        case 'KeyS': this.input.back = true; break;
        case 'KeyA': this.input.left = true; break;
        case 'KeyD': this.input.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': this.input.sprint = true; break;
        case 'ControlLeft': case 'KeyC': this.input.crouch = !this.input.crouch; break;
        case 'Space': this.input.jump = true; e.preventDefault(); break;
        case 'KeyR': this.input.reload = true; break;
        case 'KeyG': this.input.grenade = true; break;
        case 'KeyV': this.input.melee = true; break;
        case 'KeyQ': this.input.swap = true; break;
        case 'Digit1': if (this.player.weaponIndex !== 0) this.input.swap = true; break;
        case 'Digit2': if (this.player.weaponIndex !== 1) this.input.swap = true; break;
        case 'Tab': e.preventDefault(); break;
      }
    });
    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      switch (e.code) {
        case 'KeyW': this.input.forward = false; break;
        case 'KeyS': this.input.back = false; break;
        case 'KeyA': this.input.left = false; break;
        case 'KeyD': this.input.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': this.input.sprint = false; break;
        case 'ControlLeft': case 'KeyC': this.input.crouch = false; break;
        case 'KeyR': this.input.reload = false; break;
      }
    });

    this.canvas.addEventListener('mousedown', e => {
      if (!this.inMatch || this.matchState !== 'live' || this.paused) return;
      if (this.touchEnabled) return;
      if (!this.pointerLocked && !this.debugMode) {
        this.requestLock();
        return;
      }
      if (e.button === 0) this.input.fire = true;
      if (e.button === 2) this.input.ads = true;
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) { this.input.fire = false; this.player.wasFiring = false; }
      if (e.button === 2) this.input.ads = false;
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('mousemove', e => {
      if (!this.pointerLocked || !this.inMatch || this.paused || !this.player.alive) return;
      const sens = SENS_BASE * (this.settings.sens / 50);
      const invert = this.settings.invert ? -1 : 1;
      this.mouseVelX = e.movementX;
      this.player.look(e.movementX, e.movementY * invert, sens);
    });
    this.canvas.addEventListener('click', () => {
      if (this.inMatch && !this.pointerLocked && !this.touchEnabled && this.matchState !== 'over' && !this.paused) this.requestLock();
    });
    document.addEventListener('pointerlockchange', () => {
      const was = this.pointerLocked;
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (was && !this.pointerLocked && this.inMatch && this.matchState === 'live' && !this.paused && !this.debugMode) {
        this.pause();
      }
    });
    window.addEventListener('blur', () => {
      if (this.inMatch && this.matchState === 'live' && !this.paused && !this.debugMode) this.pause();
    });
  }

  requestLock() {
    if (this.touchEnabled || this.gamepad?.active) return;
    try {
      const p = this.canvas.requestPointerLock?.();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {}
  }

  // ---------- lifecycle ----------
  showMenu() {
    this.inMatch = false;
    this.paused = false;
    this.matchState = 'menu';
    this.ui.clearHud();
    this.player.viewmodel.visible = false;
    this.bots.setup(MODES.tdm, this.settings.difficulty || 'regular');
    this.effects.clear();
    this.clearGrenades();
    this.hideZone();
    this.updateMenuCamera(0);
    document.body.classList.remove('in-match');
    document.exitPointerLock?.();
    document.getElementById('menu').classList.remove('hidden');
    this.ui.setActiveScreen('menu');
    this.ui.refreshProfile();
    this.ui.renderModes();
  }

  startMatch(opts = {}) {
    audio.resume();
    audio.startAmbient();
    this.inMatch = true;
    this.paused = false;
    this.debugMode = !!opts.debug;
    this.matchState = 'countdown';
    this.matchTime = 0;
    this.matchElapsed = 0;
    this.countdownRemain = 3.4;
    this.lastCountdownShown = null;
    this.killStreak = 0;
    this.bestStreak = 0;
    this.matchSrn = 0;
    this.player.applyLoadout();
    this.settings = economy.profile.settings;
    this.ui.selectedMode = this.ui.selectedMode || 'tdm';
    this.mode = MODES[this.ui.selectedMode];
    this.timeRemaining = this.mode.time;
    this.blueScore = 0;
    this.redScore = 0;
    this.player.captures = 0;
    this.player.objectiveScore = 0;
    this.player.kills = 0; this.player.deaths = 0; this.player.headshots = 0;
    this.player.shotsFired = 0; this.player.shotsHit = 0; this.player.damageDealt = 0;
    this.player.resetAmmo();
    this.player.maxHealth = 100 + (economy.operator(economy.profile.equipped.operator).armor || 0);
    const spawn = this.mode.ffa ? SPAWNS.ffa[0] : SPAWNS.blue[1];
    this.player.spawn(spawn, this.mode.ffa ? Math.PI * 0.25 : 0);
    this.player.viewmodel.visible = true;
    this.player.respawnDelay = this.mode.respawn || 4;
    this.ui.clearHud();
    this.ui.setupHud(this.mode);
    this.ui.updateScore(0, 0);
    this.ui.updateTimer(this.timeRemaining);
    this.ui.setMatchSrn(0);
    this.ui.refreshProfile();
    this.effects.clear();
    this.clearGrenades();
    this.bots.setup(this.mode, this.settings.difficulty || 'regular');
    this.initPoints();
    this.initZone();
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('summary').classList.add('hidden');
    document.getElementById('countdown').classList.remove('hidden');
    document.body.classList.add('in-match');
    this.baseFov = this.settings.fov || 80;
    this.camera.fov = this.baseFov;
    this.ui.countdown(3, this.mode.name + ' · NEON HARBOR');
    this.ui.checkOrientation?.();
    if (!opts.debug && !this.touchEnabled) this.requestLock();
    audio.capture();
    this.checkOrientation();
  }

  initPoints() {
    this.points = {};
    const showPoints = this.mode.id === 'dom';
    if (this.world.captureVisuals) {
      for (const v of Object.values(this.world.captureVisuals)) v.group.visible = showPoints;
    }
    for (const p of CONTROL_POINTS) {
      this.points[p.id] = { owner: null, progress: 0, contested: false, lastOwner: null };
      this.world.setCaptureState(p.id, 'neutral', 0);
    }
    if (this.mode.id === 'dom') this.ui.updateObjectives(this.points);
  }

  initZone() {
    this.zoneRadius = 48;
    this.zoneCenter.set(0, 0);
    if (this.mode.ffa) {
      this.buildZone();
      this.zoneGroup.visible = true;
      this.zoneShrinkStart = 40;
      this.zoneShrinkRate = (48 - 5) / 130;
      this.zoneWarned = false;
    } else this.hideZone();
  }

  buildZone() {
    if (this.zoneGroup) return;
    const g = new THREE.Group();
    const wallMat = new THREE.MeshBasicMaterial({ color: 0xff7a4d, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 32, 64, 1, true), wallMat);
    wall.position.y = 16;
    g.add(wall);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff8a5a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.018, 96), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    g.add(ring);
    g.visible = false;
    this.scene.add(g);
    this.zoneGroup = g;
    this.zoneWall = wall;
    this.zoneRing = ring;
  }

  hideZone() {
    if (this.zoneGroup) this.zoneGroup.visible = false;
  }

  updateZone(dt) {
    if (!this.mode || !this.mode.ffa) return;
    const t = this.matchElapsed;
    if (t > this.zoneShrinkStart) {
      const k = Math.min(1, (t - this.zoneShrinkStart) / 130);
      this.zoneRadius = 48 - (48 - 5) * k;
    }
    if (!this.zoneWarned && t > this.zoneShrinkStart - 8) {
      this.zoneWarned = true;
      this.ui.objectiveBanner('ZONE COLLAPSE IMMINENT — MOVE TO CENTER', 3000);
    }
    if (this.zoneGroup) {
      this.zoneGroup.position.set(this.zoneCenter.x, 0, this.zoneCenter.y);
      this.zoneWall.scale.set(this.zoneRadius, 1, this.zoneRadius);
      this.zoneRing.scale.set(this.zoneRadius, this.zoneRadius, 1);
      const pulse = 0.08 + Math.sin(this.matchElapsed * 2.5) * 0.03;
      this.zoneWall.material.opacity = pulse;
    }
    // zone damage
    const outside = (x, z) => Math.hypot(x - this.zoneCenter.x, z - this.zoneCenter.y) > this.zoneRadius;
    if (t > this.zoneShrinkStart && this.matchState === 'live') {
      this.zoneDamageTimer = (this.zoneDamageTimer || 0) + dt;
      if (this.zoneDamageTimer > 0.5) {
        this.zoneDamageTimer = 0;
        const dps = 4 + (t - this.zoneShrinkStart) * 0.06;
        const dmg = dps * 0.5;
        if (this.player.alive && outside(this.player.pos.x, this.player.pos.z)) {
          this.player.takeDamage(dmg, null, 'THE ZONE', 'ZONE');
        }
        for (const b of this.bots.list) {
          if (!b.alive) continue;
          if (outside(b.pos.x, b.pos.z)) {
            b.health -= dmg;
            if (b.health <= 0) this.killBot(b, { name: 'THE ZONE', team: 'none' }, 'ZONE', false, true);
          }
        }
      }
    }
  }

  // ---------- pause ----------
  pause(force) {
    if (!this.inMatch || this.matchState === 'over') return;
    if (this.paused && !force) return;
    this.paused = true;
    this.input.fire = false;
    this.input.ads = false;
    this.input.padFire = false;
    this.input.padAds = false;
    this.input.padSprint = false;
    this.input.padJump = false;
    this.input.padReload = false;
    this.input.padSwap = false;
    this.input.padGrenade = false;
    this.input.padMelee = false;
    document.getElementById('pause').classList.remove('hidden');
    document.exitPointerLock?.();
    this.ui.modalOpen = true;
  }

  resume() {
    this.paused = false;
    document.getElementById('pause').classList.add('hidden');
    document.getElementById('settings').classList.add('hidden');
    this.ui.modalOpen = false;
    if (!this.touchEnabled && !this.gamepad?.active) this.requestLock();
  }

  abortMatch() {
    document.getElementById('pause').classList.add('hidden');
    this.matchState = 'over';
    this.paused = false;
    this.showMenu();
    this.ui.showMenu();
    this.ui.toast('OPERATION ABORTED — NO REWARDS', 'warn');
  }

  returnToHQ() {
    this.matchState = 'over';
    this.inMatch = false;
    this.ui.setActiveScreen('menu');
    document.getElementById('summary').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.body.classList.remove('in-match');
    this.showMenu();
  }

  applySettings() {
    const s = economy.profile.settings;
    this.settings = s;
    audio.setVolume((s.volume ?? 65) / 100);
    this.baseFov = s.fov || 80;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
    if (this.bloom) this.bloom.enabled = s.bloom !== false && s.quality !== 'low';
  }

  applyFov() {
    const s = economy.profile.settings;
    this.baseFov = s.fov;
    this.camera.fov = s.fov;
    this.camera.updateProjectionMatrix();
  }

  applyQuality(q) {
    economy.setSetting('quality', q);
    const dpr = Math.min(window.devicePixelRatio, q === 'high' ? 2 : q === 'medium' ? 1.5 : 1);
    this.renderer.setPixelRatio(dpr);
    this.composer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = q !== 'low';
    this.world.setQuality(q);
    this.bloom.enabled = q !== 'low' && economy.profile.settings.bloom !== false;
    this.bloom.strength = q === 'high' ? 0.58 : 0.4;
    this.resize();
    if (this.player) this.player.cameraShake = 0;
  }

  // ---------- combat ----------
  resolveShot(origin, dir, maxDist, shooterTeam) {
    const worldHit = this.world.raycast(origin, dir, maxDist);
    let limit = worldHit ? worldHit.dist : maxDist;
    const botHit = this.bots.raycast(origin, dir, limit, shooterTeam);
    if (botHit) {
      return { bot: botHit.bot, dist: botHit.dist, point: botHit.point, part: botHit.part };
    }
    if (this.player.alive && shooterTeam !== this.player.team) {
      const p = this.player;
      const headY = p.pos.y + p.eye;
      const headC = new THREE.Vector3(p.pos.x, headY, p.pos.z);
      const th = raySphere(origin, dir, headC, 0.24);
      if (th !== null && th < limit) {
        return { player: true, dist: th, point: origin.clone().addScaledVector(dir, th), part: 'head' };
      }
      const torso = {
        min: new THREE.Vector3(p.pos.x - 0.33, p.pos.y + 0.72, p.pos.z - 0.28),
        max: new THREE.Vector3(p.pos.x + 0.33, p.pos.y + p.eye + 0.05, p.pos.z + 0.28)
      };
      const tt = rayAABB(origin, dir, torso, limit);
      if (tt !== null && tt > 0) return { player: true, dist: tt, point: origin.clone().addScaledVector(dir, tt), part: 'body' };
      const legs = {
        min: new THREE.Vector3(p.pos.x - 0.3, p.pos.y, p.pos.z - 0.26),
        max: new THREE.Vector3(p.pos.x + 0.3, p.pos.y + 0.72, p.pos.z + 0.26)
      };
      const tl = rayAABB(origin, dir, legs, limit);
      if (tl !== null && tl > 0) return { player: true, dist: tl, point: origin.clone().addScaledVector(dir, tl), part: 'legs' };
    }
    if (worldHit) return { dist: worldHit.dist, point: worldHit.point, normal: worldHit.normal };
    return null;
  }

  damageBot(bot, dmg, head, killer, point, weapon) {
    if (!bot.alive || this.matchState !== 'live') return;
    bot.health -= dmg;
    bot.damageTakenAt = this.matchTime;
    bot.lastSeenTime = this.matchTime;
    if (killer === this.player) this.effects.hitBurst(point, head ? 0xffb454 : 0xff8a70);
    if (bot.health <= 0) this.killBot(bot, killer, weapon?.name || 'UNKNOWN', head, false);
  }

  killBot(bot, killer, weaponName, head, silent) {
    if (!bot.alive) return;
    bot.alive = false;
    bot.deaths++;
    bot.deathT = 0;
    bot.deathDir = Math.random() > 0.5 ? 1 : -1;
    bot.respawnAt = this.mode.respawn ? this.matchTime + this.mode.respawn : 0;
    bot.mesh.userData.marker && (bot.mesh.userData.marker.visible = false);
    const killerIsPlayer = killer === this.player;
    const killerName = killerIsPlayer ? 'YOU' : killer?.name || 'UNKNOWN';
    const killerTeam = killerIsPlayer ? 'blue' : killer?.team || 'none';
    const victimTeam = bot.team;
    if (killerIsPlayer) {
      this.player.kills++;
      this.killStreak++;
      this.bestStreak = Math.max(this.bestStreak, this.killStreak);
      this.matchSrn = (this.matchSrn || 0) + REWARDS.perKill;
      this.ui.setMatchSrn(this.matchSrn);
      this.ui.killConfirm(head);
      this.ui.streakBanner(this.streakTitle(this.killStreak), `${this.killStreak} ELIMINATION STREAK`);
      audio.kill();
    } else if (killer && killer !== 'zone' && killer.kills !== undefined) {
      killer.kills++;
    }
    if (!this.mode.ffa) {
      if (killerTeam === 'blue') this.blueScore++;
      else if (killerTeam === 'red') this.redScore++;
      if (this.mode.id === 'dom' && killerTeam === 'blue') this.blueScore += 1;
      if (this.mode.id === 'dom' && killerTeam === 'red') this.redScore += 1;
    } else if (!killerIsPlayer && killer) {
      // FFA: no team score, use kills display
    }
    this.effects.killBurst(new THREE.Vector3(bot.pos.x, 1.2, bot.pos.z), victimTeam === 'blue' ? 0x5ce8d4 : 0xff5f52);
    if (!silent) {
      this.ui.addKillFeed({ name: killerName, team: killerTeam }, { name: bot.name, team: victimTeam }, weaponName, head, killerIsPlayer || bot === this.player);
      if (killerIsPlayer) this.ui.objectiveBanner(`${head ? 'HEADSHOT · ' : ''}${bot.name} ELIMINATED`, 1200);
    }
    this.ui.updateScore(this.scoreBlue(), this.scoreRed());
    this.checkWin();
  }

  streakTitle(n) {
    if (n >= 10) return 'UNSTOPPABLE';
    if (n >= 7) return 'RELENTLESS';
    if (n >= 5) return 'DOMINATING';
    if (n >= 3) return 'KILLING SPREE';
    return 'TARGET DOWN';
  }

  onPlayerDeath(killer, weaponName) {
    const killerName = killer?.name || 'UNKNOWN';
    this.ui.showDeath(killerName, weaponName, this.mode.respawn || 0);
    this.ui.scopeOff?.();
    this.ui.setScope(false);
    document.getElementById('crosshair').classList.add('hidden');
    this.killStreak = 0;
    this.player.viewmodel.visible = false;
    const killerTeam = killer?.team || 'red';
    if (!this.mode.ffa) {
      if (killerTeam === 'red') this.redScore++;
      else if (killerTeam === 'blue') this.blueScore++;
    }
    this.ui.addKillFeed({ name: killerName, team: killerTeam }, { name: 'YOU', team: 'blue' }, weaponName, false, true);
    this.ui.updateScore(this.scoreBlue(), this.scoreRed());
    audio.defeat();
    this.respawnAt = this.mode.respawn ? this.matchTime + this.mode.respawn : 0;
    this.deathHandled = false;
    if (this.mode.ffa) {
      setTimeout(() => this.endMatch({ ffaDeath: true }), 1600);
    }
    this.checkWin();
  }

  respawnPlayer() {
    const spawns = this.mode.ffa ? SPAWNS.ffa : SPAWNS.blue;
    let best = spawns[0], bestD = -1;
    for (const s of spawns) {
      let min = 999;
      for (const b of this.bots.list) {
        if (!b.alive) continue;
        min = Math.min(min, Math.hypot(b.pos.x - s.x, b.pos.z - s.z));
      }
      if (min > bestD) { bestD = min; best = s; }
    }
    this.player.spawn(best, this.mode.ffa ? rand(-Math.PI, Math.PI) : 0);
    this.player.viewmodel.visible = true;
    document.getElementById('crosshair').classList.remove('hidden');
    this.ui.hideDeath();
    this.deathHandled = true;
    audio.spawn();
  }

  spawnGrenade(origin, vel, team, owner) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color: 0x2a3234, metalness: 0.6, roughness: 0.4 }));
    mesh.position.copy(origin);
    this.scene.add(mesh);
    const ringMat = new THREE.MeshBasicMaterial({ color: team === 'blue' ? 0x5ce8d4 : 0xff5f52 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 4, 12), ringMat);
    ring.rotation.x = Math.PI / 2; mesh.add(ring);
    this.grenades.push({ mesh, vel: vel.clone(), fuse: 2.35, team, owner });
    this.ui.objectiveBanner('FRAG OUT', 700);
  }

  clearGrenades() {
    for (const g of this.grenades) { this.scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }
    this.grenades = [];
  }

  updateGrenades(dt) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.fuse -= dt;
      g.vel.y -= 20 * dt;
      g.mesh.position.addScaledVector(g.vel, dt);
      if (g.mesh.position.y < 0.1) {
        g.mesh.position.y = 0.1;
        g.vel.y *= -0.35;
        g.vel.x *= 0.7; g.vel.z *= 0.7;
      }
      // bounce off world
      const bp = g.mesh.position;
      for (const c of this.world.colliders) {
        if (bp.x > c.min.x - 0.1 && bp.x < c.max.x + 0.1 && bp.y > c.min.y && bp.y < c.max.y + 0.1 && bp.z > c.min.z - 0.1 && bp.z < c.max.z + 0.1) {
          const cx = (c.min.x + c.max.x) / 2, cz = (c.min.z + c.max.z) / 2;
          if (Math.abs(bp.x - cx) > Math.abs(bp.z - cz)) g.vel.x *= -0.5; else g.vel.z *= -0.5;
          bp.x = clamp(bp.x, c.min.x - 0.1, c.max.x + 0.1); bp.z = clamp(bp.z, c.min.z - 0.1, c.max.z + 0.1);
          break;
        }
      }
      g.mesh.rotation.x += dt * 9; g.mesh.rotation.z += dt * 7;
      if (g.fuse <= 0) {
        this.detonate(g);
        this.scene.remove(g.mesh);
        g.mesh.geometry.dispose(); g.mesh.material.dispose();
        this.grenades.splice(i, 1);
      }
    }
  }

  detonate(g) {
    const pos = g.mesh.position.clone();
    this.effects.explosion(pos, 0xffb454);
    audio.explosion();
    this.player.cameraShake = 2;
    const radius = 6.5;
    const damage = 95;
    const p = this.player;
    if (p.alive && g.owner !== p) {
      const d = p.pos.distanceTo(pos);
      if (d < radius) {
        const dmg = Math.round(damage * (1 - d / radius));
        p.takeDamage(dmg, pos, 'FRAG GRENADE', 'M67 FRAG');
      }
    }
    for (const b of this.bots.list) {
      if (!b.alive) continue;
      const d = b.pos.distanceTo(pos);
      if (d < radius) {
        const dmg = Math.round(damage * (1 - d / radius));
        this.damageBot(b, dmg, false, g.owner, b.pos.clone().setY(1), { name: 'M67 FRAG' });
      }
    }
  }

  // ---------- match loop ----------
  update(dt) {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      const perf = document.getElementById('perf');
      if (perf) perf.textContent = `${this.fps} FPS · ${this.gamepad?.active ? 'CONTROLLER' : this.touchEnabled ? 'TOUCH' : 'M&K'}`;
    }

    if (this.matchState === 'menu') {
      this.updateMenuCamera(dt);
      this.world.update(dt);
      this.effects.update(dt);
      this.render(dt);
      return;
    }

    if (this.paused) {
      this.effects.update(dt);
      this.render(dt);
      return;
    }

    this.matchTime += dt;
    this.world.update(dt);
    this.effects.update(dt);

    if (this.matchState === 'countdown') {
      this.countdownRemain -= dt;
      const n = Math.ceil(this.countdownRemain);
      if (n !== this.lastCountdownShown && n > 0) {
        this.lastCountdownShown = n;
        this.ui.countdown(n, this.mode.name + ' · NEON HARBOR');
      }
      if (this.countdownRemain <= 0) {
        this.matchState = 'live';
        this.ui.countdown('DEPLOY', this.mode.name + ' · NEON HARBOR');
        this.ui.hideCountdown();
        this.checkOrientation();
      }
      this.bots.update(dt);
      this.player.updateCamera(0);
      this.render(dt);
      return;
    }

    if (this.matchState === 'live') {
      this.matchElapsed += dt;
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);

      // input release semantics
      if (!this.input.fire && !this.input.padFire) this.player.wasFiring = false;

      this.player.update(dt);
      this.bots.update(dt);
      this.updateGrenades(dt);
      this.updateZone(dt);
      if (this.mode.id === 'dom') this.updateCapture(dt);

      // respawn
      if (!this.player.alive && this.mode.respawn) {
        const left = Math.max(0, this.respawnAt - this.matchTime);
        this.ui.updateRespawn(left, this.mode.respawn);
        if (left <= 0) this.respawnPlayer();
      }

      if (this.timeRemaining <= 0) this.endMatch({ timeUp: true });
      if (this.fps && this.fps < 24 && this.matchElapsed > 5 && !this.lowFpsAdjusted) {
        this.lowFpsAdjusted = true;
        this.applyQuality('low');
        this.ui.toast('PERFORMANCE MODE ENABLED — LOW GRAPHICS', 'warn');
      }
      // hud
      if (this.matchTime - this.lastHudUpdate > 0.12) {
        this.lastHudUpdate = this.matchTime;
        this.ui.updateHealth();
        this.ui.updateAmmo();
        this.ui.updateTimer(this.timeRemaining, this.timeRemaining < 30);
        this.ui.drawMinimap();
        this.ui.updateScore(this.scoreBlue(), this.scoreRed());
        if (this.mode.id === 'dom') this.ui.updateObjectives(this.points);
        this.ui.addBloom(0);
        this.ui.updateEquipment();
      }
      this.render(dt);
      return;
    }

    // match over — keep world alive behind summary
    this.bots.update(dt);
    this.effects.update(dt);
    this.render(dt);
  }

  updateMenuCamera(dt) {
    const t = performance.now() * 0.00004;
    const r = 39 + Math.sin(t * 2.1) * 3;
    const x = Math.sin(t) * r;
    const z = Math.cos(t) * r;
    this.camera.position.set(x, 10 + Math.sin(t * 1.7) * 2.4, z);
    this.camera.lookAt(0, 3.2, 0);
    this.camera.rotation.z = Math.sin(t * 0.7) * 0.01;
    this.player.viewmodel.visible = false;
    if (this.zoneGroup) this.zoneGroup.visible = false;
    // subtle idle animation for demo soldiers
    for (const b of this.bots.list) {
      if (b.alive) b.mesh.userData.body.position.y = Math.abs(Math.sin(performance.now() * 0.0012 + b.id)) * 0.008;
    }
    void dt;
    this.ui.drawMinimap?.();
  }

  scoreBlue() {
    if (this.mode.ffa) return this.bots.list.filter(b => b.alive).length + (this.player.alive ? 1 : 0);
    return Math.floor(this.blueScore);
  }
  scoreRed() {
    if (this.mode.ffa) return this.player.kills;
    return Math.floor(this.redScore);
  }

  updateCapture(dt) {
    const actors = [{ team: 'blue', pos: this.player.pos, isPlayer: true }, ...this.bots.list.filter(b => b.alive).map(b => ({ team: b.team, pos: b.pos }))];
    for (const p of CONTROL_POINTS) {
      const st = this.points[p.id];
      let blue = 0, red = 0, playerInside = false;
      for (const a of actors) {
        if (!a.team || a.team === 'ffa') continue;
        if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) < p.r) {
          if (a.team === 'blue') blue++;
          else if (a.team === 'red') red++;
          if (a.isPlayer && a.team === 'blue') playerInside = true;
        }
      }
      const wasContested = st.contested;
      st.contested = blue > 0 && red > 0;
      if (st.contested) {
        if (!wasContested) this.ui.objectiveBanner(`${p.id} CONTESTED`, 1200);
      } else if (blue > 0) {
        if (st.owner === 'red') {
          st.progress -= dt * 0.34;
          if (st.progress <= 0) { st.owner = null; st.progress = 0; this.world.setCaptureState(p.id, 'neutral'); }
        } else if (st.owner !== 'blue') {
          st.progress += dt * 0.34;
          if (st.progress >= 1) {
            st.owner = 'blue'; st.progress = 1;
            this.blueScore += 10;
            if (playerInside) {
              this.player.captures = (this.player.captures || 0) + 1;
              this.player.objectiveScore = (this.player.objectiveScore || 0) + 10;
              this.matchSrn = (this.matchSrn || 0) + REWARDS.perCapture;
              this.ui.setMatchSrn(this.matchSrn);
            }
            this.world.setCaptureState(p.id, 'blue');
            this.ui.objectiveBanner(`POINT ${p.id} SECURED`, 1600);
            audio.capture();
            this.checkWin();
          }
        }
      } else if (red > 0) {
        if (st.owner === 'blue') {
          st.progress -= dt * 0.34;
          if (st.progress <= 0) { st.owner = null; st.progress = 0; this.world.setCaptureState(p.id, 'neutral'); }
        } else if (st.owner !== 'red') {
          st.progress += dt * 0.34;
          if (st.progress >= 1) {
            st.owner = 'red'; st.progress = 1;
            this.redScore += 10;
            this.world.setCaptureState(p.id, 'red');
            this.ui.objectiveBanner(`POINT ${p.id} LOST`, 1600);
            audio.error();
            this.checkWin();
          }
        }
      }
      // passive score from held points
      if (st.owner === 'blue') this.blueScore += dt * 0.42;
      else if (st.owner === 'red') this.redScore += dt * 0.42;
      if (playerInside && st.owner === 'blue') this.player.objectiveScore = (this.player.objectiveScore || 0) + dt * 0.5;
    }
  }

  checkWin() {
    if (this.matchState !== 'live') return;
    if (this.mode.ffa) {
      const aliveBots = this.bots.list.filter(b => b.alive).length;
      if (!this.player.alive) return;
      if (aliveBots === 0) this.endMatch({ win: true, ffa: true });
      return;
    }
    if (this.blueScore >= this.mode.scoreLimit) this.endMatch({ win: true });
    else if (this.redScore >= this.mode.scoreLimit) this.endMatch({ win: false });
  }

  endMatch(opts = {}) {
    if (this.matchState === 'over') return;
    this.matchState = 'over';
    this.input.fire = false;
    this.input.ads = false;
    this.input.padFire = false;
    this.input.padAds = false;
    this.input.padSprint = false;
    this.input.padJump = false;
    this.input.padCrouch = false;
    document.exitPointerLock?.();
    this.ui.hideDeath();
    this.ui.setScope(false);

    let win;
    if (opts.ffaDeath) {
      win = false;
    } else if (this.mode.ffa) {
      win = this.player.alive && this.bots.list.filter(b => b.alive).length === 0;
    } else if (this.blueScore !== this.redScore) {
      win = this.blueScore > this.redScore;
    } else {
      win = this.player.kills > 0 && this.blueScore >= this.redScore;
    }
    if (opts.timeUp && !this.mode.ffa) win = this.blueScore > this.redScore;

    const accuracy = this.player.shotsFired ? Math.round((this.player.shotsHit / this.player.shotsFired) * 100) : 0;
    const result = {
      mode: this.mode,
      win,
      draw: !win && !opts.ffaDeath && Math.abs(this.blueScore - this.redScore) < 0.5 && !this.mode.ffa,
      kills: this.player.kills,
      deaths: this.player.deaths,
      headshots: this.player.headshots,
      accuracy,
      damageDealt: this.player.damageDealt,
      captures: this.player.captures || 0,
      objectiveScore: Math.round(this.player.objectiveScore || 0),
      scoreBlue: Math.round(this.blueScore),
      scoreRed: Math.round(this.redScore),
      duration: Math.round(this.matchElapsed),
      completed: true
    };
    const economyResult = economy.applyMatchResult(result);
    result.economy = economyResult;
    this.matchSrn = economyResult.total;
    this.ui.showSummary(result);
    this.checkOrientation();
    audio.startAmbient();
    this.ui.refreshProfile();
  }

  // ---------- render ----------
  render() {
    this.ui.addBloom(0);
    if (this.bloom.enabled) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(0.05, this.clock.getDelta());
    // Poll the pad even while paused so START / A can resume or navigate menus.
    this.gamepad?.update(dt);
    if (!this.paused) this.update(dt);
    else this.render(dt);
  }
}
