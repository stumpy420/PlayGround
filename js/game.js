import {
  TAU, clamp, lerp, dist, dist2, angleLerp, angleDiff, rand, randInt, pick, shuffle,
  formatTime, safeStore, safeLocal, chance
} from './util.js';
import { World, MAP_W, MAP_H, AGENT_R, BOMB_SITE, STATION_DEFS, EMERGENCY } from './map.js';
import { TaskSystem } from './tasks.js';
import { updateBots } from './ai.js';
import { startMeeting, updateMeeting, castPlayerVote, accusePlayer, quickChat } from './meeting.js';
import { renderGame } from './render.js';

const BOT_DEFS = [
  { name: 'VEX', color: '#ff4d5e' },
  { name: 'NOVA', color: '#ff9f43' },
  { name: 'ECHO', color: '#8be28b' },
  { name: 'ROOK', color: '#c29bff' },
  { name: 'JINX', color: '#ff8fce' }
];
const PLAYER_COLOR = '#5fe3d0';

export class Game {
  constructor(canvas, input, ui, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.ui = ui;
    this.audio = audio;
    this.world = new World();
    this.world.buildGrid();
    this.tasks = new TaskSystem(audio);
    this.phase = 'menu';
    this.paused = false;
    this.taskOpen = false;
    this.time = 0;
    this.roundTime = 180;
    this.deployT = 0;
    this.cam = { x: MAP_W / 2, y: MAP_H / 2, zoom: 1, shake: 0, sx: 0, sy: 0 };
    this.view = { w: 1, h: 1, dpr: 1 };
    this.agents = [];
    this.player = null;
    this.bodies = [];
    this.bullets = [];
    this.tracers = [];
    this.particles = [];
    this.stations = [];
    this.bomb = null;
    this.intel = 0;
    this.lightsOut = 0;
    this.sabotageCd = 0;
    this.emergencyUsed = false;
    this.meeting = null;
    this.useHeld = false;
    this.playerVoted = false;
    this.spectate = null;
    this.spectateTimer = 0;
    this.hitFlash = 0;
    this.dangerT = 0;
    this.uiT = 0;
    this.stats = { kills: 0, tasks: 0, reports: 0 };
    this.settings = {
      role: safeLocal('dp_role', 'random'),
      sound: safeLocal('dp_sound', true),
      tilt: false
    };
    this.audio.setMuted(!this.settings.sound);
    this.titleT = 0;
    this.fogCanvas = document.createElement('canvas');
    this.fogCtx = this.fogCanvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.view.w = w; this.view.h = h; this.view.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.fogCanvas.width = Math.round(w * dpr);
    this.fogCanvas.height = Math.round(h * dpr);
    const base = Math.min(w / 820, h / 590);
    this.cam.zoom = clamp(base, 0.62, 1.65);
  }

  startMatch() {
    this.audio.init();
    this.phase = 'deploy';
    this.paused = false;
    this.taskOpen = false;
    this.time = 0;
    this.roundTime = 180;
    this.deployT = 0.9;
    this.bodies = [];
    this.bullets = [];
    this.tracers = [];
    this.particles = [];
    this.intel = 0;
    this.lightsOut = 0;
    this.sabotageCd = 20;
    this.emergencyUsed = false;
    this.meeting = null;
    this.useHeld = false;
    this.playerVoted = false;
    this.spectate = null;
    this.hitFlash = 0;
    this.stats = { kills: 0, tasks: 0, reports: 0 };
    this.uiT = 0;

    const pref = this.settings.role;
    const playerImp = pref === 'impostor' || (pref === 'random' && Math.random() < 0.5);
    const impIds = new Set();
    if (playerImp) impIds.add(0);
    const botIds = shuffle([1, 2, 3, 4, 5]);
    while (impIds.size < 2) impIds.add(botIds.pop());

    this.agents = [];
    const spawns = shuffle(this.world.spawns);
    const playerSpawn = spawns[0];
    this.agents.push(this.makeAgent(0, { name: 'YOU', color: PLAYER_COLOR }, playerSpawn.x, playerSpawn.y, impIds.has(0), true));
    const defs = shuffle(BOT_DEFS);
    for (let i = 0; i < 5; i++) {
      const sp = spawns[i + 1] || spawns[0];
      this.agents.push(this.makeAgent(i + 1, defs[i], sp.x + rand(-18, 18), sp.y + rand(-18, 18), impIds.has(i + 1), false));
    }
    this.player = this.agents[0];
    this.player.angle = -Math.PI / 2;
    for (const a of this.agents) {
      a.sus = {};
      for (const b of this.agents) if (b.id !== a.id) a.sus[b.id] = 0;
    }

    this.stations = STATION_DEFS.map(s => ({ ...s, done: false, progress: 0, workers: 0 }));
    const carrierId = playerImp ? 0 : [...impIds][0];
    this.bomb = {
      state: 'carried', carrierId, x: 0, y: 0, timer: 0, beepT: 0,
      defuseProgress: 0, plantProgress: 0, defuserId: null, defuseHeld: false
    };
    this.cam.x = this.player.x;
    this.cam.y = this.player.y;
    this.cam.shake = 0;

    this.ui.setTitle(false);
    this.ui.setHUD(true);
    this.ui.setRole(playerImp ? 'impostor' : 'crew', this.player);
    this.ui.setCrew(this.agents, this.player, playerImp);
    this.ui.setPhase('DEPLOYING', 3, false);
    this.ui.setIntel(0, false);
    this.ui.setSpectate(false);
    this.ui.setActionVisibility({ knife: playerImp, sabotage: playerImp, report: false, meeting: true });
    this.ui.clearFeed();
    this.ui.feed(`ROUND LIVE · ${playerImp ? 'TWO INFILTRATORS' : 'TRUST NO ONE'}`, 'info');
    this.ui.feed('SITE A IS THE BOMB OBJECTIVE', 'info');
    this.ui.alert(playerImp
      ? 'YOU ARE AN IMPOSTOR — plant at Site A. Eliminate the crew.'
      : 'YOU ARE A CREWMATE — finish intel tasks, then defuse the bomb.', playerImp ? 'danger' : 'good', 3400);
    this.ui.setUseReady(false);
    this.ui.setContext(null);
    this.ui.setProgress('', 0, false);
  }

