import { dist, rand, pick, angleLerp, clamp, chance } from './util.js';
import { BOMB_SITE } from './map.js';

export function updateBots(game, dt) {
  for (const a of game.agents) {
    if (!a.alive || a.isPlayer) continue;
    a.fireCd = Math.max(0, a.fireCd - dt);
    a.knifeCd = Math.max(0, a.knifeCd - dt);
    a.killCd = Math.max(0, a.killCd - dt);
    a.hitFlash = Math.max(0, a.hitFlash - dt * 4);
    a.muzzle = Math.max(0, a.muzzle - dt);
    a.repathT = Math.max(0, a.repathT - dt);
    a.alerted = Math.max(0, (a.alerted || 0) - dt);
    a.retaliateT = Math.max(0, (a.retaliateT || 0) - dt);
    if (a.reloadT > 0) {
      a.reloadT -= dt;
      if (a.reloadT <= 0) a.ammo = a.maxAmmo;
    }
    if (a.stunned > 0) { a.stunned -= dt; continue; }
    if (a.isImpostor) updateImpostorBot(game, a, dt);
    else updateCrewBot(game, a, dt);
  }
}

function nearestBody(game, agent, range) {
  let best = null, bd = range;
  for (const body of game.bodies) {
    if (body.reported) continue;
    const d = dist(agent.x, agent.y, body.x, body.y);
    if (d < bd && game.world.los(agent.x, agent.y, body.x, body.y)) { best = body; bd = d; }
  }
  return best;
}

