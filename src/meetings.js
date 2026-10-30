import { SPAWNS, centerOf, roomNameAt, TASKS } from "./map.js";

const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function triggerMeeting(game, type, reporter, body) {
  if (game.phase !== "playing") return;
  if (game.meeting) return;
  if (game.sabotage) {
    if (reporter?.isPlayer) game.toast("CANNOT MEET DURING A SABOTAGE", "danger");
    return;
  }
  const reporterAlive = reporter?.alive;
  if (!reporterAlive) return;

  game.phase = "meeting";
  game.action = null;
  game.input.firing = false;
  if (reporter) reporter.lastAction = game.time;
  if (reporter?.isPlayer) game.stats.reports++;

  const participants = game.players.filter((p) => p.alive && !p.ejected);
  const victim = body ? game.players.find((p) => p.id === body.victimId) : null;
  if (body) body.found = true;

  const occupied = new Set();
  const lines = [];
  const pushLine = (speaker, text, targetId = null, kind = "info", tone = "info", extra = {}) => {
    lines.push({ speakerId: speaker?.id ?? null, speaker: speaker?.name ?? "SYSTEM", color: speaker?.color ?? null, text, targetId, kind, tone, ...extra });
  };

  if (reporter?.isPlayer) {
    pushLine(null, `YOU REPORTED ${victim ? victim.name : "A BODY"} IN ${(body?.room || "THE FACILITY").toUpperCase()}.`, null, "system", "system");
  } else {
    if (victim) {
      pushLine(reporter, `I found ${victim.name}'s body in ${body.room}. Everyone, sound off.`, null, "info", "report");
    } else {
      pushLine(reporter, `Emergency meeting. I don't trust the room.`, null, "info", "report");
    }
  }

  for (const bot of shuffle(participants.filter((p) => p.bot))) {
    const line = makeLine(game, bot, victim, body, reporter);
    if (line) pushLine(bot, line.text, line.targetId, line.kind, line.tone);
  }

  const total = participants.some((p) => p.isPlayer) ? 22 : 13;
  const chat = [];
  let at = 1.4;
  for (const line of lines) {
    chat.push({ ...line, at });
    at += rand(1.25, 2.0);
  }
  if (at > total - 4) {
    // compress if a lot of testimony
    let t = 1.3;
    for (const c of chat) { c.at = t; t += Math.min(1.45, (total - 5) / Math.max(1, chat.length)); }
  }

  const votes = {};
  const voteAt = {};
  const votingWindow = total - 1.5;
  for (const p of participants) {
    if (p.bot) {
      voteAt[p.id] = rand(Math.min(6, votingWindow * 0.45), Math.max(7, votingWindow * 0.86));
    }
  }

  game.meeting = {
    type, reporterId: reporter?.id ?? null, reporterName: reporter?.name ?? null,
    victimId: victim?.id ?? null, victimName: victim?.name ?? null,
    room: body?.room ?? roomNameAt(reporter.x, reporter.y),
    time: total, total, elapsed: 0, chat, chatIndex: 0,
    votes, voteAt, playerVoted: false, allVotedAt: 0,
    phase: "discuss", result: null, resultTimer: 0,
    participants: participants.map((p) => p.id),
  };

  game.audio?.meeting();
  game.emit("meetingStart", meetingView(game));
  if (reporter?.isPlayer) game.toast(victim ? `BODY REPORTED: ${victim.name}` : "EMERGENCY MEETING", "warn");
}

