import {
  TASKS, VENTS, BOMB_SITES, centerOf, lineClear, findPath, roomNameAt,
} from "./map.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

const TASK_DURATION = 4.6;
const CREW_SPEED = 112;
const IMP_SPEED = 121;

function clearShot(game, p, target) {
  const dx = target.x - p.x, dy = target.y - p.y;
  const d = Math.hypot(dx, dy) || 1;
  for (const q of game.players) {
    if (q === p || q === target || !q.alive) continue;
    const proj = ((q.x - p.x) * dx + (q.y - p.y) * dy) / d;
    if (proj < 8 || proj > d - 8) continue;
    const perp = Math.abs(-(q.x - p.x) * dy / d + (q.y - p.y) * dx / d);
    if (perp < q.radius + 9) return false;
  }
  return lineClear(p.x, p.y, target.x, target.y);
}

function visibleBody(game, p, range) {
  let best = null, bd = range;
  for (const b of game.bodies) {
    const d = Math.hypot(b.x - p.x, b.y - p.y);
    if (d < bd && lineClear(p.x, p.y, b.x, b.y)) { bd = d; best = b; }
  }
  return best;
}

function pickTask(game, p) {
  let best = null, bestScore = Infinity;
  for (const t of TASKS) {
    const st = game.taskState[t.id];
    if (st.done) continue;
    const c = centerOf(t.ax, t.ay);
    let score = Math.hypot(c.x - p.x, c.y - p.y) + rand(0, 110);
    for (const q of game.players) {
      if (q === p || !q.alive || q.role !== "crew" || !q.bot) continue;
      const qd = Math.hypot(c.x - q.x, c.y - q.y);
      if (qd < score - 60) score += 180;
    }
    if (st.workerId !== null && st.workerId !== p.id) score += 90;
    if (score < bestScore) { bestScore = score; best = t; }
  }
  if (best) {
    game.taskState[best.id].workerId = p.id;
  }
  return best;
}

function stopTask(game, p, reset = false) {
  if (!p.bot.taskId) return;
  const st = game.taskState[p.bot.taskId];
  if (st && (st.workerId === p.id || reset)) {
    if (!st.done) { st.progress = 0; if (st.workerId === p.id) st.workerId = null; }
  }
  p.bot.taskId = null;
  p.bot.taskT = 0;
}

function nearestVent(p, range = 300) {
  let best = null, bd = range;
  for (const v of VENTS) {
    const c = centerOf(v.tx, v.ty);
    const d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < bd) { bd = d; best = v; }
  }
  return best;
}

export function updateBot(game, p, dt) {
  if (!p || !p.alive || !p.bot) return;
  if (p.reloading) {
    // handled globally
  } else if (p.ammo <= 0 && p.reserve > 0) {
    game.reload(p);
  }
  const b = p.bot;
  b.thinkT -= dt;
  b.pathT -= dt;
  b.combatUntil = Math.max(b.combatUntil, 0);
  p.inCombat = Math.max(0, p.inCombat - dt);

  // escape through a vent if one was chosen after a kill
  if (p.role === "impostor" && b.ventGoal && p.ventCd <= 0) {
    const vc = centerOf(b.ventGoal.tx, b.ventGoal.ty);
    if (Math.hypot(vc.x - p.x, vc.y - p.y) < 40) {
      game.useVent(p, b.ventGoal);
      b.ventGoal = null;
      b.goal = null;
      return;
    }
    moveToward(game, p, vc.x, vc.y, dt, IMP_SPEED);
    return;
  }

  // A body in plain sight is the strongest signal for a crewmate.
  if (p.role === "crew" && !game.sabotage) {
    const body = visibleBody(game, p, 310);
    if (body && !b.reportBodyId) {
      b.reportBodyId = body.id;
      b.goal = { type: "report", bodyId: body.id };
      stopTask(game, p);
    }
  }

  // fight back / pursue a killer briefly
  const target = b.combatTarget != null ? game.players.find((q) => q.id === b.combatTarget && q.alive) : null;
  if (target && game.time < b.combatUntil && lineClear(p.x, p.y, target.x, target.y)) {
    p.angle = Math.atan2(target.y - p.y, target.x - p.x);
    if (dist(p, target) > 360) {
      moveToward(game, p, target.x, target.y, dt, p.role === "impostor" ? IMP_SPEED : CREW_SPEED);
    } else if (game.time - (b.combatStart || 0) > 0.42 && clearShot(game, p, target)) {
      game.fire(p);
    }
    if (!target.alive) b.combatTarget = null;
    return;
  } else if (target && game.time >= b.combatUntil) {
    b.combatTarget = null;
  }

  if (b.thinkT <= 0) {
    b.thinkT = rand(0.35, 0.7);
    think(game, p);
  }

  executeGoal(game, p, dt);
}

