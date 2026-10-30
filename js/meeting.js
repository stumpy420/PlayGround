import { dist, pick, chance, shuffle, clamp } from './util.js';

export function startMeeting(game, reason, reporter, body) {
  if (game.phase !== 'live' || game.bomb.state === 'planted') return;
  game.phase = 'meeting';
  game.useHeld = false;
  game.input.fireHeld = false;
  game.input.aim.firing = false;
  game.ui.setProgress('', 0, false);
  game.ui.setContext(null);
  const m = {
    reason, reporterId: reporter ? reporter.id : null,
    bodyName: body ? body.name : null,
    bodyZone: body ? game.world.zoneAt(body.x, body.y) : null,
    timer: 18, phase: 'discuss', votes: {}, selected: null,
    chatQueue: [], chatTimer: 0.9, playerVoted: false, resolving: false,
    ejectedId: null, ejectedRole: null, tally: null, elapsed: 0
  };
  game.meeting = m;
  game.audio.meeting();
  game.ui.feed(reason, 'vote');
  if (body) {
    game.ui.feed(`${reporter ? reporter.name : 'CREW'} FOUND ${body.name} IN ${m.bodyZone}`, 'kill');
  } else {
    game.ui.feed(`${reporter ? reporter.name : 'CREW'} CALLED AN EMERGENCY MEETING`, 'vote');
  }
  game.ui.openMeeting(m, game.agents, game.player);

  const sys = body
    ? `${reporter ? reporter.name : 'CREW'} found the body of ${body.name} in ${m.bodyZone}.`
    : `${reporter ? reporter.name : 'CREW'} slammed the emergency panel.`;
  m.chatQueue.push({ who: 'COMMS', color: '#ffb545', text: sys, system: true });

  const speakers = shuffle(game.agents.filter(a => a.alive && !a.isPlayer));
  for (const bot of speakers) {
    const line = botStatement(game, bot, body);
    if (line) {
      m.chatQueue.push({ who: bot.name, color: bot.color, text: line.text, system: false });
      if (line.accuseId != null) {
        for (const other of game.agents) {
          if (!other.alive || other.id === bot.id || other.isPlayer) continue;
          other.sus[line.accuseId] = clamp((other.sus[line.accuseId] || 0) + 0.16, 0, 1);
        }
      }
    }
  }
  game.ui.updateMeeting(m, game.agents, game.player);
}

function botStatement(game, bot, body) {
  if (bot.witnessed) {
    const killer = game.agents.find(a => a.id === bot.witnessed.killerId);
    if (killer && killer.alive) {
      return { text: `I saw ${killer.name} kill ${bot.witnessed.victim} in ${bot.witnessed.zone}.`, accuseId: killer.id };
    }
  }
  if (bot.foundBody) {
    const suspects = game.agents.filter(a => a.alive && !a.isImpostor && a.id !== bot.id && !a.isPlayer);
    const s = suspects.length ? pick(suspects) : null;
    return {
      text: `I found ${bot.foundBody.name} in ${bot.foundBody.zone}.${s ? ' ' + s.name + ' was moving away.' : ''}`,
      accuseId: s ? s.id : null
    };
  }
  if (bot.isImpostor) {
    const crew = game.agents.filter(a => a.alive && !a.isImpostor);
    if (crew.length && chance(0.72)) {
      const target = pick(crew);
      return {
        text: chance(0.5)
          ? `I was on tasks. ${target.name} was near the body, though.`
          : `${target.name} was following me through ${game.world.zoneAt(bot.x, bot.y)}.`,
        accuseId: target.id
      };
    }
    return { text: `I was on ${bot.lastTask || 'my task route'}. Where was the body?`, accuseId: null };
  }
  if (bot.lastTask) {
    return { text: `I was on ${bot.lastTask} when the alarm went off.`, accuseId: null };
  }
  if (bot.knowsKiller != null) {
    const k = game.agents.find(a => a.id === bot.knowsKiller && a.alive);
    if (k) return { text: `I saw ${k.name} acting strange near ${game.world.zoneAt(bot.x, bot.y)}.`, accuseId: k.id };
  }
  return {
    text: chance(0.5) ? 'Where was the body? I was in the connector.' : 'Everyone is quiet. That is not reassuring.',
    accuseId: null
  };
}