  makeAgent(id, def, x, y, isImpostor, isPlayer) {
    return {
      id, name: def.name, color: def.color, isImpostor, isPlayer,
      x, y, angle: rand(0, TAU), alive: true, health: 100,
      ammo: 12, maxAmmo: 12, reloadT: 0, fireCd: 0, knifeCd: 0, killCd: rand(20, 28), alerted: 0, lastAttacker: null,
      speed: isImpostor ? 184 : 172, radius: AGENT_R,
      walk: 0, moving: false, stunned: 0, hitFlash: 0, muzzle: 0,
      path: null, pathIdx: 0, repathT: 0, state: 'idle', stateT: 0,
      taskStation: null, taskWork: 0, lastTask: null, reportT: 0,
      sus: {}, witnessed: null, foundBody: null, knowsKiller: null,
      rogue: false, revealedToPlayer: false, kills: 0,
      fixProgress: 0, plantProgress: 0, stepT: 0, voiceT: 0, stuckT: 0, retaliateT: 0, fleeT: 0
    };
  }

  update(dt) {
    this.time += dt;
    if (this.phase === 'menu') { this.titleT += dt; return; }
    this.updateCamera(dt);
    if (this.paused || this.taskOpen) return;
    if (this.phase === 'deploy') {
      this.deployT -= dt;
      this.ui.setPhase('DEPLOYING', 3, false);
      if (this.deployT <= 0) {
        this.phase = 'live';
        this.ui.setPhase('ROUND LIVE', 3, false);
        this.ui.feed('GO — 3:00 REMAINING', 'info');
      }
      return;
    }
    if (this.phase === 'meeting') { updateMeeting(this, dt); return; }
    if (this.phase !== 'live') return;

    if (this.bomb.state === 'carried') {
      this.roundTime -= dt;
      if (this.roundTime <= 0) {
        this.endRound('crew', 'Round time expired before the bomb was planted.');
        return;
      }
    }
    this.sabotageCd = Math.max(0, this.sabotageCd - dt);
    if (this.lightsOut > 0) {
      this.lightsOut -= dt;
      if (this.lightsOut <= 0) {
        this.lightsOut = 0;
        this.ui.feed('POWER RESTORED', 'good');
      }
    }
    this.updateStations(dt);
    this.updateBomb(dt);
    this.updatePlayer(dt);
    updateBots(this, dt);
    this.updateBullets(dt);
    this.updateParticles(dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 2.4);
    this.cam.shake = Math.max(0, this.cam.shake - dt * 14);
    this.dangerT -= dt;
    if (this.dangerT <= 0 && this.player.alive) {
      const near = this.agents.some(a => a.alive && a.isImpostor && !a.isPlayer && dist(a.x, a.y, this.player.x, this.player.y) < 190 && this.world.los(a.x, a.y, this.player.x, this.player.y));
      if (near) { this.audio.heartbeat(1); this.dangerT = 0.72; }
      else this.dangerT = 0.4;
    }
    this.uiT -= dt;
    if (this.uiT <= 0) { this.ui.updateHUD(this); this.uiT = 0.1; }
    this.checkWin();
  }