function think(game, p) {
  const b = p.bot;

  if (p.role === "crew") {
    b.combatTarget = b.combatTarget != null && game.players.some((q) => q.id === b.combatTarget && q.alive)
      ? b.combatTarget : null;

    if (game.sabotage) {
      if (b.goal?.type !== "defuse") {
        stopTask(game, p);
        b.goal = { type: "defuse" };
      }
      return;
    }

    if (b.reportBodyId) {
      const body = game.bodies.find((x) => x.id === b.reportBodyId);
      if (body) {
        b.goal = { type: "report", bodyId: body.id };
        return;
      }
      b.reportBodyId = null;
    }

    if (b.noiseGoal && game.time < b.noiseUntil && (!b.goal || b.goal.type === "task")) {
      b.goal = { type: "investigate", x: b.noiseGoal.x, y: b.noiseGoal.y };
      return;
    }

    if (b.goal?.type === "investigate" && game.time >= b.noiseUntil) {
      b.goal = null;
    }

    if (game.time < (b.postTaskUntil || 0) && (!b.goal || b.goal.type === "wander")) {
      if (!b.goal) b.goal = { type: "wander" };
      return;
    }

    if (!b.goal || b.goal.type === "task" || b.goal.type === "investigate" || b.goal.type === "fake") {
      if (b.taskId && !game.taskState[b.taskId]?.done) {
        const task = TASKS.find((t) => t.id === b.taskId);
        if (task) {
          b.goal = { type: "task", taskId: task.id };
          return;
        }
      }
      const task = pickTask(game, p);
      if (task) {
        b.taskId = task.id;
        b.taskT = 0;
        b.goal = { type: "task", taskId: task.id };
      } else {
        b.goal = { type: "wander" };
      }
    }
    return;
  }

  // ---- impostor brain ----
  if (game.sabotage) {
    if (b.goal?.type !== "defend") {
      b.goal = { type: "defend" };
      b.path = [];
    }
    return;
  }

  if (!game.sabotage && p.sabotageCd <= 0 && game.tasksDone >= 2 && Math.random() < 0.22) {
    game.triggerSabotage(false, null, p);
    if (game.sabotage) {
      b.goal = { type: "defend" };
      return;
    }
  }

  // look for an isolated crewmate to knife
  let prey = null, preyScore = Infinity;
  for (const q of game.players) {
    if (!q.alive || q.role !== "crew") continue;
    const d = dist(p, q);
    if (d > 760) continue;
    let witnesses = 0;
    for (const o of game.players) {
      if (o === q || !o.alive || o.role !== "crew") continue;
      if (dist(o, q) < 220) witnesses++;
    }
    const score = d + witnesses * 260;
    if (score < preyScore) { preyScore = score; prey = q; }
  }

  if (prey && (preyScore < 500 || (p.knifeCd <= 0 && preyScore < 700))) {
    if (b.goal?.type !== "hunt" || b.goal.targetId !== prey.id) {
      b.goal = { type: "hunt", targetId: prey.id };
      b.path = [];
    }
    return;
  }

  // blend in with a fake task, or report a body to build trust
  if (Math.random() < 0.3) {
    const body = visibleBody(game, p, 260);
    let crewClose = false;
    if (body) {
      for (const q of game.players) {
        if (q.alive && q.role === "crew" && dist(q, body) < 190) crewClose = true;
      }
    }
    if (body && !crewClose) {
      b.goal = { type: "report", bodyId: body.id };
      return;
    }
  }

  if (!b.goal || b.goal.type === "hunt" || b.goal.type === "wander") {
    const task = pickTask(game, p);
    if (task) {
      b.taskId = task.id;
      b.taskT = 0;
      b.goal = { type: "fake", taskId: task.id };
    } else {
      b.goal = { type: "wander" };
    }
  }
}