export function updateMeeting(game, dt) {
  const m = game.meeting;
  if (!m) return;
  m.elapsed += dt;
  if (m.chatQueue.length) {
    m.chatTimer -= dt;
    if (m.chatTimer <= 0) {
      const line = m.chatQueue.shift();
      game.ui.addMeetingChat(line);
      game.audio.ui();
      m.chatTimer = 1.15;
    }
  }
  if (!m.resolving) {
    m.timer -= dt;
    if (m.phase === 'discuss' && m.timer <= 0) {
      m.phase = 'vote';
      m.timer = 14;
      m.chatQueue.length = 0;
      game.ui.addMeetingChat({ who: 'COMMS', color: '#ffb545', text: 'DISCUSSION CLOSED. CAST YOUR VOTE.', system: true });
      game.ui.setMeetingPhase('VOTE');
      game.ui.feed('VOTING BEGINS', 'vote');
      game.audio.alarm();
    } else if (m.phase === 'vote' && m.timer <= 0) {
      resolveVotes(game);
      return;
    }
    if (m.playerVoted && m.phase === 'vote' && m.timer > 3.2) m.timer = 3.2;
    game.ui.updateMeetingTimer(m);
  } else {
    m.timer -= dt;
    if (m.timer <= 0) finishMeeting(game);
  }
}

export function castPlayerVote(game, targetId) {
  const m = game.meeting;
  if (!m || m.phase !== 'vote' || m.resolving || !game.player.alive || m.playerVoted) return;
  m.votes[game.player.id] = targetId == null ? 'skip' : targetId;
  m.playerVoted = true;
  m.selected = targetId == null ? null : targetId;
  m.timer = Math.min(m.timer, 3.2);
  game.audio.vote();
  game.ui.updateMeeting(m, game.agents, game.player);
}

export function accusePlayer(game, targetId) {
  const m = game.meeting;
  if (!m || m.phase !== 'discuss' || m.resolving || !game.player.alive) return;
  const target = game.agents.find(a => a.id === targetId && a.alive);
  if (!target || target.isPlayer) return;
  m.selected = targetId;
  game.ui.addMeetingChat({
    who: 'YOU', color: '#5fe3d0',
    text: `${target.name} is sus. I am calling it now.`, system: false
  });
  for (const a of game.agents) {
    if (!a.alive || a.isPlayer || a.id === target.id) continue;
    a.sus[target.id] = clamp((a.sus[target.id] || 0) + 0.24, 0, 1);
  }
  if (target.isImpostor && chance(0.7)) {
    const fallback = game.agents.filter(a => a.alive && !a.isImpostor && !a.isPlayer);
    if (fallback.length) {
      const f = pick(fallback);
      game.ui.addMeetingChat({ who: target.name, color: target.color, text: `${f.name} is deflecting. Check ${f.name}.`, system: false });
      for (const a of game.agents) {
        if (!a.alive || a.isPlayer) continue;
        a.sus[f.id] = clamp((a.sus[f.id] || 0) + 0.12, 0, 1);
      }
    }
  } else if (!target.isImpostor) {
    game.ui.addMeetingChat({ who: target.name, color: target.color, text: 'I was literally on tasks. This is a waste.', system: false });
  }
  game.audio.ui();
  game.ui.updateMeeting(m, game.agents, game.player);
}

export function quickChat(game, kind) {
  const m = game.meeting;
  if (!m || m.phase !== 'discuss' || m.resolving || !game.player.alive) return;
  let text = '';
  if (kind === 'tasks') {
    text = 'I was on tasks. Check my route.';
    for (const a of game.agents) {
      if (!a.alive || a.isPlayer) continue;
      a.sus[game.player.id] = clamp((a.sus[game.player.id] || 0) - 0.12, 0, 1);
    }
  } else if (kind === 'where') {
    text = 'Where was the body? Who was closest?';
  } else {
    text = 'Everyone is quiet. That is not reassuring.';
  }
  game.ui.addMeetingChat({ who: 'YOU', color: '#5fe3d0', text, system: false });
  game.audio.ui();
}