function updateCrewBot(game, a, dt) {
  // report a body if seen
  const body = nearestBody(game, a, 460);
  if (body && game.bomb.state !== 'planted') {
    if (a.reportT <= 0) {
      a.reportT = 1.1;
      a.state = 'report';
      a.path = null;
      a.foundBody = { name: body.name, zone: game.world.zoneAt(body.x, body.y), x: body.x, y: body.y };
    }
    a.reportT -= dt;
    a.angle = angleLerp(a.angle, Math.atan2(body.y - a.y, body.x - a.x), Math.min(1, dt * 8));
    if (a.reportT <= 0 && nearestBody(game, a, 470) === body) {
      game.reportBot(body, a);
      return;
    }
    if (body && dist(a.x, a.y, body.x, body.y) > 60) navigateTo(game, a, body.x, body.y, dt, 1);
    return;
  }
  a.reportT = 0;

  // return fire when an impostor reveals themselves by attacking
  const attacker = game.agents.find(x => x.id === a.lastAttacker && x.alive);
  if (attacker && game.canSee(a, attacker, 560)) {
    const d = dist(a.x, a.y, attacker.x, attacker.y);
    aimAt(game, a, attacker, dt);
    if (a.fireCd <= 0 && a.reloadT <= 0 && a.retaliateT <= 0 && chance(dt * 1.3)) {
      if (a.ammo > 0) game.shoot(a, a.angle, 0.1);
      else a.reloadT = 1.3;
    }
    if (d > 260) navigateTo(game, a, attacker.x, attacker.y, dt, 1.05);
    else if (d < 120) moveAway(game, a, attacker.x, attacker.y, dt, 0.75);
    return;
  }

  // engage a killer they witnessed
  const known = game.agents.find(x => x.id === a.knowsKiller && x.alive);
  if (known && game.canSee(a, known, 620)) {
    const d = dist(a.x, a.y, known.x, known.y);
    aimAt(game, a, known, dt);
    if (d < 520 && a.fireCd <= 0 && a.reloadT <= 0) {
      if (a.ammo > 0) game.shoot(a, a.angle, 0.055);
      else a.reloadT = 1.4;
    }
    if (d > 240) navigateTo(game, a, known.x, known.y, dt, 1);
    else if (d < 130) moveAway(game, a, known.x, known.y, dt, 0.8);
    return;
  }

  // bomb planted: get to it and defuse
  if (game.bomb.state === 'planted') {
    const b = game.bomb;
    if (dist(a.x, a.y, b.x, b.y) > 54) {
      a.state = 'respond';
      navigateTo(game, a, b.x, b.y, dt, 1.15);
    } else {
      a.state = 'defuse';
      a.angle = angleLerp(a.angle, Math.atan2(b.y - a.y, b.x - a.x), Math.min(1, dt * 8));
    }
    return;
  }

  // lights out: reset the breaker
  if (game.lightsOut > 0) {
    const bx = 1460, by = 640;
    if (dist(a.x, a.y, bx, by) > 54) {
      a.state = 'respond';
      navigateTo(game, a, bx, by, dt, 1.1);
    } else {
      a.state = 'fix';
      a.fixProgress += dt;
      a.angle = Math.atan2(by - a.y, bx - a.x);
      if (a.fixProgress >= 2.5) {
        a.fixProgress = 0;
        game.lightsOut = 0;
        game.ui.feed('BREAKER RESET — LIGHTS RESTORED', 'good');
        game.audio.task();
      }
    }
    return;
  }

  // tasks
  if (!a.taskStation || a.taskStation.done) {
    a.taskStation = chooseStation(game, a);
    a.path = null;
    a.state = 'task';
    if (a.taskStation) {
      const s = a.taskStation;
      const target = taskSpot(s);
      a.path = game.world.findPath(a.x, a.y, target.x, target.y);
      a.pathIdx = 0;
    }
  }
  if (a.taskStation && !a.taskStation.done) {
    const s = a.taskStation;
    const target = taskSpot(s);
    const d = dist(a.x, a.y, target.x, target.y);
    if (d > 10) {
      if (!a.path || a.pathIdx >= a.path.length) {
        a.path = game.world.findPath(a.x, a.y, target.x, target.y);
        a.pathIdx = 0;
      }
      if (!moveAlong(game, a, dt, 1)) {
        a.path = game.world.findPath(a.x, a.y, target.x, target.y);
        a.pathIdx = 0;
        if (!a.path.length) { a.taskStation = null; a.state = 'patrol'; }
      }
    } else {
      a.state = 'task';
      a.angle = angleLerp(a.angle, Math.atan2(s.y - a.y, s.x - a.x), Math.min(1, dt * 6));
    }
    return;
  }

  // patrol
  if (!a.path || a.pathIdx >= a.path.length) {
    const p = game.world.randomWalkableNear(a.x, a.y, 90, 420);
    a.path = game.world.findPath(a.x, a.y, p.x, p.y);
    a.pathIdx = 0;
    a.state = 'patrol';
    if (!a.path.length) { a.path = [{ x: p.x, y: p.y }]; a.pathIdx = 0; }
  }
  moveAlong(game, a, dt, 0.62);
}

function chooseStation(game, a) {
  const open = game.stations.filter(s => !s.done);
  if (!open.length) return null;
  let best = null, bestScore = 1e9;
  for (const s of open) {
    let score = dist(a.x, a.y, s.x, s.y);
    score += (s.progress || 0) * 0.4;
    if (s.id === a.lastStation) score += 120;
    if (score < bestScore) { bestScore = score; best = s; }
  }
  a.lastStation = best ? best.id : null;
  return best;
}

function taskSpot(s) {
  return { x: s.x + 34, y: s.y + 26 };
}