  updateCamera(dt) {
    let target = this.player;
    if (!this.player) target = { x: MAP_W / 2, y: MAP_H / 2 };
    else if (!this.player.alive) {
      this.spectateTimer -= dt;
      if (!this.spectate || this.spectateTimer <= 0 || !this.agents.find(a => a.id === this.spectate && a.alive)) {
        const alive = this.agents.filter(a => a.alive);
        const imps = alive.filter(a => a.isImpostor);
        const next = (this.player.isImpostor ? alive : imps.length ? imps : alive)[0] || alive[0];
        this.spectate = next ? next.id : null;
        this.spectateTimer = 7;
      }
      target = this.agents.find(a => a.id === this.spectate) || this.player;
    }
    const tx = target.x, ty = target.y;
    this.cam.x = lerp(this.cam.x, tx, Math.min(1, dt * 7));
    this.cam.y = lerp(this.cam.y, ty, Math.min(1, dt * 7));
    const viewW = this.view.w / this.cam.zoom, viewH = this.view.h / this.cam.zoom;
    this.cam.x = clamp(this.cam.x, Math.min(viewW / 2, MAP_W / 2), Math.max(MAP_W - viewW / 2, MAP_W / 2));
    this.cam.y = clamp(this.cam.y, Math.min(viewH / 2, MAP_H / 2), Math.max(MAP_H - viewH / 2, MAP_H / 2));
    this.cam.sx = this.cam.shake ? rand(-this.cam.shake, this.cam.shake) : 0;
    this.cam.sy = this.cam.shake ? rand(-this.cam.shake, this.cam.shake) : 0;
  }

  updateStations(dt) {
    for (const st of this.stations) {
      st.workers = 0;
      if (st.done) continue;
      // nearby crew bots contribute a slow trickle
      for (const a of this.agents) {
        if (!a.alive || a.isPlayer || a.isImpostor) continue;
        if (dist(a.x, a.y, st.x, st.y) < 58) {
          st.workers++;
          st.progress += dt * 7.5;
        }
      }
      if (st.progress >= 100) {
        st.progress = 100;
        this.completeStation(st, null);
      }
    }
  }

  completeStation(st, by) {
    if (st.done) return;
    st.done = true;
    st.progress = 100;
    this.intel = clamp(this.intel + 20, 0, 100);
    if (by && !by.isPlayer) {
      by.lastTask = st.name;
      this.ui.feed(`${by.name} COMPLETED ${st.name} · +20% INTEL`, 'task');
    } else if (by && by.isPlayer) {
      this.stats.tasks++;
      this.ui.feed(`TASK COMPLETE · ${st.name} · +20% INTEL`, 'task');
    } else {
      this.ui.feed(`${st.name} ONLINE · +20% INTEL`, 'task');
    }
    this.audio.task();
    this.spawnBurst(st.x, st.y, '#5fe3d0', 14, 70);
    if (this.intel >= 100) {
      this.ui.feed('DEFUSE KIT READY — 4 SECOND DEFUSE', 'good');
      this.ui.alert('INTEL COMPLETE — DEFUSE KIT READY', 'good', 2600);
      this.audio.task();
    }
    this.ui.setIntel(this.intel, this.intel >= 100);
  }

