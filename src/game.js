import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './player.js';
import { Bot, BOT_DEFS } from './bots.js';
import { UI } from './ui.js';
import { AudioEngine } from './audio.js';
import { segmentBlocked } from './nav.js';
import './style.css';

const ROUND_TIME = 240;
const PLAYER_NAME = 'HAVOC';
const PLAYER_CSS = '#64e6c2';
const MENU_POSES = [
  { x: 16.2, z: -17.0, yaw: 2.4 },
  { x: 19.0, z: -13.4, yaw: -1.9 },
  { x: 21.8, z: -20.4, yaw: 1.3 },
  { x: 13.6, z: -21.8, yaw: 0.5 },
];

function fmt(sec) {
  sec = Math.max(0, Math.round(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 900;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.mobile,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.6 : 2));
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.mobile ? 78 : 72, innerWidth / innerHeight, 0.04, 320);
    this.lastFrame = performance.now();
    this.elapsed = 0;
    this.state = 'menu';
    this.menuT = 0;
    this.effects = [];
    this.ambientTimer = 4;
    this.heartTimer = 0;
    this.revealTimer = 0;
    this.revealedBot = null;
    this.meeting = null;
    this.context = null;
    this.round = null;

    this.audio = new AudioEngine();
    this.world = new World(this.scene, this.renderer, { mobile: this.mobile });
    this.nav = this.world.nav;
    this.player = new Player({
      camera: this.camera,
      scene: this.scene,
      audio: this.audio,
      spawn: this.world.spawn,
      colliders: this.world.colliders,
      mobile: this.mobile,
    });
    this.player.setVisible(false);

    this.bots = BOT_DEFS.map((def) => {
      const bot = new Bot(this.scene, def, false);
      bot.game = this;
      bot.isImpostor = false;
      return bot;
    });

    this.ui = new UI(this);
    this.ui.initRadar(this.world);
    this.ui.hideHUD();
    this.ui.setTaskProgress(0, 6);
    this.ui.setTimer(ROUND_TIME);
    this.ui.setCrew(5);
    this.ui.setTiltLabel(false);
    this.ui.setSoundLabel(true);
    this.ui.setAction('USE', false);
    this.bindPlayer();
    this.buildMenuCamera();
    this.buildRevealSprite();
    this.placeMenuActors();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape') return;
      if (this.state === 'task') this.ui.closeTask();
      else if (this.state === 'paused') this.togglePause(false);
      else if (this.state === 'playing') this.togglePause(true);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.togglePause(true);
    });

    this.renderer.setAnimationLoop(() => this.frame());
    requestAnimationFrame(() => this.ui.hideLoading());
  }

  bindPlayer() {
    this.player.onShootCallback = (origin, dir) => this.handleShot(origin, dir);
    this.player.onActionCallback = () => this.useAction();
    this.player.onReportCallback = () => this.reportNearestBody();
    this.player.onPauseCallback = () => this.togglePause();
    this.player.onAmmo = (n, max) => this.ui.setAmmo(n, max);
    this.player.onReloading = (on) => this.ui.setReloading(on, 0);
    this.player.onReloadProgress = (p) => this.ui.setReloading(true, p);
  }

  buildMenuCamera() {
    this.menuPos = new THREE.CatmullRomCurve3([
      new THREE.Vector3(8.5, 4.3, 0.5),
      new THREE.Vector3(12.5, 4.7, -5.5),
      new THREE.Vector3(15.5, 4.4, -10.5),
      new THREE.Vector3(11.0, 4.2, -12.0),
    ]);
    this.menuLook = new THREE.CatmullRomCurve3([
      new THREE.Vector3(18, 1.4, -17),
      new THREE.Vector3(19, 1.2, -19),
      new THREE.Vector3(18, 1.0, -21),
      new THREE.Vector3(16, 1.2, -18),
    ]);
  }

  buildRevealSprite() {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.world.tex.marker, color: 0xff4b3e, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
    sprite.scale.set(1.25, 1.25, 1);
    sprite.visible = false;
    sprite.renderOrder = 25;
    this.scene.add(sprite);
    this.revealSprite = sprite;
  }

  placeMenuActors() {
    this.bots.forEach((bot, i) => {
      const p = MENU_POSES[i % MENU_POSES.length];
      bot.reset({ x: p.x, z: p.z });
      bot.facing = p.yaw;
      bot.group.rotation.y = p.yaw;
      bot.isImpostor = false;
      bot.state = 'wander';
    });
    this.player.position.set(this.world.spawn.x, 0, this.world.spawn.z);
    this.player.setVisible(false);
    this.world.setLightsOut(false);
    this.player.setDark(false);
    this.ui.setDark(false);
  }

  startRound() {
    this.audio.resume();
    this.ui.hideMenu();
    this.ui.showHUD();
    this.ui.el['start-screen'].classList.add('hidden');
    this.ui.setMeetingButton(true);
    this.ui.setDanger(false);
    this.ui.setDark(false);
    this.ui.closePause();
    this.ui.closeMeeting();
    this.ui.closeTask(true);
    this.ui.el['end-screen'].classList.add('hidden');
    this.ui.setPrompt(null);
    this.ui.setAction('USE', false);
    this.ui.setChips([]);
    this.ui.setTaskProgress(0, 6);
    this.ui.setCrew(5);
    this.ui.setTimer(ROUND_TIME);
    this.ui.setReloading(false);
    this.world.setLightsOut(false);
    this.world.stations.forEach((st) => {
      st.done = false;
      st.sprite.material.opacity = 1;
      st.screen.material.emissiveIntensity = 1.2;
      st.strip.material.emissive = new THREE.Color(0xf5b942);
      st.strip.material.emissiveIntensity = 1.6;
    });

    const impostorIndex = Math.floor(Math.random() * this.bots.length);
    this.bots.forEach((bot, i) => {
      bot.reset(BOT_DEFS[i].spawn);
      bot.isImpostor = i === impostorIndex;
      bot.facing = Math.random() * Math.PI * 2;
      bot.group.rotation.y = bot.facing;
    });
    this.impostorBot = this.bots[impostorIndex];
    this.impostorBot.killCooldown = 11 + Math.random() * 4;

    this.player.reset(this.world.spawn);
    this.player.enabled = true;
    this.player.setVisible(true);
    this.player.setDark(false);
    this.player.recenterTilt();
    this.player.tilt.base = null;
    this.player.tilt.ready = false;

    this.state = 'playing';
    this.meeting = null;
    this.revealedBot = null;
    this.revealTimer = 0;
    this.revealSprite.visible = false;
    this.context = null;
    this.effects.forEach((e) => this.removeEffect(e));
    this.effects = [];

    this.round = {
      time: ROUND_TIME,
      tasksDone: 0,
      taskTotal: 6,
      shots: 0,
      bodies: [],
      sabotage: null,
      sabotageAttempted: false,
      sabotageFallback: 0,
      emergencyAvailable: true,
      meetingCooldown: 0,
      startedAt: this.elapsed,
      killed: [],
      crewInitial: 4,
    };
    this.ambientTimer = 3;
    this.heartTimer = 0;

    this.ui.setRole('CREWMATE');
    this.ui.setAmmo(this.player.ammo, this.player.maxAmmo);
    this.ui.setObjectiveHint('Complete tasks or expose the traitor');
    this.ui.toast('OBJECTIVE — COMPLETE 6 TASKS OR EXPOSE THE TRAITOR');
    this.ui.toast('ONE OPERATOR IS THE TRAITOR. TRUST NO ONE.', 'red');
    this.audio.setTension(0.16);
  }

  showMenu() {
    this.state = 'menu';
    this.player.enabled = false;
    this.player.setVisible(false);
    this.player.setDark(false);
    this.ui.showMenu();
    this.ui.closePause();
    this.ui.closeMeeting();
    this.ui.closeTask(true);
    this.ui.el['end-screen'].classList.add('hidden');
    this.ui.setDanger(false);
    this.ui.setDark(false);
    this.world.setLightsOut(false);
    this.ui.setChips([]);
    this.placeMenuActors();
    this.audio.setTension(0.08);
    this.ambientTimer = 4;
  }

  resize() {
    this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 900;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.6 : 2));
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.ui.updateRotateHint();
  }

  frame() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.elapsed += dt;
    if (this.state !== 'paused') this.world.update(dt, this.elapsed);
    if (this.state === 'menu') {
      this.updateMenu(dt);
    } else if (this.state === 'playing') {
      this.updatePlaying(dt);
    } else if (this.state === 'task' || this.state === 'meeting') {
      this.player.enabled = false;
      this.player.update(dt);
      if (this.state === 'meeting') this.updateMeeting(dt);
    } else if (this.state === 'paused') {
      this.player.update(0);
    }
    this.updateEffects(dt);
    this.renderer.render(this.scene, this.camera);
  }

  updateMenu(dt) {
    this.menuT = (this.menuT + dt * 0.017) % 1;
    const p = this.menuPos.getPoint(this.menuT);
    const l = this.menuLook.getPoint(this.menuT);
    this.camera.position.copy(p);
    this.camera.lookAt(l);
    this.bots.forEach((b) => b.update(dt, this.elapsed));
    this.ui.updateRadar(dt, this.radarData());
  }

  updatePlaying(dt) {
    const round = this.round;
    if (!round) return;
    round.time -= dt;
    if (round.time <= 0) {
      this.endRound(false, 'DETONATION', 'The round clock expired. The traitor stalled the defusal long enough.');
      return;
    }
    if (round.meetingCooldown > 0) round.meetingCooldown -= dt;

    this.player.enabled = true;
    this.player.update(dt);
    if (this.state !== 'playing') return;

    for (const bot of this.bots) {
      if (this.state !== 'playing') break;
      bot.update(dt, this.elapsed);
    }
    if (this.state !== 'playing') return;

    // sabotage schedule
    if (!round.sabotageAttempted && round.time <= ROUND_TIME - 72 && this.impostorBot?.alive) {
      round.sabotageAttempted = true;
      this.impostorBot.sabotageOrder = true;
      this.impostorBot.setTarget(this.world.panel.x, this.world.panel.z, true);
      round.sabotageFallback = 13;
    }
    if (round.sabotageAttempted && !round.sabotage && !this.world.dark && this.impostorBot?.alive && round.sabotageFallback > 0) {
      round.sabotageFallback -= dt;
      if (round.sabotageFallback <= 0) this.triggerSabotage(this.impostorBot);
    }
    if (round.sabotage) {
      round.sabotage.timer -= dt;
      if (round.sabotage.timer <= 0) {
        this.endRound(false, 'LIGHTS OUT', 'The traitor cut the power and the crew never restored it.');
        return;
      }
    }

    // proximity warning
    const imp = this.impostorBot;
    const impAlive = imp?.alive;
    const dist = impAlive ? Math.hypot(imp.group.position.x - this.player.position.x, imp.group.position.z - this.player.position.z) : 999;
    const danger = impAlive && dist < 8 && (this.world.dark || dist < 5);
    this.ui.setDanger(danger);
    this.heartTimer -= dt;
    if (danger && this.heartTimer <= 0) {
      this.audio.heartbeat(1);
      this.heartTimer = this.world.dark ? 0.82 : 1.15;
    }
    const tension = 0.08 + (1 - round.time / ROUND_TIME) * 0.35 + (this.world.dark ? 0.35 : 0) + (impAlive && dist < 12 ? 0.28 : 0);
    this.audio.setTension(Math.min(0.95, tension));

    // ambient distant gunfire
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0) {
      this.audio.distantShot();
      this.ambientTimer = 9 + Math.random() * 18;
    }

    // reveal marker
    if (this.revealTimer > 0 && this.revealedBot?.alive) {
      this.revealTimer -= dt;
      this.revealSprite.visible = true;
      this.revealSprite.position.set(this.revealedBot.group.position.x, 2.85 + Math.sin(this.elapsed * 5) * 0.1, this.revealedBot.group.position.z);
      if (this.revealTimer <= 0) this.revealSprite.visible = false;
    } else {
      this.revealSprite.visible = false;
    }

    this.updateContext();
    this.updateHUD(dt);

    if (this.crewAlive() <= 1 && this.player.alive) {
      this.endRound(false, 'PARITY', 'The traitor reached parity. You are the last crewmate standing — and the round is lost.');
    }
  }

  updateHUD(dt) {
    const round = this.round;
    this.ui.setTimer(round.time);
    this.ui.setCrew(this.totalAlive());
    this.ui.setTaskProgress(round.tasksDone, round.taskTotal);
    const chips = [];
    if (round.sabotage) chips.push({ text: `LIGHTS OUT — FIX ELECTRICAL (${Math.ceil(round.sabotage.timer)}s)`, type: 'red' });
    if (this.revealTimer > 0) chips.push({ text: 'TRAITOR SPOTTED — FIRE', type: 'red' });
    if (round.bodies.length) chips.push({ text: `${round.bodies.length} BODY SIGNAL`, type: 'amber' });
    if (!round.emergencyAvailable) chips.push({ text: 'EMERGENCY MEETING USED' });
    this.ui.setChips(chips);
    if (round.sabotage) this.ui.setObjectiveHint(`RESTORE POWER — ${Math.ceil(round.sabotage.timer)}s`, true);
    else if (this.revealTimer > 0) this.ui.setObjectiveHint('TRAITOR REVEALED — SHOOT TO CONFIRM', true);
    else if (round.bodies.length) this.ui.setObjectiveHint('BODY FOUND — REPORT IT NEAR THE BODY', true);
    else this.ui.setObjectiveHint(`TASKS ${round.tasksDone}/${round.taskTotal} · FIND THE TRAITOR`);
    this.ui.setMeetingButton(round.emergencyAvailable && !round.sabotage && round.meetingCooldown <= 0);
    this.ui.updateRadar(dt, this.radarData());
  }

  radarData() {
    const bots = [{ x: this.player.position.x, z: this.player.position.z, alive: this.player.alive, isYou: true }];
    for (const b of this.bots) bots.push({ x: b.group.position.x, z: b.group.position.z, alive: b.alive && b.group.visible, isYou: false });
    return {
      player: { x: this.player.position.x, z: this.player.position.z, yaw: this.player.yaw },
      bots,
      stations: this.world.stations,
      bodies: (this.round?.bodies || []).map((b) => ({ x: b.group.position.x, z: b.group.position.z })),
      sabotage: Boolean(this.round?.sabotage),
      panel: this.world.panel,
    };
  }

  updateContext() {
    if (!this.round) return;
    let context = null;
    const px = this.player.position.x;
    const pz = this.player.position.z;
    let body = null;
    let bestBody = 3.3;
    for (const b of this.round.bodies) {
      const d = Math.hypot(b.group.position.x - px, b.group.position.z - pz);
      if (d < bestBody) { bestBody = d; body = b; }
    }
    if (body) {
      context = { kind: 'body', body, text: `REPORT ${body.name}`, sub: 'BODY DISCOVERED', key: 'F', action: 'REPORT' };
    } else if (this.round.sabotage && Math.hypot(this.world.panel.x - px, this.world.panel.z - pz) < 3.1) {
      context = { kind: 'panel', text: 'RESTORE LIGHTS', sub: 'ELECTRICAL PANEL', key: 'E', action: 'FIX' };
    } else {
      let best = null;
      let bestD = 2.9;
      for (const st of this.world.stations) {
        if (st.done) continue;
        const d = Math.hypot(st.x - px, st.z - pz);
        if (d < bestD) { bestD = d; best = st; }
      }
      if (best) {
        context = {
          kind: 'station',
          station: best,
          text: `USE ${best.name}`,
          sub: `DEFUSAL TASK · ${this.round.tasksDone}/${this.round.taskTotal}`,
          key: 'E',
          action: 'USE',
        };
      }
    }
    this.context = context;
    if (context) {
      this.ui.setPrompt({ text: context.text, sub: context.sub, key: context.key, type: context.kind === 'body' ? 'report' : 'use' });
      this.ui.setAction(context.action, true);
    } else {
      this.ui.setPrompt(null);
      this.ui.setAction('USE', false);
    }
  }

  useAction() {
    if (this.state !== 'playing' || !this.context) return;
    if (this.context.kind === 'body') this.reportBody(this.context.body);
    else if (this.context.kind === 'panel') this.fixLights();
    else if (this.context.kind === 'station') this.openTask(this.context.station);
  }

  reportNearestBody() {
    if (this.state !== 'playing') return;
    if (this.context?.kind === 'body') this.reportBody(this.context.body);
    else this.ui.toast('NO BODY IN RANGE', 'red');
  }

  reportBody(body) {
    if (!body || this.state !== 'playing') return;
    this.requestMeeting({ reason: 'body', reporter: 'you', body });
  }

  callEmergency() {
    if (this.state !== 'playing' || !this.round) return;
    if (!this.round.emergencyAvailable) { this.ui.toast('EMERGENCY MEETING ALREADY USED'); return; }
    if (this.round.sabotage) { this.ui.toast('CANNOT MEET DURING A SABOTAGE', 'red'); return; }
    if (this.round.meetingCooldown > 0) { this.ui.toast('COMMS ARE REBOOTING'); return; }
    this.round.emergencyAvailable = false;
    this.ui.setMeetingButton(false);
    this.requestMeeting({ reason: 'emergency', reporter: 'you' });
  }

  openTask(station) {
    if (this.state !== 'playing' || station.done) return;
    this.state = 'task';
    this.player.enabled = false;
    this.player.joystick.x = this.player.joystick.y = 0;
    this.ui.setPrompt(null);
    this.ui.setAction('USE', false);
    this.ui.openTask(station);
    this.audio.taskStep();
  }

  cancelTask(station) {
    if (this.state !== 'task') return;
    this.taskClosed(false);
  }

  taskClosed(success) {
    if (this.state !== 'task') return;
    this.state = 'playing';
    this.player.enabled = true;
    if (!success) this.ui.toast('TASK ABORTED');
  }

  completeTask(station) {
    if (!this.round || station.done) return true;
    station.done = true;
    this.round.tasksDone++;
    this.ui.setTaskProgress(this.round.tasksDone, this.round.taskTotal);
    this.ui.toast(`TASK COMPLETE — ${station.name}`, 'green');
    if (this.round.tasksDone >= this.round.taskTotal) {
      this.winRound('DEFUSAL COMPLETE', 'All six defusal protocols are cracked. The bomb is dead and the crew survives.');
      return true;
    }
    return false;
  }

  triggerSabotage(impostor) {
    if (this.state !== 'playing' || !this.round || this.round.sabotage) return;
    this.round.sabotage = { timer: 42 };
    this.round.sabotageFallback = -1;
    this.world.setLightsOut(true);
    this.player.setDark(true);
    this.ui.setDark(true);
    this.ui.toast('LIGHTS SABOTAGED — RESTORE THE ELECTRICAL PANEL', 'red');
    this.audio.sabotage();
    if (impostor) impostor.sabotageOrder = false;
  }

  fixLights() {
    if (!this.round?.sabotage) return;
    this.round.sabotage = null;
    this.world.setLightsOut(false);
    this.player.setDark(false);
    this.ui.setDark(false);
    this.ui.toast('LIGHTS RESTORED', 'green');
    this.audio.fixed();
  }

  revealImpostor(bot) {
    if (!bot?.alive) return;
    this.revealedBot = bot;
    this.revealTimer = 3.6;
    this.audio.reveal();
    this.ui.toast(`TRAITOR SPOTTED — ${bot.name}!`, 'red');
    this.ui.flash('damage');
    this.revealSprite.visible = true;
  }

  botKilled(victim, killer) {
    if (!this.round) return;
    if (!this.round.bodies.includes(victim)) this.round.bodies.push(victim);
    victim.deathInfo = {
      place: this.placeName(victim.group.position.x, victim.group.position.z),
      nearby: this.bots
        .filter((b) => b !== victim && b.alive)
        .filter((b) => Math.hypot(b.group.position.x - victim.group.position.x, b.group.position.z - victim.group.position.z) < 13)
        .map((b) => b.name),
      playerNear: Math.hypot(this.player.position.x - victim.group.position.x, this.player.position.z - victim.group.position.z) < 13,
    };
    this.audio.kill();
    this.ui.flash('damage');
    this.ui.toast(`SIGNAL LOST — ${victim.name}`, 'red');
    this.ui.setCrew(this.totalAlive());
    const pd = Math.hypot(this.player.position.x - victim.group.position.x, this.player.position.z - victim.group.position.z);
    if (pd < 12) this.player.shake = 0.7;

    // bot witnesses
    for (const bot of this.bots) {
      if (!bot.alive || bot === killer || bot.isImpostor || bot === victim) continue;
      const d = Math.hypot(bot.group.position.x - victim.group.position.x, bot.group.position.z - victim.group.position.z);
      if (d < 13 && !segmentBlocked(bot.group.position.x, bot.group.position.z, victim.group.position.x, victim.group.position.z, this.world.colliders, { minHeight: 1.3 })) {
        bot.onWitness(killer);
        bot.witnessVictim = victim;
      }
    }

    // player line of sight reveal
    const toKiller = new THREE.Vector3(killer.group.position.x - this.player.position.x, 0, killer.group.position.z - this.player.position.z);
    const kd = toKiller.length();
    if (kd < 18 && !segmentBlocked(this.player.position.x, this.player.position.z, killer.group.position.x, killer.group.position.z, this.world.colliders, { minHeight: 1.3 })) {
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      toKiller.normalize();
      if (dir.dot(toKiller) > 0.18) this.revealImpostor(killer);
    }
    if (this.crewAlive() <= 1) {
      this.endRound(false, 'PARITY', 'The traitor has reached parity. The last crewmate cannot hold the site alone.');
    }
  }

  placeName(x, z) {
    if (x > 8 && z < -8) return 'SITE A';
    if (x > 21 && z > -8 && z < 9) return 'TUNNELS';
    if (x < -13 && z < 14) return 'LONG';
    if (x < -13 && z >= 14) return 'MARKET';
    if (Math.abs(x) < 8 && z > 12) return 'SPAWN';
    return 'MID';
  }

  nearestBody(x, z, radius, exclude) {
    if (!this.round) return null;
    let best = null;
    let bestD = radius;
    for (const b of this.round.bodies) {
      if (b === exclude || !b.group.visible) continue;
      const d = Math.hypot(b.group.position.x - x, b.group.position.z - z);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  nearestVent(x, z, radius) {
    let best = null;
    let bestD = radius;
    for (const v of this.world.vents) {
      const d = Math.hypot(v.x - x, v.z - z);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }

  useVent(bot, vent) {
    if (!vent) return;
    const options = this.world.vents.filter((v) => v !== vent);
    const dest = options[Math.floor(Math.random() * options.length)] || vent;
    this.ventPoof(vent.x, vent.z);
    bot.group.position.set(dest.x, 0, dest.z);
    bot.path = [];
    bot.target = null;
    this.ventPoof(dest.x, dest.z);
    this.audio?.burst?.({ dur: 0.4, vol: 0.08, freq: 600, q: 0.7 });
    const d = Math.hypot(this.player.position.x - vent.x, this.player.position.z - vent.z);
    if (d < 15) this.revealImpostor(bot);
  }

  requestMeeting({ reason, reporter, body, killer }) {
    if (this.state !== 'playing' || !this.round) return;
    if (this.meeting) return;
    if (this.round.meetingCooldown > 0 && reason !== 'emergency') {
      // witnesses still get their meeting; only silence rapid auto-reports
      if (reason !== 'witness') return;
    }
    if (reason === 'body' && !body) return;
    this.state = 'meeting';
    this.player.enabled = false;
    this.player.joystick.x = this.player.joystick.y = 0;
    this.player.reloading = false;
    this.ui.setReloading(false);
    this.ui.setPrompt(null);
    this.ui.setAction('USE', false);
    this.ui.setMeetingButton(false);
    this.audio.meeting();

    const participants = [
      { id: 'you', name: PLAYER_NAME, css: PLAYER_CSS, alive: this.player.alive, isYou: true },
      ...this.bots.map((b) => ({ id: b.id, name: b.name, css: b.css, alive: b.alive, isYou: false })),
    ];
    const imp = this.impostorBot;
    const aliveOthers = this.bots.filter((b) => b.alive && b !== imp);
    const witness = reason === 'witness' && reporter && reporter !== 'you' ? reporter : null;
    const victim = body || (witness?.witnessVictim && witness.witnessVictim.alive === false ? witness.witnessVictim : null);
    const killerBot = killer || (witness ? this.impostorBot : null);
    const reporterName = reporter === 'you' ? PLAYER_NAME : reporter?.name || 'SQUAD';
    const reporterCss = reporter === 'you' ? PLAYER_CSS : reporter?.css || '#f2e9d6';

    const transcript = [];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const stations = ['UPLINK', 'VALVE', 'FIBER', 'RELAY', 'COOLANT', 'DETONATOR'];
    if (reason === 'witness') {
      transcript.push({ name: reporterName, css: reporterCss, text: `I saw ${killerBot?.name || 'them'} standing over ${victim?.name || 'the body'}. It was ${killerBot?.name || 'them'}.`, accuse: true });
      const support = pick(aliveOthers.filter((b) => b !== reporter));
      if (support) transcript.push({ name: support.name, css: support.css, text: 'That is a direct call. I am listening.' });
    } else if (reason === 'body') {
      transcript.push({
        name: reporterName, css: reporterCss, you: reporter === 'you',
        text: reporter === 'you' ? `I found ${body?.name || 'a body'} at ${body?.deathInfo?.place || 'the site'}. Nobody is walking away clean.` : `${body?.name || 'Someone'} is down at ${body?.deathInfo?.place || 'the site'}. I found the body.`,
      });
      const other = pick(aliveOthers);
      if (other) transcript.push({ name: other.name, css: other.css, text: `Was anyone with ${body?.name || 'them'}? I was on ${pick(stations)}.` });
    } else {
      transcript.push({ name: PLAYER_NAME, css: PLAYER_CSS, you: true, text: 'Emergency meeting. I do not trust this squad. Sound off.' });
      const other = pick(this.bots.filter((b) => b.alive));
      if (other) transcript.push({ name: other.name, css: other.css, text: `I was on ${pick(stations)}. Call it.` });
    }

    // the traitor always gets a line
    let frameTarget = null;
    if (imp?.alive) {
      const candidates = [
        ...this.bots.filter((b) => b.alive && b !== imp),
        ...(this.player.alive ? [{ id: 'you', name: PLAYER_NAME, css: PLAYER_CSS }] : []),
      ];
      frameTarget = candidates.length ? pick(candidates) : null;
      if (reason === 'witness' && reporter && reporter !== 'you') {
        transcript.push({ name: imp.name, css: imp.css, text: `That is a lie. ${reporter.name} is covering for themselves.`, accuse: true });
      } else if (frameTarget) {
        transcript.push({ name: imp.name, css: imp.css, text: `${frameTarget.name} has been drifting all round. Watch them.`, accuse: true });
      }
    }
    // a little squad noise
    for (const bot of this.bots.filter((b) => b.alive && b !== imp && b !== reporter && b !== witness)) {
      if (Math.random() < 0.7) {
        const phrases = [
          `I was on ${pick(stations)}. No contact.`,
          `I did not see anything. This is a blind vote.`,
          `${reporterName} found the body. That is all we have.`,
          `Check the vents. The traitor is moving through the tunnels.`,
        ];
        transcript.push({ name: bot.name, css: bot.css, text: pick(phrases) });
      }
    }

    let clue = '';
    if (victim?.deathInfo) {
      const near = victim.deathInfo.nearby?.length ? victim.deathInfo.nearby.join(', ') : 'no squad link';
      clue = `BODY: ${victim.name} · ${victim.deathInfo.place} · NEARBY AT DEATH: ${near}`;
    }
    if (reason === 'witness') clue = `WITNESS LINK: ${reporterName} has direct line of sight.`;

    const voterCount = (this.player.alive ? 1 : 0) + this.bots.filter((b) => b.alive).length;
    const participantsAlive = participants.filter((p) => p.alive && !p.isYou).map((p) => p.id);
    const votes = {};
    const voteTimes = [];
    for (const bot of this.bots) {
      if (!bot.alive) continue;
      let target = 'skip';
      if (bot === imp) {
        target = frameTarget?.id || 'skip';
      } else if (witness && bot === witness) {
        target = killerBot?.alive ? killerBot.id : 'skip';
      } else if (witness) {
        const r = Math.random();
        if (r < 0.62) target = killerBot?.alive ? killerBot.id : 'skip';
        else if (r < 0.82) target = frameTarget?.id || 'skip';
        else target = 'skip';
      } else {
        const r = Math.random();
        if (r < 0.3) target = 'skip';
        else if (reason === 'body' && frameTarget && r < 0.55) target = frameTarget.id;
        else if (reason === 'body' && this.player.alive && r < 0.66) target = 'you';
        else target = participantsAlive.length ? pick(participantsAlive) : 'skip';
      }
      if (target === bot.id) target = 'skip';
      votes[bot.id] = target;
      voteTimes.push({ id: bot.id, target, at: 3.6 + Math.random() * 6.2, applied: false });
    }
    voteTimes.sort((a, b) => a.at - b.at);
    this.meeting = {
      data: {
        kicker: reason === 'body' ? 'BODY REPORTED' : reason === 'witness' ? 'WITNESS REPORT' : 'EMERGENCY MEETING',
        title: 'WHO IS THE TRAITOR?',
        sub: reason === 'body' ? `${body?.name || 'A crewmate'} is dead. Find the traitor before the next body drops.` : 'Read the comms. Vote to eject — or skip if the evidence is thin.',
        opening: reason === 'witness' ? 'A witness just opened a direct channel.' : 'Squad comms are live. Everyone gets one vote.',
        transcript, clue,
        participants,
        voterCount,
        seconds: 20,
      },
      participants,
      voterCount,
      transcript,
      votes,
      voteTimes,
      playerVoted: false,
      applied: 0,
      elapsed: 0,
      phase: 'discuss',
      resolved: false,
      resultTimer: 0,
      after: null,
      victim,
      killer: killerBot,
      witness,
      frameTarget,
    };
    this.ui.openMeeting(this.meeting.data);
    this.ui.setVoteTimer(20);
  }

  castVote(id) {
    if (this.state !== 'meeting' || !this.meeting || this.meeting.playerVoted) return;
    this.meeting.playerVoted = true;
    this.meeting.votes.you = id === 'skip' ? 'skip' : id;
    this.meeting.applied++;
    this.meeting.voteTimes.forEach((v, i) => {
      if (!v.applied) v.at = Math.min(v.at, this.meeting.elapsed + 0.6 + i * 0.35);
    });
    this.ui.markVoted('you', this.meeting.applied, this.meeting.voterCount);
  }

  updateMeeting(dt) {
    const m = this.meeting;
    if (!m) return;
    if (m.phase === 'discuss') {
      m.elapsed += dt;
      this.ui.setVoteTimer(Math.max(0, 20 - m.elapsed));
      for (const v of m.voteTimes) {
        if (!v.applied && m.elapsed >= v.at) {
          v.applied = true;
          m.applied++;
          this.ui.markVoted(v.id, m.applied, m.voterCount);
          if (Math.random() < 0.75) this.audio.voiceBlip(Math.random() * 4 | 0);
        }
      }
      if (!m.playerVoted && m.elapsed >= 20) {
        this.castVote('skip');
      }
      if (m.applied >= m.voterCount) this.resolveMeeting();
    } else if (m.phase === 'result') {
      m.resultTimer -= dt;
      if (m.resultTimer <= 0) this.finishMeeting();
    }
  }

  resolveMeeting() {
    const m = this.meeting;
    if (!m || m.resolved) return;
    m.resolved = true;
    m.phase = 'result';
    const counts = {};
    let skip = 0;
    for (const target of Object.values(m.votes)) {
      if (target === 'skip') skip++;
      else counts[target] = (counts[target] || 0) + 1;
    }
    let max = 0;
    let targets = [];
    for (const [id, n] of Object.entries(counts)) {
      if (n > max) { max = n; targets = [id]; }
      else if (n === max) targets.push(id);
    }
    const ejectedId = targets.length === 1 && max > skip ? targets[0] : null;
    const ejectedPlayer = ejectedId === 'you';
    let ejectedBot = ejectedId ? this.bots.find((b) => b.id === ejectedId) : null;
    const isImpostor = Boolean(ejectedBot?.isImpostor);
    this.ui.showMeetingResult({
      ejected: ejectedPlayer ? PLAYER_NAME : ejectedBot?.name || '',
      isImpostor,
      tie: !ejectedId && targets.length > 1,
      skipped: !ejectedId && (skip >= max || !targets.length),
      votes: m.votes,
      total: m.voterCount,
      players: m.participants,
    });
    m.resultTimer = 3.8;
    if (ejectedPlayer) {
      this.player.alive = false;
      this.player.setVisible(false);
      m.after = () => this.endRound(false, 'EJECTED', 'The crew voted you out. The traitor watched it happen.');
    } else if (isImpostor) {
      m.after = () => this.winRound('TRAITOR EJECTED', `${ejectedBot.name} was the traitor. The crew closed the round.`);
    } else if (ejectedBot) {
      ejectedBot.eject();
      const aliveCrew = this.crewAlive();
      if (aliveCrew <= 1) {
        m.after = () => this.endRound(false, 'PARITY', 'A crewmate was ejected and the traitor reached parity.');
      } else {
        this.round.crewLost = (this.round.crewLost || 0) + 1;
        m.after = () => this.resumeAfterMeeting();
      }
    } else {
      m.after = () => this.resumeAfterMeeting();
    }
    this.ui.toast(ejectedId ? (isImpostor ? 'TRAITOR EJECTED' : 'CREWMATE EJECTED') : 'NO EJECTION', isImpostor ? 'green' : 'red');
    this.audio.eject(isImpostor);
  }

  finishMeeting() {
    const m = this.meeting;
    if (!m) return;
    const after = m.after;
    this.meeting = null;
    this.ui.closeMeeting();
    if (after) after();
    else this.resumeAfterMeeting();
  }

  resumeAfterMeeting() {
    if (this.state === 'ended') return;
    this.round.meetingCooldown = 8;
    this.round.bodies.forEach((b) => { b.clearBody(); b.group.visible = false; });
    this.round.bodies = [];
    this.bots.forEach((b, i) => {
      if (b.alive) {
        const spawn = BOT_DEFS[i].spawn;
        b.setPosition(spawn.x, spawn.z);
        b.state = 'wander';
        b.facing = Math.random() * Math.PI * 2;
      } else {
        b.group.visible = false;
      }
    });
    this.player.position.set(this.world.spawn.x, 0, this.world.spawn.z);
    this.player.yaw = 0;
    this.player.pitch = 0;
    this.player.alive = true;
    this.player.enabled = true;
    this.player.setVisible(true);
    this.state = 'playing';
    this.ui.setCrew(this.totalAlive());
    this.ui.setMeetingButton(this.round.emergencyAvailable && !this.round.sabotage);
    this.ui.toast('ROUND RESUMED — TRUST NO ONE');
    this.audio.setTension(0.25);
  }

  crewAlive() {
    if (!this.player.alive) return this.bots.filter((b) => b.alive && !b.isImpostor).length;
    return 1 + this.bots.filter((b) => b.alive && !b.isImpostor).length;
  }

  totalAlive() {
    return (this.player.alive ? 1 : 0) + this.bots.filter((b) => b.alive && b.group.visible).length;
  }

  winRound(title, reason) {
    this.endRound(true, title, reason);
  }

  endRound(win, title, reason) {
    if (this.state === 'ended') return;
    this.state = 'ended';
    this.player.enabled = false;
    this.player.setVisible(false);
    this.player.setDark(false);
    this.player.joystick.x = this.player.joystick.y = 0;
    this.ui.closeTask(true);
    this.ui.closeMeeting();
    this.ui.closePause();
    this.ui.setPrompt(null);
    this.ui.setAction('USE', false);
    this.ui.setDanger(false);
    this.ui.setDark(false);
    this.ui.setMeetingButton(false);
    this.ui.setChips([]);
    this.world.setLightsOut(false);
    this.revealSprite.visible = false;
    this.audio.setTension(0);
    if (win) this.audio.win();
    else this.audio.lose();
    const elapsed = ROUND_TIME - Math.max(0, this.round?.time ?? 0);
    this.ui.showEnd({
      win,
      title,
      reason,
      impostor: this.impostorBot?.name || 'UNKNOWN',
      stats: {
        tasks: this.round?.tasksDone ?? 0,
        crewLost: Math.max(0, 4 - this.crewAlive()),
        time: fmt(elapsed),
        shots: this.round?.shots ?? 0,
      },
    });
  }

  togglePause(force) {
    if (this.state === 'ended' || this.state === 'meeting' || this.state === 'task') return;
    if (this.state === 'paused') {
      if (force === false || force === undefined) {
        this.state = 'playing';
        this.player.enabled = true;
        this.ui.closePause();
      }
      return;
    }
    if (this.state === 'playing') {
      this.state = 'paused';
      this.player.enabled = false;
      this.ui.openPause();
      document.exitPointerLock?.();
    }
  }

  async toggleTilt() {
    this.audio.resume();
    const res = await this.player.enableTilt();
    if (!res.ok) {
      this.ui.setTiltLabel(false);
      this.ui.toast(res.reason === 'denied' ? 'MOTION PERMISSION DENIED — TILT OFF' : 'TILT UNAVAILABLE ON THIS DEVICE', 'red');
      return;
    }
    const on = this.player.tilt.on;
    this.ui.setTiltLabel(on);
    if (on) {
      this.ui.toast('TILT AIM ENABLED — RECENTER IF IT DRIFTS', 'green');
      setTimeout(() => this.player.recenterTilt(), 500);
    } else {
      this.ui.toast('TILT AIM OFF');
    }
  }

  toggleSound() {
    this.audio.resume();
    const muted = !this.audio.muted;
    this.audio.setMuted(muted);
    this.ui.setSoundLabel(!muted);
    this.ui.toast(muted ? 'AUDIO MUTED' : 'AUDIO ON');
  }

  handleShot(origin, dir) {
    if (!this.round || this.state !== 'playing') return;
    this.round.shots++;
    this.ui.crosshairFire();
    this.ui.flash('fire');
    this.scene.updateMatrixWorld(true);
    const meshes = this.world.shootables.slice();
    const botMeshes = [];
    for (const bot of this.bots) {
      if (bot.alive && bot.group.visible) {
        botMeshes.push(bot.torso, bot.head);
      }
    }
    const ray = new THREE.Raycaster(origin, dir, 0.05, 110);
    const hits = ray.intersectObjects(meshes.concat(botMeshes), false);
    let botHit = null;
    let point = null;
    if (hits.length) {
      const hit = hits[0];
      point = hit.point;
      if (hit.object.userData?.bot?.alive) botHit = hit.object.userData.bot;
    }
    // generous touch aim assist: snap within 3 degrees
    if (!botHit && this.player.isTouch) {
      let best = null;
      let bestAngle = 0.055;
      for (const bot of this.bots) {
        if (!bot.alive || !bot.group.visible) continue;
        const center = new THREE.Vector3();
        bot.torso.getWorldPosition(center);
        const to = center.clone().sub(origin);
        const dist = to.length();
        if (dist > 26) continue;
        const angle = dir.angleTo(to.normalize());
        if (angle < bestAngle && !segmentBlocked(origin.x, origin.z, bot.group.position.x, bot.group.position.z, this.world.colliders, { minHeight: 1.2 })) {
          bestAngle = angle;
          best = bot;
          point = center;
        }
      }
      if (best) botHit = best;
    }
    const muzzle = new THREE.Vector3();
    this.player.flash.getWorldPosition(muzzle);
    if (!point) point = origin.clone().add(dir.clone().multiplyScalar(80));
    this.spawnTracer(muzzle, point);
    if (botHit) {
      botHit.die(this.player);
      this.ui.hitmarker();
      this.spawnImpact(point, 0x8f1710, 7);
      this.audio.kill();
      this.player.hitFeedback();
      if (!this.round.bodies.includes(botHit)) this.round.bodies.push(botHit);
      botHit.deathInfo = {
        place: this.placeName(botHit.group.position.x, botHit.group.position.z),
        nearby: this.bots.filter((b) => b !== botHit && b.alive).filter((b) => Math.hypot(b.group.position.x - botHit.group.position.x, b.group.position.z - botHit.group.position.z) < 13).map((b) => b.name),
        playerNear: true,
      };
      if (botHit.isImpostor) {
        this.revealSprite.visible = false;
        this.revealTimer = 0;
        this.winRound('TRAITOR NEUTRALIZED', `You put ${botHit.name} down. The traitor was hiding in plain sight.`);
      } else {
        this.endRound(false, 'FRIENDLY FIRE', `You executed ${botHit.name} — a crewmate. ${this.impostorBot?.name || 'The traitor'} walks free.`);
      }
      return;
    }
    if (point) this.spawnImpact(point, 0xd8bd8f, 4);
  }

  spawnTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.9, depthWrite: false });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 99;
    this.scene.add(line);
    this.effects.push({ obj: line, life: 0.07, max: 0.07, type: 'tracer' });
  }

  spawnImpact(pos, color = 0xd8bd8f, count = 4) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.world.tex.soft, color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
      const sp = new THREE.Sprite(mat);
      const s = 0.14 + Math.random() * 0.18;
      sp.scale.set(s, s, 1);
      sp.position.copy(pos);
      sp.position.x += (Math.random() - 0.5) * 0.16;
      sp.position.y += (Math.random() - 0.5) * 0.16;
      sp.position.z += (Math.random() - 0.5) * 0.16;
      this.scene.add(sp);
      this.effects.push({ obj: sp, life: 0.26 + Math.random() * 0.25, max: 0.5, type: 'puff', grow: 0.8 + Math.random() * 1.4, vel: new THREE.Vector3((Math.random() - 0.5) * 1.6, Math.random() * 1.2, (Math.random() - 0.5) * 1.6) });
    }
  }

  ventPoof(x, z) {
    for (let i = 0; i < 9; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.world.tex.soft, color: 0x1c241b, transparent: true, opacity: 0.75, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const s = 0.5 + Math.random() * 0.8;
      sp.scale.set(s, s, 1);
      sp.position.set(x + (Math.random() - 0.5) * 0.8, 0.3 + Math.random() * 0.7, z + (Math.random() - 0.5) * 0.8);
      this.scene.add(sp);
      this.effects.push({ obj: sp, life: 0.5 + Math.random() * 0.4, max: 0.9, type: 'puff', grow: 2.2, vel: new THREE.Vector3(0, 0.5 + Math.random(), 0) });
    }
  }

  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= dt;
      if (e.life <= 0) {
        this.removeEffect(e);
        this.effects.splice(i, 1);
        continue;
      }
      if (e.type === 'tracer') {
        e.obj.material.opacity = Math.max(0, e.life / e.max) * 0.9;
      } else if (e.type === 'puff') {
        const t = 1 - e.life / e.max;
        e.obj.material.opacity = Math.max(0, 1 - t) * 0.85;
        const s = 0.14 + t * e.grow;
        e.obj.scale.set(s, s, 1);
        if (e.vel) {
          e.obj.position.addScaledVector(e.vel, dt);
          e.vel.multiplyScalar(0.94);
        }
      }
    }
  }

  removeEffect(e) {
    this.scene.remove(e.obj);
    e.obj.geometry?.dispose?.();
    e.obj.material?.dispose?.();
  }
}