function botVote(game, bot) {
  const alive = game.agents.filter(a => a.alive);
  if (bot.isImpostor) {
    const crew = alive.filter(a => !a.isImpostor);
    if (!crew.length) return 'skip';
    let best = null, bestSus = -1;
    for (const c of crew) {
      const s = bot.sus[c.id] || 0;
      if (s > bestSus) { bestSus = s; best = c; }
    }
    if (best && chance(0.55)) return best.id;
    const frame = pick(crew);
    return frame.id;
  }
  let best = null, bestSus = 0.34;
  for (const a of alive) {
    if (a.id === bot.id) continue;
    const s = bot.sus[a.id] || 0;
    if (s > bestSus) { bestSus = s; best = a; }
  }
  if (best && (bestSus > 0.62 || chance(0.75))) return best.id;
  if (chance(0.25)) {
    const others = alive.filter(a => a.id !== bot.id);
    if (others.length) return pick(others).id;
  }
  return 'skip';
}

function resolveVotes(game) {
  const m = game.meeting;
  if (!m || m.resolving) return;
  m.resolving = true;
  m.phase = 'tally';
  m.timer = 3.2;
  for (const bot of game.agents) {
    if (!bot.alive || bot.isPlayer) continue;
    m.votes[bot.id] = botVote(game, bot);
  }
  const counts = {};
  let skip = 0;
  for (const [voter, target] of Object.entries(m.votes)) {
    if (target === 'skip') skip++;
    else counts[target] = (counts[target] || 0) + 1;
  }
  let max = 0, winner = null, tie = false;
  for (const [id, n] of Object.entries(counts)) {
    if (n > max) { max = n; winner = Number(id); tie = false; }
    else if (n === max) tie = true;
  }
  m.tally = { counts, skip, winner, tie, max };
  if (tie || !winner || skip >= max) {
    m.ejectedId = null;
    game.ui.feed('NO ONE WAS EJECTED', 'vote');
    game.ui.addMeetingChat({ who: 'COMMS', color: '#ffb545', text: 'VOTE TIED OR SKIPPED. NO EJECTION.', system: true });
    game.audio.eject();
  } else {
    const victim = game.agents.find(a => a.id === winner);
    if (victim) {
      victim.alive = false;
      victim.health = 0;
      victim.state = 'ejected';
      m.ejectedId = victim.id;
      m.ejectedRole = victim.isImpostor ? 'IMPOSTOR' : 'CREWMATE';
      game.ui.feed(`${victim.name} WAS EJECTED — ${m.ejectedRole}`, 'vote');
      game.ui.addMeetingChat({
        who: 'COMMS', color: victim.isImpostor ? '#ff4d5e' : '#8be28b',
        text: `${victim.name} was ${victim.isImpostor ? 'AN IMPOSTOR' : 'NOT AN IMPOSTOR'}.`, system: true
      });
      if (victim.isPlayer) {
        game.ui.setSpectate(true, 'YOU WERE EJECTED');
        game.ui.alert('YOU WERE EJECTED — SPECTATING', 'danger', 2800);
      }
      game.audio.eject();
      if (navigator.vibrate) navigator.vibrate([30, 30, 60]);
    }
  }
  game.ui.showMeetingTally(m, game.agents, game.player);
  game.ui.updateMeeting(m, game.agents, game.player);
}

function finishMeeting(game) {
  const m = game.meeting;
  game.meeting = null;
  game.ui.closeMeeting();
  game.teleportToSpawns();
  game.phase = 'live';
  game.playerVoted = false;
  game.ui.setPhase('ROUND LIVE', 3, false);
  game.ui.updateHUD(game);
  if (m && m.ejectedId != null) {
    game.ui.feed('ROUND RESUMES', 'info');
  }
  game.checkWin();
}