  updateBomb(dt) {
    const b = this.bomb;
    if (b.state === 'planted') {
      b.timer -= dt;
      b.beepT -= dt;
      if (b.beepT <= 0) {
        const urgent = b.timer < 15;
        this.audio.bombBeep(urgent);
        b.beepT = b.timer < 8 ? 0.28 : b.timer < 20 ? 0.55 : 1;
        this.cam.shake = Math.max(this.cam.shake, urgent ? 1.6 : 0.5);
      }
      b.defuseHeld = false;
      if (this.player.alive && !this.player.isImpostor && dist(this.player.x, this.player.y, b.x, b.y) < 72 && this.useHeld) {
        b.defuseHeld = true;
      }
      for (const a of this.agents) {
        if (!a.alive || a.isPlayer || a.isImpostor) continue;
        if (dist(a.x, a.y, b.x, b.y) < 60) {
          b.defuseHeld = true;
          a.state = 'defuse';
        }
      }
      if (b.defuseHeld) {
        const rate = this.intel >= 100 ? 0.28 : 0.11;
        b.defuseProgress += dt * rate;
        if (Math.floor(b.defuseProgress * 10) !== Math.floor((b.defuseProgress - dt * rate) * 10)) this.audio.defuseTick();
        if (b.defuseProgress >= 1) {
          b.defuseProgress = 1;
          b.state = 'defused';
          this.audio.task();
          this.spawnBurst(b.x, b.y, '#8be28b', 40, 150);
          this.endRound('crew', 'The bomb was defused. Site A is secure.');
          return;
        }
      } else {
        b.defuseProgress = Math.max(0, b.defuseProgress - dt * 0.035);
      }
      if (b.timer <= 0) {
        b.timer = 0;
        b.state = 'exploded';
        this.audio.kill();
        this.cam.shake = 30;
        this.spawnBurst(b.x, b.y, '#ff8a1e', 90, 420);
        this.spawnBurst(b.x, b.y, '#ff4d5e', 60, 280);
        this.endRound('impostor', 'The bomb detonated at Site A.');
      }
    }
    if (b.state === 'carried') {
      const carrier = this.agents.find(a => a.id === b.carrierId && a.alive);
      if (carrier) { b.x = carrier.x; b.y = carrier.y; }
      else {
        const imp = this.agents.find(a => a.alive && a.isImpostor);
        if (imp) { b.carrierId = imp.id; b.x = imp.x; b.y = imp.y; }
      }
      // if the player is carrying and stalls too long, the other impostor takes over
      if (b.carrierId === this.player.id && this.player.alive && this.roundTime < 115) {
        const other = this.agents.find(a => a.alive && a.isImpostor && !a.isPlayer);
        if (other) {
          b.carrierId = other.id;
          this.ui.feed(`BOMB TRANSFERRED TO ${other.name}`, 'kill');
          this.ui.alert('BOMB TRANSFERRED — YOUR PARTNER IS MOVING', 'danger', 2200);
        }
      }
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    if (!p || !p.alive) return;
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.knifeCd = Math.max(0, p.knifeCd - dt);
    p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
    p.muzzle = Math.max(0, p.muzzle - dt);
    if (p.reloadT > 0) {
      p.reloadT -= dt;
      if (p.reloadT <= 0) {
        p.ammo = p.maxAmmo;
        this.ui.feed('RELOADED', 'info');
      }
    }
    if (p.stunned > 0) { p.stunned -= dt; return; }
    const mv = this.input.moveVector;
    p.moving = Math.abs(mv.x) + Math.abs(mv.y) > 0.02;
    if (p.moving) {
      const speed = p.speed * (this.lightsOut > 0 ? 0.96 : 1);
      this.world.moveCircle(p, mv.x * speed * dt, mv.y * speed * dt, AGENT_R);
      p.walk += dt * 10;
      p.stepT -= dt;
      if (p.stepT <= 0) { this.audio.step(); p.stepT = 0.34; }
    }
    let aim = this.input.aimAngle;
    if (aim == null && this.input.mouse.inside) {
      const wx = this.cam.x + (this.input.mouse.x - this.view.w / 2) / this.cam.zoom;
      const wy = this.cam.y + (this.input.mouse.y - this.view.h / 2) / this.cam.zoom;
      aim = Math.atan2(wy - p.y, wx - p.x);
    }
    if (aim != null) p.angle = angleLerp(p.angle, aim, Math.min(1, dt * 22));
    else if (p.moving) p.angle = angleLerp(p.angle, Math.atan2(mv.y, mv.x), Math.min(1, dt * 10));

    if (this.input.firing && !this.taskOpen) {
      if (p.reloadT <= 0) {
        if (p.ammo > 0) this.shoot(p, p.angle);
        else if (p.reloadT <= 0) { p.reloadT = 1.25; this.audio.reload(); }
      }
    }
    if (p.ammo <= 0 && p.reloadT <= 0 && !this.input.firing) {
      p.reloadT = 1.25;
      this.audio.reload();
    }

    if (this.useHeld) {
      const ctx = this.getContext();
      if (ctx && ctx.type === 'plant') {
        p.plantProgress += dt;
        this.audio.plantTick();
        if (p.plantProgress >= 4) { p.plantProgress = 0; this.plantBomb(p); }
      } else if (ctx && ctx.type === 'fix') {
        p.fixProgress += dt;
        if (p.fixProgress >= 2.5) {
          p.fixProgress = 0;
          this.lightsOut = 0;
          this.ui.feed('BREAKER RESET — LIGHTS RESTORED', 'good');
          this.ui.alert('POWER RESTORED', 'good', 1800);
          this.audio.task();
        }
      } else if (ctx && ctx.type === 'defuse') {
        // handled centrally in updateBomb
      }
    } else {
      p.plantProgress = Math.max(0, p.plantProgress - dt * 2);
      p.fixProgress = Math.max(0, p.fixProgress - dt * 2);
    }
  }

  getContext() {
    const p = this.player;
    if (!p || !p.alive || this.phase !== 'live') return null;
    if (this.bomb.state !== 'planted') {
      for (const body of this.bodies) {
        if (!body.reported && dist(p.x, p.y, body.x, body.y) < 105) return { type: 'report', body, label: 'REPORT BODY' };
      }
    }
    if (this.bomb.state === 'planted' && !p.isImpostor && dist(p.x, p.y, this.bomb.x, this.bomb.y) < 90) {
      return { type: 'defuse', label: this.intel >= 100 ? 'DEFUSE (KIT)' : 'DEFUSE BOMB' };
    }
    if (p.isImpostor && this.bomb.state === 'carried' && this.bomb.carrierId === p.id && dist(p.x, p.y, BOMB_SITE.x, BOMB_SITE.y) < BOMB_SITE.r) {
      return { type: 'plant', label: 'PLANT BOMB' };
    }
    if (this.lightsOut > 0 && dist(p.x, p.y, 1460, 640) < 85) {
      return { type: 'fix', label: 'RESET BREAKER' };
    }
    for (const st of this.stations) {
      if (!st.done && dist(p.x, p.y, st.x, st.y) < 68) {
        return { type: 'task', station: st, label: p.isImpostor ? 'FAKE TASK' : 'START TASK' };
      }
    }
    if (!this.emergencyUsed && this.bomb.state !== 'planted' && dist(p.x, p.y, EMERGENCY.x, EMERGENCY.y) < 75) {
      return { type: 'meeting', label: 'EMERGENCY MEETING' };
    }
    return null;
  }

  useDown() {
    if (this.phase !== 'live' || !this.player.alive || this.taskOpen) return;
    this.audio.init();
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.type === 'task') {
      this.openTask(ctx.station);
      return;
    }
    if (ctx.type === 'report') { this.reportBody(ctx.body); return; }
    if (ctx.type === 'meeting') { this.callEmergency(); return; }
    this.useHeld = true;
    if (ctx.type === 'plant') this.ui.setProgress('PLANTING BOMB', 0, true);
    if (ctx.type === 'defuse') this.ui.setProgress('DEFUSING', 0, true);
    if (ctx.type === 'fix') this.ui.setProgress('RESETTING BREAKER', 0, true);
  }