function makeLine(game, bot, victim, body, reporter) {
  const events = bot.memory.events.filter((e) => game.time - e.t < 55);
  const byType = (t) => events.filter((e) => e.type === t).sort((a, b) => b.t - a.t);
  const seen = seenSet(bot);
  const valid = (id) => {
    if (id == null || id === bot.id) return null;
    const q = game.players.find((p) => p.id === id);
    return q && q.alive && !q.ejected ? q : null;
  };

  if (bot.role === "crew") {
    for (const e of byType("sawKill")) {
      const q = valid(e.target);
      if (q) return { text: `I watched ${q.name} kill ${game.players.find((p) => p.id === e.victim)?.name || "someone"} in ${e.room}. Vote ${q.name}.`, targetId: q.id, kind: "accuse", tone: "hot" };
    }
    for (const e of byType("sawVent")) {
      const q = valid(e.target);
      if (q) return { text: `${q.name} vented in ${e.room}. I saw the grate move.`, targetId: q.id, kind: "accuse", tone: "hot" };
    }
    for (const e of byType("sawShoot")) {
      const q = valid(e.target);
      if (q) return { text: `${q.name} shot ${game.players.find((p) => p.id === e.victim)?.name || "someone"} in ${e.room}.`, targetId: q.id, kind: "accuse", tone: "hot" };
    }
    for (const e of byType("wasShot")) {
      const q = valid(e.target);
      if (q) return { text: `${q.name} attacked me in ${e.room || "the corridor"}.`, targetId: q.id, kind: "accuse", tone: "hot" };
    }
    for (const e of byType("sawTask")) {
      const q = valid(e.target);
      if (q && !seen.has(q.id)) {
        return { text: `${q.name} was on a console in ${e.room}. I'd clear them.`, targetId: q.id, kind: "clear", tone: "clear" };
      }
    }
    const shot = byType("heardShot")[0];
    if (shot) {
      return { text: `I heard a shot near ${roomNameAt(shot.x, shot.y)}. I didn't see who.`, targetId: null, kind: "info", tone: "info" };
    }
    return { text: pickGeneric(bot, game), targetId: null, kind: "info", tone: "info" };
  }

  // Impostor testimony: lie, deflect, or protect a teammate.
  const mates = game.players.filter((p) => p.role === "impostor" && p !== bot && p.alive);
  const mate = mates.find((m) => publicHeat(game, m.id) > 20);
  if (mate && Math.random() < 0.55) {
    return { text: `I was with ${mate.name} in ${roomNameAt(mate.x, mate.y)}. If they're sus, then I'm sus too.`, targetId: mate.id, kind: "clear", tone: "clear" };
  }

  if (Math.random() < 0.58) {
    const crew = game.players.filter((p) => p.alive && p.role === "crew" && p.id !== bot.id);
    const maxHeat = Math.max(...crew.map((p) => publicHeat(game, p.id)), 0);
    const pool = crew.filter((p) => publicHeat(game, p.id) >= maxHeat - 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (target) {
      const room = body?.room || roomNameAt(target.x, target.y);
      const options = [
        `I saw ${target.name} leave ${room} right before the body dropped.`,
        `${target.name} was following me through ${roomNameAt(target.x, target.y)}. Weird route.`,
        `I don't have proof, but ${target.name} was nowhere near a task. Watch them.`,
        `${target.name} came out of ${room} looking rattled.`,
      ];
      return { text: options[Math.floor(Math.random() * options.length)], targetId: target.id, kind: "accuse", tone: "accuse" };
    }
  }
  return { text: `I was doing tasks in ${roomNameAt(bot.x, bot.y)}. No read from me.`, targetId: null, kind: "info", tone: "info" };
}

function seenSet(bot) {
  return new Set(bot.memory.events.filter((e) => e.type === "sawTask").map((e) => e.target));
}

function pickGeneric(bot, game) {
  const room = roomNameAt(bot.x, bot.y);
  const task = TASKS.find((t) => t.room.toLowerCase() === room.toLowerCase());
  const options = [
    `I was in ${room}${task ? ` doing ${task.name}` : ""}. Saw nothing.`,
    `No read. I'll skip unless someone has hard proof.`,
    `My route was ${room} then the hub. Nobody crossed me.`,
    `I heard footsteps but no visual. Keep your guns up.`,
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function publicHeat(game, id) {
  let total = 0;
  for (const p of game.players) {
    if (!p.alive || !p.bot) continue;
    total += p.memory.sus?.[id] || 0;
  }
  return total;
}

function meetingView(game) {
  const m = game.meeting;
  if (!m) return null;
  return {
    type: m.type, time: m.time, total: m.total,
    victimName: m.victimName, reporterName: m.reporterName, room: m.room,
    players: game.players.map((p) => ({
      id: p.id, name: p.name, color: p.color, alive: p.alive, ejected: p.ejected,
      isPlayer: p.isPlayer, voted: m.votes[p.id] !== undefined,
    })),
    chat: m.chat.slice(0, m.chatIndex),
    playerVoted: m.playerVoted,
    canVote: game.player?.alive && !game.player?.ejected,
    phase: m.phase, result: m.result,
  };
}

export function updateMeeting(game, dt) {
  const m = game.meeting;
  if (!m) return;
  if (m.phase === "result") {
    m.resultTimer -= dt;
    if (m.resultTimer <= 0) finalizeMeeting(game);
    return;
  }

  m.time = Math.max(0, m.time - dt);
  m.elapsed += dt;

  while (m.chatIndex < m.chat.length && m.elapsed >= m.chat[m.chatIndex].at) {
    const line = m.chat[m.chatIndex++];
    game.emit("meetingChat", { ...line });
    if (line.targetId != null && line.kind !== "clear") {
      for (const p of game.players) {
        if (!p.alive || !p.bot || p.id === line.speakerId) continue;
        if (p.role === "impostor" && game.players.find((q) => q.id === line.targetId)?.role === "impostor") continue;
        const inc = line.kind === "accuse" ? 10 : 0;
        p.memory.sus[line.targetId] = (p.memory.sus[line.targetId] || 0) + inc;
      }
    } else if (line.targetId != null && line.kind === "clear") {
      for (const p of game.players) {
        if (!p.alive || !p.bot) continue;
        p.memory.sus[line.targetId] = Math.max(0, (p.memory.sus[line.targetId] || 0) - 14);
      }
    }
  }

  // bots lock votes over time
  for (const p of game.players) {
    if (!p.alive || !p.bot || m.votes[p.id] !== undefined) continue;
    const at = m.voteAt[p.id];
    if (at !== undefined && m.elapsed >= at) {
      m.votes[p.id] = decideVote(game, p);
      game.emit("meetingVote", { voterId: p.id, targetId: m.votes[p.id] });
    }
  }

  const aliveIds = game.players.filter((p) => p.alive && !p.ejected).map((p) => p.id);
  const everyone = aliveIds.every((id) => m.votes[id] !== undefined);
  if (everyone && !m.allVotedAt) m.allVotedAt = game.time;
  if (m.allVotedAt && game.time - m.allVotedAt > 1.4) {
    resolveMeeting(game);
    return;
  }
  if (m.time <= 0) resolveMeeting(game);
}

function decideVote(game, p) {
  const m = game.meeting;
  const candidates = game.players.filter((q) => q.alive && !q.ejected && q.id !== p.id);
  if (!candidates.length) return "skip";

  if (p.role === "impostor") {
    const mates = game.players.filter((q) => q.role === "impostor" && q !== p && q.alive);
    const crew = candidates.filter((q) => q.role === "crew");
    const mateHeat = Math.max(...mates.map((q) => publicHeat(game, q.id)), 0);
    const bestMate = mates.sort((a, b) => publicHeat(game, b.id) - publicHeat(game, a.id))[0];
    const bestCrew = crew.sort((a, b) => publicHeat(game, b.id) - publicHeat(game, a.id))[0];
    if (bestMate && mateHeat > 55 && (!bestCrew || mateHeat > publicHeat(game, bestMate.id) * 1.4)) {
      return bestMate.id; // throw a doomed teammate under the bus
    }
    if (bestCrew && (publicHeat(game, bestCrew.id) > 8 || Math.random() < 0.6)) {
      return bestCrew.id;
    }
    return Math.random() < 0.35 ? "skip" : (bestCrew?.id ?? "skip");
  }

  let best = null, bestScore = 28;
  for (const q of candidates) {
    const score = (p.memory.sus?.[q.id] || 0) + publicHeat(game, q.id) * 0.08 + rand(0, 4);
    if (score > bestScore) { bestScore = score; best = q; }
  }
  if (best && Math.random() < 0.92) return best.id;
  return "skip";
}

function resolveMeeting(game) {
  const m = game.meeting;
  if (!m || m.phase === "result") return;
  m.phase = "result";
  m.time = Math.max(0, m.time);
  const counts = {};
  let skip = 0;
  for (const [voter, target] of Object.entries(m.votes)) {
    if (target === "skip" || target == null) skip++;
    else counts[target] = (counts[target] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let ejectedId = null;
  if (entries.length) {
    const top = entries[0][1];
    const tied = entries.filter((e) => e[1] === top);
    if (tied.length === 1 && top > skip) ejectedId = Number(tied[0][0]);
  }
  const ejected = ejectedId != null ? game.players.find((p) => p.id === ejectedId) : null;
  let role = null;
  if (ejected) {
    role = ejected.role;
    ejected.alive = false;
    ejected.ejected = true;
    ejected.hp = 0;
    ejected.ghost = ejected.role === "crew";
    ejected.deathAt = game.time;
    if (ejected.isPlayer) {
      game.action = null;
      game.emit("playerEjected", { role });
      game.toast(ejected.role === "crew" ? "EJECTED — GHOST PROTOCOL ACTIVE" : "EJECTED — THE CREW GOT YOU", ejected.role === "crew" ? "warn" : "bad");
    }
    game.audio?.eject();
  } else {
    game.audio?.skip();
  }

  m.result = {
    ejectedId: ejected?.id ?? null,
    ejectedName: ejected?.name ?? null,
    ejectedColor: ejected?.color ?? null,
    role,
    tie: entries.length === 0 || entries.filter((e) => e[1] === entries[0][1]).length > 1,
    skip,
    counts,
    totalVotes: Object.keys(m.votes).length,
  };
  m.resultTimer = 4.6;
  game.emit("meetingResult", { ...m.result, view: meetingView(game) });
}

function finalizeMeeting(game) {
  const m = game.meeting;
  if (!m) return;
  const winner = checkMeetingWin(game);
  if (winner) {
    game.meeting = null;
    game.endRound(winner.winner, winner.reason);
    return;
  }
  game.meeting = null;
  game.phase = "playing";
  game.bodies = [];
  game.action = null;
  game.input.firing = false;

  const spawns = shuffle(SPAWNS);
  const alive = game.players.filter((p) => p.alive);
  alive.forEach((p, i) => {
    const [tx, ty] = spawns[i % spawns.length];
    const c = centerOf(tx, ty);
    p.x = c.x + rand(-8, 8);
    p.y = c.y + rand(-8, 8);
    p.vx = p.vy = 0;
    p.angle = Math.atan2(450 - p.y, 750 - p.x);
    if (p.bot) {
      p.bot.goal = null;
      p.bot.path = [];
      p.bot.taskId = null;
      p.bot.taskT = 0;
      p.bot.combatTarget = null;
      p.bot.reportBodyId = null;
      p.bot.thinkT = 0;
      p.bot.noiseGoal = null;
    }
  });
  const ghost = game.player;
  if (ghost && ghost.ghost && !ghost.alive) {
    ghost.x = centerOf(7, 6).x;
    ghost.y = centerOf(7, 6).y;
  }
  // clear stale progress rings and reservations
  for (const t of TASKS) {
    const st = game.taskState[t.id];
    if (!st.done) { st.progress = 0; st.workerId = null; }
  }
  game.toast("MEETING ADJOURNED — BACK TO WORK", "info");
  game.emit("meetingEnd", {});
}

function checkMeetingWin(game) {
  const alive = game.players.filter((p) => p.alive);
  const imps = alive.filter((p) => p.role === "impostor");
  const crew = alive.filter((p) => p.role === "crew");
  if (imps.length === 0) return { winner: "crew", reason: "The last impostor was ejected. The facility is secure." };
  if (game.tasksDone >= TASKS.length) return { winner: "crew", reason: "All systems were secured before the vote." };
  if (imps.length >= crew.length) return { winner: "impostor", reason: "The vote tipped the numbers. Impostors now control the facility." };
  return null;
}

export { meetingView };

export function castPlayerVote(game, targetId) {
  const m = game.meeting;
  if (!m || m.phase !== "discuss") return;
  if (!game.player?.alive || game.player.ejected) return;
  if (targetId !== "skip") {
    const target = game.players.find((p) => p.id === targetId);
    if (!target || !target.alive) return;
  }
  m.votes[game.player.id] = targetId;
  m.playerVoted = true;
  game.stats.votes++;
  game.emit("meetingVote", { voterId: game.player.id, targetId });
}