function updateImpostorBot(game, a, dt) {
  const b = game.bomb;

  // carrier: plant the bomb once the round has settled
  if (b.state === 'carried' && b.carrierId === a.id) {
    const elapsed = 180 - game.roundTime;
    if (elapsed < 13) {
      // blend in near spawn for a moment
      if (!a.path || a.pathIdx >= a.path.length) {
        const p = game.world.randomWalkableNear(a.x, a.y, 40, 150);
        a.path = game.world.findPath(a.x, a.y, p.x, p.y);
        a.pathIdx = 0;
      }
      moveAlong(game, a, dt, 0.5);
      return;
    }
    const d = dist(a.x, a.y, BOMB_SITE.x, BOMB_SITE.y);
    if (d > BOMB_SITE.r - 55) {
      if (!a.path || a.pathIdx >= a.path.length || a.repathT <= 0) {
        a.path = game.world.findPath(a.x, a.y, BOMB_SITE.x, BOMB_SITE.y);
        a.pathIdx = 0;
        a.repathT = 2;
      }
      moveAlong(game, a, dt, 1.15);
    } else {
      a.state = 'plant';
      a.angle = Math.atan2(BOMB_SITE.y - a.y, BOMB_SITE.x - a.x);
      a.plantProgress += dt;
      if (Math.floor(a.plantProgress * 4) !== Math.floor((a.plantProgress - dt) * 4)) game.audio.plantTick();
      if (a.plantProgress >= 4) { a.plantProgress = 0; game.plantBomb(a); }
    }
    return;
  }

  // if the bomb is down, guard it and shoot defusers
  if (b.state === 'planted') {
    const d = dist(a.x, a.y, b.x, b.y);
    if (d > 120) navigateTo(game, a, b.x, b.y, dt, 1.0);
    const target = game.agents.find(x => x.alive && !x.isImpostor && dist(x.x, x.y, b.x, b.y) < 180);
    if (target && game.canSee(a, target, 420)) {
      aimAt(game, a, target, dt);
      if (a.fireCd <= 0 && a.reloadT <= 0 && a.ammo > 0 && chance(dt * 1.6)) game.shoot(a, a.angle, 0.1);
    }
    return;
  }

  // sabotage occasionally
  if (game.sabotageCd <= 0 && game.lightsOut <= 0 && game.player && !game.player.isImpostor && chance(dt * 0.1)) {
    game.triggerSabotage(a);
  }

  // retreat briefly after a kill
  if (a.state === 'flee' && a.fleeT > 0) {
    a.fleeT -= dt;
    if (!a.path || a.pathIdx >= a.path.length) {
      const p = game.world.randomWalkableNear(a.x, a.y, 120, 380);
      a.path = game.world.findPath(a.x, a.y, p.x, p.y);
      a.pathIdx = 0;
    }
    moveAlong(game, a, dt, 1.1);
    if (a.fleeT <= 0) { a.state = 'idle'; a.path = null; }
    return;
  }

  const target = pickTarget(game, a);
  if (target) {
    const d = dist(a.x, a.y, target.x, target.y);
    if (game.canSee(a, target, 560)) {
      aimAt(game, a, target, dt);
      const exposed = a.alerted > 0 || game.agents.some(x => x.alive && x.knowsKiller === a.id);
      if (exposed && d < 430 && a.fireCd <= 0 && a.reloadT <= 0 && a.ammo > 0 && chance(dt * 1.4)) {
        game.shoot(a, a.angle, 0.14);
      }
      if (d < 58 && a.killCd <= 0) {
        const witnesses = countWitnesses(game, a, target, 260);
        if (witnesses === 0 || chance(0.22)) {
          a.killCd = 28;
          a.knifeCd = 2;
          game.audio.knife();
          game.killAgent(target, a, 'knife');
          a.state = 'flee';
          a.path = null;
          a.taskStation = null;
          return;
        }
      }
    }
    if (d > 48) {
      if (!a.path || a.pathIdx >= a.path.length || a.repathT <= 0) {
        a.path = game.world.findPath(a.x, a.y, target.x, target.y);
        a.pathIdx = 0;
        a.repathT = 1.2;
      }
      moveAlong(game, a, dt, 1.02);
    } else if (a.killCd > 0) {
      moveAway(game, a, target.x, target.y, dt, 0.7);
    }
    return;
  }

  // fake a task or patrol
  if (!a.path || a.pathIdx >= a.path.length) {
    const s = pick(game.stations);
    const p = game.world.randomWalkableNear(s.x, s.y, 40, 120);
    a.path = game.world.findPath(a.x, a.y, p.x, p.y);
    a.pathIdx = 0;
    a.state = 'fake';
  }
  moveAlong(game, a, dt, 0.55);
}