function executeGoal(game, p, dt) {
  const b = p.bot;
  const goal = b.goal;
  if (!goal) {
    moveToward(game, p, p.x + Math.cos(p.angle) * 8, p.y + Math.sin(p.angle) * 8, dt, CREW_SPEED * 0.6);
    return;
  }

  if (goal.type === "defuse") {
    const site = game.sabotage ? BOMB_SITES.find((s) => s.id === game.sabotage.siteId) : null;
    if (!site) { b.goal = null; return; }
    const c = centerOf(site.tx, site.ty);
    if (Math.hypot(c.x - p.x, c.y - p.y) < 44) {
      p.angle = Math.atan2(c.y - p.y, c.x - p.x);
      p.vx = p.vy = 0;
    } else {
      moveToward(game, p, c.x, c.y, dt, CREW_SPEED * 1.08);
    }
    return;
  }

  if (goal.type === "report") {
    const body = game.bodies.find((x) => x.id === goal.bodyId);
    if (!body) { b.goal = null; b.reportBodyId = null; return; }
    if (dist(p, body) < 44) {
      b.goal = null;
      b.reportBodyId = null;
      game.triggerMeeting("report", p, body);
      return;
    }
    moveToward(game, p, body.x, body.y, dt, CREW_SPEED * 1.12);
    return;
  }

  if (goal.type === "investigate") {
    if (Math.hypot(p.x - goal.x, p.y - goal.y) < 40) {
      p.angle += dt * 1.4;
      if (game.time >= b.noiseUntil) b.goal = null;
    } else {
      moveToward(game, p, goal.x, goal.y, dt, CREW_SPEED);
    }
    return;
  }

  if (goal.type === "task") {
    const task = TASKS.find((t) => t.id === goal.taskId);
    if (!task || game.taskState[task.id].done) {
      stopTask(game, p, true);
      b.goal = null;
      return;
    }
    const st = game.taskState[task.id];
    const c = centerOf(task.ax, task.ay);
    if (Math.hypot(c.x - p.x, c.y - p.y) < 24) {
      p.vx = p.vy = 0;
      p.angle = Math.atan2(centerOf(task.tx, task.ty).y - p.y, centerOf(task.tx, task.ty).x - p.x);
      b.taskT += dt;
      st.progress = clamp(b.taskT / TASK_DURATION, 0, 0.999);
      p.angle += Math.sin(game.time * 12) * 0.004;
      if (Math.random() < dt * 2.4) {
        for (const q of game.players) {
          if (q !== p && q.alive && q.role === "crew" && dist(q, p) < 120 && lineClear(q.x, q.y, p.x, p.y)) {
            if (!q.memory.events.some((e) => e.type === "sawTask" && e.target === p.id && game.time - e.t < 14)) {
              q.memory.events.push({ type: "sawTask", target: p.id, room: roomNameAt(p.x, p.y), t: game.time });
              if (q.memory.events.length > 8) q.memory.events.shift();
            }
          }
        }
      }
      if (b.taskT >= TASK_DURATION) {
        const id = task.id;
        const t = TASKS.find((x) => x.id === id);
        stopTask(game, p, false);
        b.taskId = null;
        b.taskT = 0;
        b.goal = null;
        if (t) {
          game.completeTask(t, p);
          b.postTaskUntil = game.time + rand(5, 11);
          b.goal = { type: "wander" };
        }
      }
    } else {
      moveToward(game, p, c.x, c.y, dt, CREW_SPEED);
    }
    return;
  }

  if (goal.type === "fake") {
    const task = TASKS.find((t) => t.id === goal.taskId);
    if (!task) { b.goal = null; return; }
    const c = centerOf(task.ax, task.ay);
    if (Math.hypot(c.x - p.x, c.y - p.y) < 24) {
      p.vx = p.vy = 0;
      b.taskT += dt;
      if (Math.random() < dt * 1.8) {
        for (const q of game.players) {
          if (q !== p && q.alive && q.role === "crew" && dist(q, p) < 130 && lineClear(q.x, q.y, p.x, p.y)) {
            if (!q.memory.events.some((e) => e.type === "sawTask" && e.target === p.id && game.time - e.t < 18)) {
              q.memory.events.push({ type: "sawTask", target: p.id, room: roomNameAt(p.x, p.y), t: game.time });
              if (q.memory.events.length > 8) q.memory.events.shift();
            }
          }
        }
      }
      if (b.taskT > rand(2.2, 3.4)) {
        b.taskT = 0;
        b.goal = null;
        stopTask(game, p, true);
      }
    } else {
      moveToward(game, p, c.x, c.y, dt, IMP_SPEED * 0.92);
    }
    return;
  }

  if (goal.type === "hunt") {
    const prey = game.players.find((q) => q.id === goal.targetId && q.alive);
    if (!prey || prey.role !== "crew") { b.goal = null; return; }
    const d = dist(p, prey);
    p.angle = Math.atan2(prey.y - p.y, prey.x - p.x);
    if (d < 42 && p.knifeCd <= 0) {
      game.knifeKill(p, prey);
      b.goal = null;
      // try to slip away
      const ven = nearestVent(p, 340);
      if (ven && Math.random() < 0.55) b.ventGoal = ven;
      return;
    }
    if (p.inCombat > 0 && d < 300 && lineClear(p.x, p.y, prey.x, prey.y) && p.ammo > 0 && Math.random() < dt * 1.1) {
      game.fire(p);
      return;
    }
    if (d > 34) moveToward(game, p, prey.x, prey.y, dt, IMP_SPEED);
    return;
  }

  if (goal.type === "defend") {
    const site = game.sabotage ? BOMB_SITES.find((s) => s.id === game.sabotage.siteId) : null;
    if (!site) { b.goal = null; return; }
    const c = centerOf(site.tx, site.ty);
    let prey = null, pd = 120;
    for (const q of game.players) {
      if (!q.alive || q.role !== "crew") continue;
      const d = Math.hypot(q.x - c.x, q.y - c.y);
      if (d < pd) { pd = d; prey = q; }
    }
    if (prey) {
      const d = dist(p, prey);
      p.angle = Math.atan2(prey.y - p.y, prey.x - p.x);
      if (d < 42 && p.knifeCd <= 0) { game.knifeKill(p, prey); return; }
      if (d < 340 && clearShot(game, p, prey) && p.ammo > 0 && Math.random() < dt * 1.1) {
        game.fire(p);
        return;
      }
      moveToward(game, p, prey.x, prey.y, dt, IMP_SPEED);
      return;
    }
    const ox = (site.id === "A" ? 1 : -1) * 92;
    moveToward(game, p, c.x + ox, c.y - 92, dt, IMP_SPEED * 0.9);
    return;
  }

  if (goal.type === "wander") {
    if (!b.wanderT || game.time > b.wanderT) {
      b.wanderT = game.time + rand(3, 6);
      const tx = clamp(p.x + rand(-220, 220), 60, 1470);
      const ty = clamp(p.y + rand(-220, 220), 60, 900);
      b.wanderGoal = { x: tx, y: ty };
    }
    if (b.wanderGoal) moveToward(game, p, b.wanderGoal.x, b.wanderGoal.y, dt, CREW_SPEED * 0.8);
    return;
  }
}