  useUp() {
    this.useHeld = false;
    this.ui.setProgress('', 0, false);
  }

  openTask(station) {
    const fake = this.player.isImpostor;
    this.taskOpen = true;
    this.input.fireHeld = false;
    this.input.aim.firing = false;
    this.useHeld = false;
    this.ui.openTask(station, fake,
      () => {
        this.taskOpen = false;
        if (fake) {
          this.ui.feed('COVER TASK COMPLETE — NO INTEL', 'info');
          this.player.lastTask = station.name;
        } else {
          this.completeStation(station, this.player);
          this.player.lastTask = station.name;
        }
        this.ui.updateHUD(this);
      },
      () => { this.taskOpen = false; }
    );
  }

  reportBody(body) {
    if (this.phase !== 'live' || this.bomb.state === 'planted') {
      if (this.bomb.state === 'planted') this.ui.alert('COMMS JAMMED — BOMB ACTIVE', 'danger', 1800);
      return;
    }
    this.stats.reports++;
    body.reported = true;
    startMeeting(this, 'BODY REPORTED', this.player, body);
  }

  reportBot(body, reporter) {
    if (this.phase !== 'live' || this.bomb.state === 'planted') return;
    body.reported = true;
    startMeeting(this, 'BODY REPORTED', reporter, body);
  }

  callEmergency() {
    if (this.phase !== 'live' || this.emergencyUsed || this.bomb.state === 'planted') {
      if (this.bomb.state === 'planted') this.ui.alert('COMMS JAMMED — BOMB ACTIVE', 'danger', 1800);
      return;
    }
    if (dist(this.player.x, this.player.y, EMERGENCY.x, EMERGENCY.y) > 90) {
      this.ui.alert('RETURN TO THE EMERGENCY PANEL', 'danger', 1500);
      return;
    }
    this.emergencyUsed = true;
    startMeeting(this, 'EMERGENCY MEETING', this.player, null);
  }

