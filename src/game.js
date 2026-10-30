import {
  TILE, WORLD_W, WORLD_H, TASKS, VENTS, BOMB_SITES, EMERGENCY, SPAWNS,
  centerOf, circleHitsWorld, isSolidAt, lineClear, roomNameAt, findPath, ROOMS,
} from "./map.js";
import { updateBot } from "./bots.js";
import { triggerMeeting, updateMeeting, castPlayerVote } from "./meetings.js";

export const MATCH_TIME = 200;
export const TASK_DURATION = 3.6;
export const DEFUSE_TIME = 9;
export const SABOTAGE_TIME = 38;
export const PLAYER_RADIUS = 10;

export const CREW_COLORS = [
  { name: "TEAL", body: "#3dd6c4", dark: "#1b8f86", visor: "#d9ffff" },
  { name: "RED", body: "#ff5a5f", dark: "#a82d34", visor: "#ffe1e3" },
  { name: "BLUE", body: "#5a91ff", dark: "#2f559f", visor: "#e3efff" },
  { name: "LIME", body: "#9adb52", dark: "#56882a", visor: "#f1ffd9" },
  { name: "PINK", body: "#ff79bd", dark: "#a83f76", visor: "#ffe6f2" },
  { name: "ORANGE", body: "#ffa14d", dark: "#a85d1c", visor: "#fff0dd" },
  { name: "YELLOW", body: "#f5d75c", dark: "#a68b25", visor: "#fffbe0" },
  { name: "PURPLE", body: "#b184ff", dark: "#6f47b5", visor: "#f1e8ff" },
];