function moveToward(game, p, tx, ty, dt, speed) {
  const d = Math.hypot(tx - p.x, ty - p.y);
  if (d < 10) { p.vx *= 0.8; p.vy *= 0.8; return; }
  let aimX = tx, aimY = ty;
  if (!lineClear(p.x, p.y, tx, ty) && d > 38) {
    const b = p.bot;
    if (b.pathT <= 0 || !b.path.length || b.pathTarget?.x !== tx || b.pathTarget?.y !== ty) {
      b.path = findPath(p.x, p.y, tx, ty);
      b.pathT = 1.1;
      b.pathTarget = { x: tx, y: ty };
    }
    if (b.path.length) {
      while (b.path.length && Math.hypot(b.path[0].x - p.x, b.path[0].y - p.y) < 13) b.path.shift();
      if (b.path.length) { aimX = b.path[0].x; aimY = b.path[0].y; }
    }
  }
  let dx = aimX - p.x, dy = aimY - p.y;
  const m = Math.hypot(dx, dy) || 1;
  dx /= m; dy /= m;
  // separation from other actors
  let sx = 0, sy = 0;
  for (const q of game.players) {
    if (q === p || !q.alive) continue;
    const qd = dist(p, q);
    if (qd < 30 && qd > 0.1) {
      sx += (p.x - q.x) / qd;
      sy += (p.y - q.y) / qd;
    }
  }
  dx += sx * 0.7; dy += sy * 0.7;
  const mm = Math.hypot(dx, dy) || 1;
  dx /= mm; dy /= mm;
  p.vx += (dx * speed - p.vx) * Math.min(1, dt * 9);
  p.vy += (dy * speed - p.vy) * Math.min(1, dt * 9);
  p.angle = Math.atan2(dy, dx);
  const beforeX = p.x, beforeY = p.y;
  game.moveEntity(p, p.vx * dt, p.vy * dt, false);
  const moved = Math.hypot(p.x - beforeX, p.y - beforeY);
  if (moved < 0.35) {
    p.bot.stuckT += dt;
    if (p.bot.stuckT > 0.8) {
      p.bot.stuckT = 0;
      p.bot.path = [];
      p.bot.pathT = 0;
      p.bot.thinkT = 0;
    }
  } else {
    p.bot.stuckT = 0;
  }
}