  plantBomb(agent) {
    const b = this.bomb;
    if (b.state !== 'carried') return;
    b.state = 'planted';
    b.x = agent.x;
    b.y = agent.y;
    b.timer = 45;
    b.beepT = 0;
    b.carrierId = null;
    b.defuseProgress = 0;
    this.audio.alarm();
    this.audio.plantTick();
    this.cam.shake = 12;
    this.spawnBurst(b.x, b.y, '#ff4d5e', 30, 160);
    this.ui.feed('BOMB PLANTED AT SITE A — 45 SECONDS', 'kill');
    this.ui.alert('BOMB PLANTED — DEFUSE OR DIE', 'danger', 3000);
    this.ui.setPhase('BOMB PLANTED', 45, true);
    for (const a of this.agents) {
      if (!a.alive) continue;
      if (a.isPlayer && a.isImpostor) this.ui.alert('BOMB PLANTED — HOLD SITE A', 'danger', 2200);
      else if (a.isPlayer) this.ui.alert('BOMB PLANTED — GET TO SITE A', 'danger', 2400);
    }
  }

  triggerSabotage(agent) {
    if (this.phase !== 'live' || this.lightsOut > 0 || this.sabotageCd > 0) return false;
    this.lightsOut = 18;
    this.sabotageCd = 48;
    this.audio.sabotage();
    this.ui.feed('LIGHTS SABOTAGED — BREAKER IN LONG', 'kill');
    if (!this.player.isImpostor) this.ui.alert('LIGHTS OUT — RESET THE BREAKER IN LONG', 'danger', 3000);
    else this.ui.alert('LIGHTS SABOTAGED — 18 SECONDS', 'info', 1800);
    for (const a of this.agents) {
      if (a.alive && !a.isImpostor && !a.isPlayer) { a.state = 'idle'; a.path = null; }
    }
    return true;
  }

  playerKnife() {
    if (this.phase !== 'live' || !this.player.alive || !this.player.isImpostor) return;
    const p = this.player;
    if (p.knifeCd > 0) { this.ui.alert(`STRIKE COOLDOWN ${Math.ceil(p.knifeCd)}s`, 'danger', 900); return; }
    let best = null, bestD = 1e9;
    for (const a of this.agents) {
      if (!a.alive || a.isPlayer || a.isImpostor) continue;
      const d = dist(p.x, p.y, a.x, a.y);
      if (d < 72 && d < bestD) {
        const ang = Math.atan2(a.y - p.y, a.x - p.x);
        if (Math.abs(angleDiff(p.angle, ang)) < 1.25) { best = a; bestD = d; }
      }
    }
    if (!best) { this.audio.knife(); this.ui.alert('NO TARGET IN RANGE', 'danger', 800); return; }
    p.knifeCd = 20;
    this.audio.knife();
    this.cam.shake = 7;
    this.spawnBurst(best.x, best.y, '#ff4d5e', 18, 120);
    this.killAgent(best, p, 'knife');
  }

  playerSabotage() {
    if (!this.player.alive || !this.player.isImpostor) return;
    if (this.triggerSabotage(this.player)) this.ui.alert('LIGHTS SABOTAGED', 'info', 1500);
    else this.ui.alert(`SABOTAGE COOLDOWN ${Math.ceil(this.sabotageCd)}s`, 'danger', 1100);
  }