const BOT_NAMES = ["VEX", "NOVA", "ROOK", "JUNO", "ECHO", "MOTH", "SABLE", "KILO", "PIP", "ZINC", "HALO", "ONYX"];

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export class Game {
  constructor({ audio = null, onEvent = null } = {}) {
    this.audio = audio;
    this.onEvent = onEvent;
    this.phase = "idle";
    this.time = 0;
    this.roundTime = MATCH_TIME;
    this.players = [];
    this.bodies = [];
    this.tracers = [];
    this.particles = [];
    this.noises = [];
    this.taskState = {};
    this.sabotage = null;
    this.meeting = null;
    this.result = null;
    this.player = null;
    this.input = { mx: 0, my: 0, aim: 0, firing: false };
    this.action = null;
    this.stats = { tasks: 0, kills: 0, votes: 0, reports: 0 };
    this.tasksDone = 0;
    this.endTimer = 0;
    this.flash = 0;
    this.shake = 0;
    this.lastKill = 0;
    this.sabotageDisabledUntil = 0;
    this.impostorIds = [];
    this.seed = Math.random() * 1000;
    this.hintTimer = 0;
  }

  emit(type, data) {
    if (this.onEvent) this.onEvent(type, data);
  }

  toast(text, tone = "info") {
    this.emit("toast", { text, tone });
  }

  start(roleChoice = "crew", colorIndex = 0) {
    this.phase = "reveal";
    this.time = 0;
    this.roundTime = MATCH_TIME;
    this.players = [];
    this.bodies = [];
    this.tracers = [];
    this.particles = [];
    this.noises = [];
    this.sabotage = null;
    this.meeting = null;
    this.result = null;
    this.action = null;
    this.tasksDone = 0;
    this.stats = { tasks: 0, kills: 0, votes: 0, reports: 0 };
    this.taskState = {};
    this.flash = 0;
    this.shake = 0;
    this.sabotageDisabledUntil = 20;
    this.hintTimer = 0;

    for (const t of TASKS) {
      this.taskState[t.id] = { done: false, progress: 0, workerId: null };
    }

    const colors = shuffle(CREW_COLORS);
    const playerColor = CREW_COLORS[colorIndex % CREW_COLORS.length];
    const others = colors.filter((c) => c !== playerColor);
    const namePool = shuffle(BOT_NAMES);

    const players = [];
    players.push({
      id: 0, name: "YOU", color: playerColor, isPlayer: true, role: "crew",
      x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, radius: PLAYER_RADIUS,
      hp: 100, alive: true, ghost: false, ejected: false,
      ammo: 6, reserve: 12, reloading: false, reloadT: 0, fireCd: 0,
      knifeCd: 9, sabotageCd: 24, ventCd: 0, kills: 0, tasksDone: 0,
      memory: { events: [], sus: {} }, bot: null, fakeTasks: new Set(),
      lastAction: 0, deathAt: 0, inCombat: 0,
    });

    for (let i = 1; i < 7; i++) {
      players.push({
        id: i, name: namePool[i - 1], color: others[i - 1], isPlayer: false, role: "crew",
        x: 0, y: 0, vx: 0, vy: 0, angle: rand(0, Math.PI * 2), radius: PLAYER_RADIUS,
        hp: 100, alive: true, ghost: false, ejected: false,
        ammo: 6, reserve: 12, reloading: false, reloadT: 0, fireCd: 0,
        knifeCd: 20, sabotageCd: 36, ventCd: 0, kills: 0, tasksDone: 0,
        memory: { events: [], sus: {} },
        bot: {
          state: "idle", path: [], pathT: 0, goal: null, taskId: null,
          taskT: 0, thinkT: 0, repath: 0, stuckT: 0, lastX: 0, lastY: 0,
          combatTarget: null, combatUntil: 0, reportBodyId: null,
          ventGoal: null, fakeTaskId: null, voteAt: 0, wanderT: 0,
          noiseGoal: null, noiseUntil: 0, scanT: 0,
        },
        lastAction: 0, deathAt: 0, inCombat: 0,
      });
    }

    // two impostors. Role choice is a showcase convenience for this demo.
    const impCount = 2;
    let impostors;
    if (roleChoice === "impostor") {
      impostors = new Set([0, ...shuffle([1, 2, 3, 4, 5, 6]).slice(0, impCount - 1)]);
    } else if (roleChoice === "crew") {
      impostors = new Set(shuffle([1, 2, 3, 4, 5, 6]).slice(0, impCount));
    } else {
      const forceImp = Math.random() < 0.5;
      const pool = [1, 2, 3, 4, 5, 6];
      const chosen = shuffle(pool).slice(0, forceImp ? impCount - 1 : impCount);
      impostors = new Set(forceImp ? [0, ...chosen] : chosen);
    }
    for (const i of impostors) players[i].role = "impostor";
    this.impostorIds = [...impostors];

    const spawns = shuffle(SPAWNS);
    players.forEach((p, i) => {
      const [tx, ty] = spawns[i % spawns.length];
      const c = centerOf(tx, ty);
      p.x = c.x + rand(-5, 5);
      p.y = c.y + rand(-5, 5);
      p.angle = Math.atan2(WORLD_H / 2 - p.y, WORLD_W / 2 - p.x);
    });

    this.players = players;
    this.player = players[0];
    this.player.angle = -Math.PI / 2;
    const mates = players.filter((p) => p.role === "impostor" && p !== this.player);
    this.emit("roleReveal", {
      role: this.player.role,
      mates: this.player.role === "impostor" ? mates.map((m) => ({ name: m.name, color: m.color })) : [],
      tasks: TASKS,
    });
  }

  beginRound() {
    if (this.phase !== "reveal") return;
    this.phase = "playing";
    this.roundTime = MATCH_TIME;
    this.time = 0;
    this.audio?.startAlarm?.();
    this.emit("roundStart", {});
    this.toast("ROUND LIVE — SECURE THE FACILITY", "info");
  }

  update(dt) {
    dt = Math.min(dt, 0.1);
    this.time += dt;
    this.flash = Math.max(0, this.flash - dt * 2.2);
    this.shake = Math.max(0, this.shake - dt * 24);
    this.updateVisuals(dt);

    if (this.phase === "playing") {
      this.roundTime = Math.max(0, this.roundTime - dt);
      this.updatePlayer(dt);
      for (const p of this.players) {
        if (p === this.player) continue;
        updateBot(this, p, dt);
      }
      this.updateAction(dt);
      for (const p of this.players) this.updateActor(p, dt);
      this.updateSabotage(dt);
      this.updateBodies(dt);
      this.checkWin();
      if (this.phase === "playing" && this.roundTime <= 0) {
        this.endRound("impostor", "The containment window expired. The crew failed to secure the facility.");
      }
    } else if (this.phase === "meeting") {
      this.updateMeeting(dt);
    } else if (this.phase === "ending") {
      this.endTimer -= dt;
      if (this.endTimer <= 0) {
        this.phase = "results";
        this.emit("results", this.result);
      }
    }
  }

  updateVisuals(dt) {
    for (const t of this.tracers) t.life -= dt;
    this.tracers = this.tracers.filter((t) => t.life > 0);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const n of this.noises) n.life -= dt;
    this.noises = this.noises.filter((n) => n.life > 0);
  }

  updatePlayer(dt) {
    const p = this.player;
    if (!p) return;
    const inp = this.input;

    if (!p.ghost) {
      let mx = inp.mx, my = inp.my;
      const mag = Math.hypot(mx, my);
      if (mag > 1) { mx /= mag; my /= mag; }
      const speed = p.role === "impostor" ? 148 : 143;
      const accel = 12;
      p.vx = lerp(p.vx, mx * speed, Math.min(1, accel * dt));
      p.vy = lerp(p.vy, my * speed, Math.min(1, accel * dt));
      if (Math.abs(p.vx) < 2) p.vx = 0;
      if (Math.abs(p.vy) < 2) p.vy = 0;
      this.moveEntity(p, p.vx * dt, p.vy * dt, false);
    } else {
      let mx = inp.mx, my = inp.my;
      const mag = Math.hypot(mx, my);
      if (mag > 1) { mx /= mag; my /= mag; }
      p.x = clamp(p.x + mx * 210 * dt, 8, WORLD_W - 8);
      p.y = clamp(p.y + my * 210 * dt, 8, WORLD_H - 8);
    }

    if (inp.aim !== undefined && (!p.ghost || p.role === "impostor")) {
      p.angle = inp.aim;
    }
    if (inp.firing && p.alive && !this.action) this.fire(p);

  }

  updateActor(p, dt) {
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.knifeCd = Math.max(0, p.knifeCd - dt);
    p.sabotageCd = Math.max(0, p.sabotageCd - dt);
    p.ventCd = Math.max(0, p.ventCd - dt);
    if (!p.alive) return;
    if (p.reloading) {
      p.reloadT -= dt;
      if (p.reloadT <= 0) {
        const take = Math.min(6 - p.ammo, p.reserve);
        p.ammo += take;
        p.reserve -= take;
        p.reloading = false;
      }
    }
  }

  moveEntity(p, dx, dy, ghost) {
    if (ghost) {
      p.x = clamp(p.x + dx, 8, WORLD_W - 8);
      p.y = clamp(p.y + dy, 8, WORLD_H - 8);
      return;
    }
    if (!circleHitsWorld(p.x + dx, p.y, p.radius)) p.x += dx;
    if (!circleHitsWorld(p.x, p.y + dy, p.radius)) p.y += dy;
    p.x = clamp(p.x, p.radius, WORLD_W - p.radius);
    p.y = clamp(p.y, p.radius, WORLD_H - p.radius);
  }

  reload(p = this.player) {
    if (!p || !p.alive || p.reloading || p.ammo >= 6 || p.reserve <= 0) return;
    p.reloading = true;
    p.reloadT = 1.25;
    this.audio?.reload();
    this.emit("reloadStart", {});
  }

  fire(shooter) {
    if (!shooter.alive || shooter.reloading || shooter.fireCd > 0) return;
    if (shooter.ammo <= 0) {
      this.audio?.dry();
      if (shooter.reserve > 0) this.reload(shooter);
      shooter.fireCd = 0.35;
      return;
    }
    shooter.ammo--;
    shooter.fireCd = 0.27;
    this.shake = Math.max(this.shake, shooter.isPlayer ? 3.2 : 1.2);

    let angle = shooter.angle;
    // light aim magnetism toward the nearest visible actor (players get wider assist)
    let assistBest = null, assistDiff = shooter.isPlayer ? 0.14 : 0.2;
    const preferred = !shooter.isPlayer && shooter.bot?.combatTarget != null
      ? this.players.find((q) => q.id === shooter.bot.combatTarget && q.alive)
      : null;
    const candidates = preferred ? [preferred] : (shooter.isPlayer ? this.players : []);
    for (const q of candidates) {
      if (q === shooter || !q.alive) continue;
      const d = dist(shooter, q);
      if (d > 620) continue;
      const a = Math.atan2(q.y - shooter.y, q.x - shooter.x);
      const diff = Math.abs(angleDiff(a, angle));
      if (diff < assistDiff && lineClear(shooter.x, shooter.y, q.x, q.y)) {
        assistDiff = diff;
        assistBest = q;
      }
    }
    if (assistBest) {
      const a = Math.atan2(assistBest.y - shooter.y, assistBest.x - shooter.x);
      angle = angle + angleDiff(a, angle) * 0.55;
    }
    angle += rand(-0.018, 0.018);

    let wallDist = 700;
    const step = 7;
    for (let d = step; d < 700; d += step) {
      if (isSolidAt(shooter.x + Math.cos(angle) * d, shooter.y + Math.sin(angle) * d)) {
        wallDist = d - step;
        break;
      }
    }
    let hit = null, hitDist = wallDist;
    for (const q of this.players) {
      if (q === shooter || !q.alive) continue;
      const dx = q.x - shooter.x, dy = q.y - shooter.y;
      const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
      if (proj <= 8 || proj > hitDist) continue;
      const perp = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
      if (perp < q.radius + 3) {
        hit = q;
        hitDist = proj;
      }
    }
    const ex = shooter.x + Math.cos(angle) * hitDist;
    const ey = shooter.y + Math.sin(angle) * hitDist;
    this.tracers.push({
      x1: shooter.x + Math.cos(angle) * 12, y1: shooter.y + Math.sin(angle) * 12,
      x2: ex, y2: ey, life: 0.1, color: shooter.isPlayer ? "#ffe6a3" : "#ffb27a",
    });
    this.noises.push({ x: shooter.x, y: shooter.y, life: 2.2, radius: 470, kind: "shot" });
    for (const b of this.players) {
      if (!b.alive || b.role === "impostor" || b === shooter || !b.bot) continue;
      if (dist(b, shooter) < 470) {
        if (Math.random() < 0.45) {
          b.bot.noiseGoal = { x: shooter.x, y: shooter.y };
          b.bot.noiseUntil = this.time + 4;
        }
        b.memory.events.push({ type: "heardShot", x: shooter.x, y: shooter.y, t: this.time });
        if (b.memory.events.length > 8) b.memory.events.shift();
      }
    }
    this.audio?.shot(shooter.isPlayer);
    if (hit) {
      for (const b of this.players) {
        if (!b.alive || !b.bot || b === shooter || b === hit) continue;
        if (dist(b, shooter) < 380 && lineClear(b.x, b.y, shooter.x, shooter.y)) {
          if (!b.memory.events.some((e) => e.type === "sawShoot" && e.target === shooter.id && this.time - e.t < 6)) {
            b.memory.events.push({ type: "sawShoot", target: shooter.id, victim: hit.id, room: roomNameAt(hit.x, hit.y), t: this.time });
            if (b.memory.events.length > 8) b.memory.events.shift();
          }
        }
      }
      this.damage(hit, 34, shooter, "shot");
      this.burst(ex, ey, "#ff6b5a", 8);
    } else {
      this.burst(ex, ey, "#ffd9a0", 4);
    }
    if (!shooter.isPlayer) shooter.inCombat = 2.5;
  }

  damage(victim, amount, attacker, cause) {
    if (!victim.alive) return;
    victim.hp -= amount;
    this.flash = Math.max(this.flash, victim.isPlayer ? 0.55 : 0.12);
    if (victim.isPlayer) this.shake = Math.max(this.shake, 7);
    this.audio?.hit(victim.isPlayer);
    this.burst(victim.x, victim.y, "#e8504d", 7);
    if (victim.hp <= 0) {
      this.kill(victim, attacker, cause);
    } else if (victim.bot && attacker && attacker.alive) {
      victim.bot.combatTarget = attacker.id;
      victim.bot.combatUntil = this.time + 3;
      victim.memory.events.push({ type: "wasShot", target: attacker.id, t: this.time });
      if (victim.memory.events.length > 8) victim.memory.events.shift();
    }
  }

  kill(victim, attacker, cause) {
    if (!victim.alive) return;
    victim.alive = false;
    victim.hp = 0;
    victim.deathAt = this.time;
    victim.vx = 0; victim.vy = 0;
    const body = {
      id: `body_${victim.id}_${this.time.toFixed(2)}`,
      victimId: victim.id, name: victim.name, color: victim.color,
      x: victim.x, y: victim.y, room: roomNameAt(victim.x, victim.y),
      created: this.time, found: false, cause,
    };
    this.bodies.push(body);
    if (attacker) {
      attacker.kills++;
      if (attacker.isPlayer) this.stats.kills++;
      this.lastKill = this.time;
    }
    this.audio?.death();
    this.shake = Math.max(this.shake, 6);
    this.burst(victim.x, victim.y, "#b3262f", 18);

    for (const b of this.players) {
      if (!b.alive || !b.bot || b === attacker || b === victim) continue;
      if (dist(b, victim) < 340 && lineClear(b.x, b.y, victim.x, victim.y)) {
        if (cause === "knife" || cause === "shot") {
          b.memory.events.push({
            type: "sawKill", target: attacker.id, victim: victim.id,
            room: roomNameAt(victim.x, victim.y), t: this.time,
          });
          if (b.memory.events.length > 8) b.memory.events.shift();
          if (b.role === "crew") {
            b.bot.combatTarget = attacker.id;
            b.bot.combatUntil = this.time + 3.4;
            b.bot.reportBodyId = body.id;
          }
        }
      }
    }

    if (victim.isPlayer) {
      victim.ghost = true;
      victim.reloading = false;
      this.action = null;
      this.emit("playerDown", { cause, ghost: victim.role === "crew" });
      this.toast(victim.role === "crew" ? "ELIMINATED — GHOST PROTOCOL ACTIVE" : "ELIMINATED — SPECTATING", "bad");
    }
    this.checkWin();
  }

  burst(x, y, color, n = 6) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), s = rand(25, 150);
      this.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rand(0.18, 0.55), max: 0.55, color, size: rand(1.5, 3.5),
      });
    }
  }

  getContext() {
    const p = this.player;
    if (!p || this.phase !== "playing") return null;
    const alive = p.alive;

    if (alive) {
      const body = this.nearestBody(p.x, p.y, 58);
      if (body) return { type: "report", label: "REPORT", sub: "BODY FOUND", target: body.id, ready: true };
    }

    if (p.role === "impostor" && alive) {
      const victim = this.nearestOther(p, 50, (q) => q.role !== "impostor");
      if (victim) {
        return {
          type: "kill", label: "KILL", sub: p.knifeCd > 0 ? `${Math.ceil(p.knifeCd)}s` : "SILENT",
          target: victim.id, ready: p.knifeCd <= 0, tone: "kill",
        };
      }
    }

    if (this.sabotage && p.role === "crew" && alive) {
      const site = BOMB_SITES.find((s) => s.id === this.sabotage.siteId);
      const c = centerOf(site.tx, site.ty);
      if (Math.hypot(c.x - p.x, c.y - p.y) < 66) {
        return { type: "defuse", label: "DEFUSE", sub: "HOLD", target: site.id, ready: true, tone: "danger" };
      }
    }

    const task = this.nearestTask(p.x, p.y, 64);
    if (task) {
      const isFake = p.role === "impostor";
      return {
        type: "task", label: isFake ? "FAKE" : "USE",
        sub: isFake ? "BLEND IN" : "HOLD", target: task.id, ready: true,
        tone: isFake ? "kill" : "task",
      };
    }

    if (p.role === "impostor" && alive) {
      const vent = VENTS.find((v) => {
        const c = centerOf(v.tx, v.ty);
        return Math.hypot(c.x - p.x, c.y - p.y) < 46;
      });
      if (vent) return { type: "vent", label: "VENT", sub: p.ventCd > 0 ? `${Math.ceil(p.ventCd)}s` : "TRAVEL", target: vent.id, ready: p.ventCd <= 0, tone: "kill" };
    }

    if (alive) {
      const e = centerOf(EMERGENCY.tx, EMERGENCY.ty);
      if (Math.hypot(e.x - p.x, e.y - p.y) < 62) {
        return { type: "meeting", label: "MEET", sub: "EMERGENCY", target: "emergency", ready: true, tone: "warn" };
      }
    }

    return null;
  }

  nearestBody(x, y, range) {
    let best = null, bd = range;
    for (const b of this.bodies) {
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }

  nearestTask(x, y, range) {
    let best = null, bd = range;
    for (const t of TASKS) {
      if (this.taskState[t.id].done) continue;
      const c = centerOf(t.tx, t.ty);
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  }

  nearestOther(p, range, filter = () => true) {
    let best = null, bd = range;
    for (const q of this.players) {
      if (q === p || !q.alive || !filter(q)) continue;
      const d = dist(p, q);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  }

  pressAction() {
    if (this.phase !== "playing") return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (!ctx.ready) {
      if (ctx.type === "kill") this.toast(`KNIFE RECHARGING — ${Math.ceil(this.player.knifeCd)}s`, "warn");
      if (ctx.type === "vent") this.toast(`VENT SEALED — ${Math.ceil(this.player.ventCd)}s`, "warn");
      return;
    }
    if (ctx.type === "report") {
      const body = this.bodies.find((b) => b.id === ctx.target);
      if (body) this.triggerMeeting("report", this.player, body);
      return;
    }
    if (ctx.type === "meeting") {
      this.triggerMeeting("emergency", this.player, null);
      return;
    }
    if (ctx.type === "kill") {
      const victim = this.players.find((q) => q.id === ctx.target);
      if (victim && dist(victim, this.player) < 56) this.knifeKill(this.player, victim);
      return;
    }
    if (ctx.type === "vent") {
      this.useVent(this.player, VENTS.find((v) => v.id === ctx.target));
      return;
    }
    if (ctx.type === "task" || ctx.type === "defuse") {
      if (this.action) return;
      this.action = {
        type: ctx.type, target: ctx.target, progress: 0,
        duration: ctx.type === "task" ? (this.player.ghost ? 2.8 : TASK_DURATION) : DEFUSE_TIME,
      };
      this.audio?.holdStart();
      this.emit("actionStart", ctx);
    }
  }

  releaseAction() {
    if (!this.action) return;
    if (this.action.type === "task") {
      const st = this.taskState[this.action.target];
      if (st) { st.progress = 0; st.workerId = null; }
    }
    this.action = null;
    this.audio?.holdStop();
    this.emit("actionEnd", {});
  }

  updateAction(dt) {
    const p = this.player;
    if (!p || !this.action) return;
    const a = this.action;
    if (a.type === "task") {
      const task = TASKS.find((t) => t.id === a.target);
      if (!task || this.taskState[task.id].done) { this.releaseAction(); return; }
      const c = centerOf(task.tx, task.ty);
      if (Math.hypot(c.x - p.x, c.y - p.y) > 74) { this.releaseAction(); return; }
      const st = this.taskState[task.id];
      st.progress = clamp(st.progress + dt / a.duration, 0, 1);
      a.progress = st.progress;
      if (st.progress >= 1) {
        this.action = null;
        if (p.role === "impostor") {
          p.fakeTasks.add(task.id);
          this.toast("TASK LOGGED — NOBODY SAW THAT", "kill");
          this.audio?.fake();
          this.emit("actionEnd", {});
        } else {
          this.completeTask(task, p);
        }
      }
    } else if (a.type === "defuse") {
      const site = BOMB_SITES.find((s) => s.id === a.target);
      const c = centerOf(site.tx, site.ty);
      if (!this.sabotage || this.sabotage.siteId !== site.id || Math.hypot(c.x - p.x, c.y - p.y) > 78) {
        this.releaseAction();
        return;
      }
      a.progress = this.sabotage.defuse / 100;
      if (this.sabotage.defuse >= 100) { this.action = null; this.emit("actionEnd", {}); }
    }
  }

  completeTask(task, p) {
    const st = this.taskState[task.id];
    if (!st || st.done) return;
    st.done = true;
    st.progress = 1;
    st.workerId = null;
    this.tasksDone = Object.values(this.taskState).filter((s) => s.done).length;
    if (p) {
      p.tasksDone++;
      if (p.isPlayer) this.stats.tasks++;
    }
    this.audio?.task();
    this.shake = Math.max(this.shake, 1.5);
    this.burst(centerOf(task.tx, task.ty).x, centerOf(task.tx, task.ty).y, "#5ce1c0", 12);
    this.toast(`TASK COMPLETE — ${task.name.toUpperCase()}`, "good");
    this.emit("taskComplete", { task });
    this.checkWin();
  }

  knifeKill(killer, victim) {
    if (killer.knifeCd > 0 || !victim.alive) return;
    killer.knifeCd = 22;
    this.audio?.knife();
    this.burst(victim.x, victim.y, "#ff3b4e", 14);
    this.kill(victim, killer, "knife");
    this.toast("SILENT KILL", "kill");
  }

  useVent(p, vent) {
    if (!vent || p.ventCd > 0) return;
    const pair = VENTS.find((v) => v.id === vent.pair);
    const c = centerOf(pair.tx, pair.ty);
    this.audio?.vent();
    this.burst(p.x, p.y, "#8b8f9a", 10);
    p.x = c.x;
    p.y = c.y;
    p.ventCd = 7;
    this.shake = Math.max(this.shake, 2);
    for (const b of this.players) {
      if (!b.alive || !b.bot || b.role === "impostor" || b === p) continue;
      if (dist(b, p) < 260 && lineClear(b.x, b.y, p.x, p.y)) {
        b.memory.events.push({ type: "sawVent", target: p.id, room: roomNameAt(p.x, p.y), t: this.time });
        if (b.memory.events.length > 8) b.memory.events.shift();
      }
    }
    this.toast("VENTED", "kill");
  }

  triggerSabotage(byPlayer = false, forceSite = null, actor = null) {
    if (this.phase !== "playing" || this.sabotage) return;
    const imp = actor || (byPlayer ? this.player : this.players.find((p) => p.role === "impostor" && p.alive));
    if (!imp || imp.sabotageCd > 0) return;
    const site = forceSite || pick(BOMB_SITES);
    this.sabotage = {
      siteId: site.id, timeLeft: SABOTAGE_TIME, defuse: 0, started: this.time,
      by: imp.id, explosions: 0,
    };
    imp.sabotageCd = 48;
    this.audio?.sabotage();
    this.flash = Math.max(this.flash, 0.7);
    this.shake = Math.max(this.shake, 8);
    this.toast("SABOTAGE DETECTED — BOMB ARMED", "danger");
    this.emit("sabotageStart", { site: site.id });
    for (const p of this.players) {
      if (p.bot && p.alive) {
        p.bot.goal = null;
        p.bot.path = [];
      }
    }
  }

  playerSabotage() {
    if (this.phase !== "playing") return;
    const p = this.player;
    if (!p || p.role !== "impostor" || !p.alive) return;
    if (this.sabotage) { this.toast("A SABOTAGE IS ALREADY ACTIVE", "warn"); return; }
    if (p.sabotageCd > 0) { this.toast(`SABOTAGE RECHARGING — ${Math.ceil(p.sabotageCd)}s`, "warn"); return; }
    this.triggerSabotage(true, null, p);
  }

  updateSabotage(dt) {
    if (!this.sabotage) return;
    const s = this.sabotage;
    s.timeLeft = Math.max(0, s.timeLeft - dt);
    const site = BOMB_SITES.find((b) => b.id === s.siteId);
    const c = centerOf(site.tx, site.ty);
    let defusers = 0;
    for (const p of this.players) {
      if (!p.alive || p.role !== "crew") continue;
      if (p.isPlayer) {
        if (this.action?.type === "defuse") defusers = Math.max(defusers, 1);
      } else if (p.bot && Math.hypot(p.x - c.x, p.y - c.y) < 58) {
        defusers = 1;
      }
    }
    if (defusers > 0) {
      s.defuse = clamp(s.defuse + (100 / DEFUSE_TIME) * dt, 0, 100);
      if (Math.random() < dt * 1.4) this.audio?.defuseTick();
    } else {
      s.defuse = Math.max(0, s.defuse - dt * 1.4);
    }
    if (s.defuse >= 100) {
      this.sabotage = null;
      this.action = null;
      this.audio?.defused();
      this.toast("BOMB DEFUSED — NICE WORK", "good");
      this.emit("sabotageEnd", {});
      return;
    }
    if (s.timeLeft <= 0) {
      this.sabotage = null;
      this.audio?.explode();
      this.flash = 1;
      this.shake = 20;
      this.endRound("impostor", "The sabotage bomb detonated. The facility is lost.");
    }
  }

  updateBodies(dt) {
    // bodies remain until reported or the round ends
  }

  checkWin() {
    if (this.phase !== "playing") return;
    const alive = this.players.filter((p) => p.alive);
    const imps = alive.filter((p) => p.role === "impostor");
    const crew = alive.filter((p) => p.role === "crew");
    if (imps.length === 0) {
      this.endRound("crew", "Every impostor was eliminated. The facility is secure.");
      return;
    }
    if (this.tasksDone >= TASKS.length) {
      this.endRound("crew", "All systems secured. The crew completed every task.");
      return;
    }
    if (imps.length >= crew.length) {
      this.endRound("impostor", "Impostors reached parity. The crew can no longer resist.");
    }
  }

  triggerMeeting(type, reporter, body) {
    return triggerMeeting(this, type, reporter, body);
  }

  updateMeeting(dt) {
    return updateMeeting(this, dt);
  }

  castPlayerVote(targetId) {
    return castPlayerVote(this, targetId);
  }

  endRound(winner, reason) {
    if (this.phase === "ending" || this.phase === "results") return;
    if (this.phase === "meeting") {
      this.meeting = null;
    }
    this.phase = "ending";
    this.endTimer = 2.4;
    this.result = {
      winner, reason,
      yourRole: this.player?.role,
      survived: this.player?.alive,
      stats: { ...this.stats },
      players: this.players.map((p) => ({
        name: p.name, color: p.color, role: p.role, alive: p.alive,
        ejected: p.ejected, isPlayer: p.isPlayer,
      })),
      tasksDone: this.tasksDone, tasksTotal: TASKS.length,
      timeLeft: this.roundTime,
    };
    this.action = null;
    this.input.firing = false;
    if (winner === "crew") this.audio?.win(); else this.audio?.lose();
    this.emit("roundEnding", this.result);
  }
}