function pickTarget(game, a) {
  const crew = game.agents.filter(x => x.alive && !x.isImpostor);
  if (!crew.length) return null;
  let best = null, bestScore = 1e9;
  for (const c of crew) {
    const d = dist(a.x, a.y, c.x, c.y);
    let isolation = 0;
    for (const o of crew) {
      if (o.id === c.id) continue;
      if (dist(c.x, c.y, o.x, o.y) < 280) isolation++;
    }
    let score = d + isolation * 170;
    if (c.isPlayer) score += 30;
    if (c.rogue) score += 80;
    if (score < bestScore) { bestScore = score; best = c; }
  }
  return best;
}

function countWitnesses(game, killer, victim, range) {
  let n = 0;
  for (const a of game.agents) {
    if (!a.alive || a.isImpostor || a.id === killer.id || a.id === victim.id) continue;
    if (dist(a.x, a.y, killer.x, killer.y) < range && game.world.los(a.x, a.y, killer.x, killer.y)) n++;
  }
  return n;
}

function aimAt(game, a, target, dt) {
  const ang = Math.atan2(target.y - a.y, target.x - a.x);
  a.angle = angleLerp(a.angle, ang, Math.min(1, dt * 14));
}

function navigateTo(game, a, x, y, dt, speedMul = 1) {
  const d = dist(a.x, a.y, x, y);
  if (d < 22) return true;
  if (!a.path || a.pathIdx >= a.path.length || a.repathT <= 0) {
    a.path = game.world.findPath(a.x, a.y, x, y);
    a.pathIdx = 0;
    a.repathT = 1.1;
  }
  if (!a.path || !a.path.length) { a.path = null; return false; }
  if (!moveAlong(game, a, dt, speedMul)) { a.path = null; return false; }
  return true;
}

function moveTo(game, a, x, y, dt, speedMul = 1) {
  const ang = Math.atan2(y - a.y, x - a.x);
  const d = dist(a.x, a.y, x, y);
  a.angle = angleLerp(a.angle, ang, Math.min(1, dt * 10));
  if (d > 8) {
    const sp = a.speed * speedMul;
    game.world.moveCircle(a, Math.cos(ang) * sp * dt, Math.sin(ang) * sp * dt, a.radius);
    a.moving = true;
  }
}

function moveAway(game, a, x, y, dt, speedMul = 1) {
  const ang = Math.atan2(a.y - y, a.x - x);
  const sp = a.speed * speedMul;
  game.world.moveCircle(a, Math.cos(ang) * sp * dt, Math.sin(ang) * sp * dt, a.radius);
  a.angle = angleLerp(a.angle, ang, Math.min(1, dt * 8));
}

function moveAlong(game, a, dt, speedMul) {
  if (!a.path || a.pathIdx >= a.path.length) return false;
  const p = a.path[a.pathIdx];
  const d = dist(a.x, a.y, p.x, p.y);
  if (d < 14) {
    a.pathIdx++;
    a.stuckT = 0;
    if (a.pathIdx >= a.path.length) return false;
    return true;
  }
  const ang = Math.atan2(p.y - a.y, p.x - a.x);
  a.angle = angleLerp(a.angle, ang, Math.min(1, dt * 9));
  const sp = a.speed * speedMul;
  const px = a.x, py = a.y;
  game.world.moveCircle(a, Math.cos(ang) * sp * dt, Math.sin(ang) * sp * dt, a.radius);
  const moved = Math.hypot(a.x - px, a.y - py);
  if (moved < sp * dt * 0.35) {
    a.stuckT = (a.stuckT || 0) + dt;
    if (a.stuckT > 0.55) {
      a.stuckT = 0;
      a.pathIdx++;
      if (a.pathIdx >= a.path.length) { a.path = null; return false; }
    }
  } else {
    a.stuckT = 0;
  }
  a.moving = true;
  a.walk += dt * 9;
  return true;
}