  shoot(agent, angle, spread = 0) {
    if (agent.fireCd > 0 || agent.reloadT > 0 || agent.ammo <= 0 || !agent.alive) return false;
    agent.ammo--;
    agent.fireCd = agent.isPlayer ? 0.16 : rand(0.2, 0.32);
    agent.muzzle = 0.06;
    const a = angle + rand(-spread, spread);
    const sx = agent.x + Math.cos(a) * 24;
    const sy = agent.y + Math.sin(a) * 24;
    this.bullets.push({
      x: sx, y: sy, px: sx, py: sy, vx: Math.cos(a) * 1500, vy: Math.sin(a) * 1500,
      life: 0.7, ownerId: agent.id, isImpostor: agent.isImpostor,
      damage: agent.isPlayer ? 34 : (agent.isImpostor ? 20 : 24)
    });
    this.tracers.push({ x1: sx, y1: sy, x2: sx + Math.cos(a) * 60, y2: sy + Math.sin(a) * 60, life: 0.06, color: '#ffd08a' });
    this.spawnBurst(sx, sy, '#ffb545', 3, 50);
    this.audio.shoot();
    if (agent.isPlayer) {
      this.cam.shake = Math.max(this.cam.shake, 2.6);
      this.ui.crosshairFire();
      if (navigator.vibrate) navigator.vibrate(8);
    }
    return true;
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life -= dt;
      b.px = b.x; b.py = b.y;
      const steps = 3;
      let hit = false;
      for (let s = 0; s < steps && !hit; s++) {
        b.x += b.vx * dt / steps;
        b.y += b.vy * dt / steps;
        if (this.world.collides(b.x, b.y, 3)) {
          this.spawnBurst(b.x, b.y, '#c9b28a', 6, 80);
          this.tracers.push({ x1: b.px, y1: b.py, x2: b.x, y2: b.y, life: 0.08, color: '#ffd08a' });
          hit = true;
          break;
        }
        for (const a of this.agents) {
          if (!a.alive || a.id === b.ownerId) continue;
          if (dist2(b.x, b.y, a.x, a.y) < 18 * 18) {
            const owner = this.agents.find(x => x.id === b.ownerId);
            if (owner && owner.isImpostor && a.isImpostor) { hit = true; break; }
            this.damageAgent(a, b.damage, owner, 'gun');
            this.tracers.push({ x1: b.px, y1: b.py, x2: b.x, y2: b.y, life: 0.1, color: '#ff6b6b' });
            hit = true;
            break;
          }
        }
      }
      if (hit || b.life <= 0) this.bullets.splice(i, 1);
    }
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      this.tracers[i].life -= dt;
      if (this.tracers[i].life <= 0) this.tracers.splice(i, 1);
    }
  }

  damageAgent(agent, amount, source, method) {
    if (!agent.alive) return;
    agent.health -= amount;
    agent.hitFlash = 0.22;
    this.spawnBurst(agent.x, agent.y, '#a51f2a', 8, 90);
    this.audio.hit();
    if (agent.isPlayer) {
      this.hitFlash = Math.min(1, this.hitFlash + 0.55);
      this.cam.shake = Math.max(this.cam.shake, 5);
      if (navigator.vibrate) navigator.vibrate(18);
    }
    if (source && source.id !== agent.id) {
      agent.lastAttacker = source.id;
      agent.alerted = 4;
      if (source.isImpostor && !agent.isImpostor) {
        agent.knowsKiller = source.id;
        agent.sus[source.id] = 1;
        agent.retaliateT = 0.45;
      }
    }
    if (agent.health <= 0) this.killAgent(agent, source, method);
  }

  killAgent(victim, killer, method) {
    if (!victim.alive) return;
    victim.alive = false;
    victim.health = 0;
    victim.state = 'dead';
    this.bodies.push({
      id: victim.id, name: victim.name, color: victim.color, x: victim.x, y: victim.y,
      time: this.time, reported: false, killerId: killer ? killer.id : null
    });
    if (killer) {
      killer.kills++;
      if (killer.isPlayer) this.stats.kills++;
      if (!killer.isPlayer && killer.isImpostor) {
        killer.state = 'flee';
        killer.fleeT = 4;
        killer.path = null;
        killer.taskStation = null;
        killer.killCd = Math.max(killer.killCd, 28);
      }
      if (!killer.isImpostor && !victim.isImpostor) {
        killer.rogue = true;
        this.ui.feed(`FRIENDLY FIRE — ${killer.name} DOWNED ${victim.name}`, 'kill');
        for (const a of this.agents) if (a.alive && !a.isImpostor && a.id !== killer.id) a.sus[killer.id] = Math.max(a.sus[killer.id] || 0, 0.9);
      } else {
        this.ui.feed(`${victim.name} WAS ELIMINATED`, 'kill');
      }
    } else {
      this.ui.feed(`${victim.name} IS DOWN`, 'kill');
    }
    this.audio.kill();
    this.cam.shake = Math.max(this.cam.shake, 10);
    this.spawnBurst(victim.x, victim.y, '#ff4d5e', 26, 170);
    this.spawnBurst(victim.x, victim.y, '#5c1018', 18, 100);
    this.witnessKill(killer, victim);
    if (victim.isPlayer) {
      this.spectate = null;
      this.spectateTimer = 0;
      this.ui.setSpectate(true, method === 'knife' ? 'YOU WERE STABBED' : 'YOU WERE SHOT');
      this.ui.setContext(null);
      this.ui.setProgress('', 0, false);
      this.ui.alert('YOU ARE DOWN — SPECTATING', 'danger', 2600);
      if (navigator.vibrate) navigator.vibrate([40, 40, 80]);
    }
    this.checkWin();
  }

  witnessKill(killer, victim) {
    if (!killer) return;
    for (const a of this.agents) {
      if (!a.alive || a.isImpostor || a.id === killer.id || a.id === victim.id) continue;
      const sees = (dist(a.x, a.y, victim.x, victim.y) < 520 && this.world.los(a.x, a.y, victim.x, victim.y)) ||
        (dist(a.x, a.y, killer.x, killer.y) < 520 && this.world.los(a.x, a.y, killer.x, killer.y));
      if (!sees) continue;
      a.sus[killer.id] = 1;
      a.knowsKiller = killer.id;
      a.witnessed = { killerId: killer.id, victim: victim.name, zone: this.world.zoneAt(victim.x, victim.y) };
      if (a.isPlayer) {
        killer.revealedToPlayer = true;
        this.ui.alert(`YOU SAW ${killer.name} KILL ${victim.name}`, 'danger', 3000);
        this.ui.feed(`WITNESSED: ${killer.name} KILLED ${victim.name}`, 'kill');
      }
    }
  }

  spawnBurst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(speed * 0.2, speed);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rand(0.25, 0.7), max: 0.7, size: rand(1.2, 3.4), color
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  canSee(a, b, range = 600) {
    const r = this.lightsOut > 0 && !a.isImpostor ? Math.min(range, 330) : range;
    return dist(a.x, a.y, b.x, b.y) < r && this.world.los(a.x, a.y, b.x, b.y);
  }

  checkWin() {
    if (this.phase !== 'live' && this.phase !== 'meeting') return;
    const aliveImps = this.agents.filter(a => a.alive && a.isImpostor);
    const aliveCrew = this.agents.filter(a => a.alive && !a.isImpostor);
    if (aliveImps.length === 0) { this.endRound('crew', 'Every infiltrator was eliminated or ejected.'); return; }
    if (aliveImps.length > aliveCrew.length) { this.endRound('impostor', 'The impostors outnumbered the crew.'); return; }
  }

  endRound(winner, reason) {
    if (this.phase === 'over') return;
    this.phase = 'over';
    this.paused = false;
    this.taskOpen = false;
    this.useHeld = false;
    this.input.fireHeld = false;
    this.input.aim.firing = false;
    this.ui.closeTask();
    this.ui.setHUD(true);
    this.ui.setProgress('', 0, false);
    this.ui.setContext(null);
    const playerWon = (winner === 'crew' && !this.player.isImpostor) || (winner === 'impostor' && this.player.isImpostor);
    if (playerWon) this.audio.win(); else this.audio.lose();
    const rounds = safeLocal('dp_rounds', 0) + 1;
    const wins = safeLocal('dp_wins', 0) + (playerWon ? 1 : 0);
    safeStore('dp_rounds', rounds); safeStore('dp_wins', wins);
    const reveal = this.agents.map(a => ({
      name: a.name, color: a.color, isImpostor: a.isImpostor, alive: a.alive,
      isPlayer: a.isPlayer, kills: a.kills
    }));
    this.ui.showEnd({
      winner, reason, playerWon, reveal,
      stats: {
        tasks: this.intel, kills: this.stats.kills, reports: this.stats.reports,
        rounds, wins, time: formatTime(this.roundTime)
      }
    });
    this.ui.setSpectate(false);
    this.ui.setCrew(this.agents, this.player, this.player.isImpostor);
    this.ui.updateHUD(this);
  }

  teleportToSpawns() {
    const alive = this.agents.filter(a => a.alive);
    const spots = shuffle(this.world.spawns);
    alive.forEach((a, i) => {
      const s = spots[i % spots.length];
      a.x = s.x + rand(-10, 10); a.y = s.y + rand(-10, 10);
      a.path = null; a.pathIdx = 0; a.state = 'idle'; a.taskStation = null;
      a.angle = rand(0, TAU); a.stunned = 0; a.fixProgress = 0; a.plantProgress = 0;
    });
    this.bodies = [];
    this.bullets = [];
  }

  setPaused(p) {
    if (this.phase !== 'live' && this.phase !== 'meeting' && this.phase !== 'deploy') return;
    this.paused = p;
    this.input.fireHeld = false;
    this.input.aim.firing = false;
    if (p) this.ui.showPause(); else this.ui.hidePause();
  }

  setRolePref(role) {
    this.settings.role = role;
    safeStore('dp_role', role);
    this.ui.setRoleLabel(role);
  }

  setSound(on) {
    this.settings.sound = on;
    safeStore('dp_sound', on);
    this.audio.setMuted(!on);
    this.ui.setSoundLabel(on);
  }

  castVote(targetId) { castPlayerVote(this, targetId); }
  accuse(targetId) { accusePlayer(this, targetId); }
  quickChat(kind) { quickChat(this, kind); }

  render() { renderGame(this); }
}
