import { clamp, safeLocal, dist } from './util.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(audio, input) {
    this.audio = audio;
    this.input = input;
    this.game = null;
    this.crewChips = new Map();
    this.alertTimer = 0;
    this.crossTimer = 0;
    this.rotateShown = false;
    this.titleStats = $('titleStats');
    this.roster = $('titleRoster');
    this.role = safeLocal('dp_role', 'random');
    this.sound = safeLocal('dp_sound', true);
    this.tiltOn = false;
    this.bind();
    this.buildRoster();
    this.updateTitleStats();
    this.setRoleLabel(this.role);
    this.setSoundLabel(this.sound);
    this.setTiltLabel(false);
    this.updateRotateHint();
    window.addEventListener('resize', () => this.updateRotateHint());
  }

  attach(game) { this.game = game; }

  bind() {
    $('btnPlay').addEventListener('click', () => {
      this.audio.init();
      this.hideHow();
      this.game.startMatch();
    });
    $('btnHow').addEventListener('click', () => this.showHow());
    $('howClose').addEventListener('click', () => this.hideHow());
    $('howOk').addEventListener('click', () => this.hideHow());
    $('btnPause').addEventListener('click', () => this.game.setPaused(true));
    $('btnResume').addEventListener('click', () => this.game.setPaused(false));
    $('btnQuit').addEventListener('click', () => {
      this.hidePause();
      this.game.phase = 'menu';
      this.game.paused = false;
      this.setTitle(true);
      this.setHUD(false);
    });
    $('btnRematch').addEventListener('click', () => {
      this.hideEnd();
      this.game.startMatch();
    });
    $('btnMenu').addEventListener('click', () => {
      this.hideEnd();
      this.game.phase = 'menu';
      this.game.paused = false;
      this.setTitle(true);
      this.setHUD(false);
    });

    const useBtn = $('btnUse');
    useBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      useBtn.classList.add('held');
      this.game.useDown();
    });
    const useUp = (e) => {
      if (e) e.preventDefault();
      useBtn.classList.remove('held');
      this.game.useUp();
    };
    useBtn.addEventListener('pointerup', useUp);
    useBtn.addEventListener('pointercancel', useUp);
    useBtn.addEventListener('pointerleave', (e) => { if (this.game.useHeld) useUp(e); });

    const fire = $('btnFire');
    fire.addEventListener('pointerdown', (e) => { e.preventDefault(); this.input.fireHeld = true; fire.classList.add('held'); });
    const fireUp = (e) => { if (e) e.preventDefault(); this.input.fireHeld = false; fire.classList.remove('held'); };
    fire.addEventListener('pointerup', fireUp);
    fire.addEventListener('pointercancel', fireUp);
    fire.addEventListener('pointerleave', fireUp);

    $('btnKnife').addEventListener('click', () => this.game.playerKnife());
    $('btnSabotage').addEventListener('click', () => this.game.playerSabotage());
    $('btnReport').addEventListener('click', () => {
      const ctx = this.game.getContext();
      if (ctx && ctx.type === 'report') this.game.reportBody(ctx.body);
    });
    $('btnMeeting').addEventListener('click', () => this.game.callEmergency());

    $('btnTilt').addEventListener('click', () => this.toggleTilt());
    $('btnTilt2').addEventListener('click', () => this.toggleTilt());
    $('btnSound').addEventListener('click', () => this.toggleSound());
    $('btnSound2').addEventListener('click', () => this.toggleSound());
    $('btnRole').addEventListener('click', () => {
      const order = ['random', 'crew', 'impostor'];
      const next = order[(order.indexOf(this.role) + 1) % order.length];
      this.role = next;
      this.game.setRolePref(next);
      this.setRoleLabel(next);
      this.audio.ui();
    });

    $('accuseBtn').addEventListener('click', () => {
      const m = this.game.meeting;
      if (m && m.selected != null) this.game.accuse(m.selected);
    });
    $('voteBtn').addEventListener('click', () => {
      const m = this.game.meeting;
      if (m && m.selected != null) this.game.castVote(m.selected);
    });
    $('skipBtn').addEventListener('click', () => this.game.castVote(null));
    document.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', () => this.game.quickChat(btn.dataset.quick));
    });
    $('voteGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.vote-card');
      if (!card || card.classList.contains('dead')) return;
      const m = this.game.meeting;
      if (!m) return;
      m.selected = Number(card.dataset.id);
      this.audio.ui();
      this.updateMeeting(m, this.game.agents, this.game.player);
    });
  }

  async toggleTilt() {
    if (this.tiltOn) {
      this.input.disableTilt();
      this.tiltOn = false;
      this.setTiltLabel(false);
      this.audio.ui();
      return;
    }
    const res = await this.input.enableTilt();
    if (res.ok) {
      this.tiltOn = true;
      this.setTiltLabel(true);
      this.alert('TILT AIM ON — HOLD YOUR PHONE COMFORTABLY', 'good', 2200);
    } else {
      this.tiltOn = false;
      this.setTiltLabel(false);
      this.alert(res.reason, 'danger', 3000);
    }
  }

  toggleSound() {
    this.sound = !this.sound;
    this.game.setSound(this.sound);
    this.setSoundLabel(this.sound);
    if (this.sound) this.audio.ui();
  }

  setTiltLabel(on) {
    const label = `TILT AIM: ${on ? 'ON' : 'OFF'}`;
    for (const id of ['btnTilt', 'btnTilt2']) {
      const el = $(id);
      if (el) { el.textContent = label; el.classList.toggle('on', on); }
    }
  }

  setSoundLabel(on) {
    const label = `SOUND: ${on ? 'ON' : 'OFF'}`;
    for (const id of ['btnSound', 'btnSound2']) {
      const el = $(id);
      if (el) { el.textContent = label; el.classList.toggle('on', on); }
    }
  }

  setRoleLabel(role) {
    const el = $('btnRole');
    if (el) el.textContent = `ROLE: ${role.toUpperCase()}`;
  }

  buildRoster() {
    const colors = ['#5fe3d0', '#ff4d5e', '#ff9f43', '#8be28b', '#c29bff', '#ff8fce'];
    this.roster.innerHTML = colors.map((c, i) =>
      `<span class="roster-dot" style="background:${c};color:${c};animation-delay:${i * .22}s"></span>`
    ).join('');
  }

  updateTitleStats() {
    const rounds = safeLocal('dp_rounds', 0), wins = safeLocal('dp_wins', 0);
    if (this.titleStats) this.titleStats.textContent = `${rounds} ROUND${rounds === 1 ? '' : 'S'} · ${wins} WIN${wins === 1 ? '' : 'S'}`;
  }

  setTitle(show) {
    $('titleScreen').classList.toggle('hidden', !show);
    if (show) { this.updateTitleStats(); this.setHUD(false); }
    this.updateRotateHint();
  }

  setHUD(show) { $('hud').classList.toggle('hidden', !show); this.updateRotateHint(); }

  setRole(role, player) {
    const badge = $('roleBadge');
    badge.style.display = 'block';
    badge.textContent = role === 'impostor' ? 'IMPOSTOR' : 'CREWMATE';
    badge.className = `role-badge ${role}`;
    $('crewList').classList.add('with-role');
    $('btnKnife').classList.toggle('hidden', role !== 'impostor');
    $('btnSabotage').classList.toggle('hidden', role !== 'impostor');
  }

  setCrew(agents, player, playerImp) {
    const list = $('crewList');
    list.innerHTML = '';
    this.crewChips.clear();
    for (const a of agents) {
      const chip = document.createElement('div');
      chip.className = 'crew-chip' + (a.isPlayer ? ' me' : '');
      const tag = a.isPlayer ? 'YOU' : (playerImp && a.isImpostor ? 'IMP' : 'OP');
      chip.innerHTML = `<span class="dot" style="background:${a.color};color:${a.color}"></span><span class="nm">${a.name}</span><span class="tag">${tag}</span>`;
      list.appendChild(chip);
      this.crewChips.set(a.id, chip);
    }
  }

  clearFeed() { $('feed').innerHTML = ''; }

  feed(text, type = 'info') {
    const feed = $('feed');
    const el = document.createElement('div');
    el.className = `feed-item ${type}`;
    el.textContent = text;
    feed.appendChild(el);
    while (feed.children.length > 6) feed.removeChild(feed.firstChild);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 350); }, 7600);
  }

  alert(text, type = 'info', dur = 2200) {
    const el = $('alert');
    el.textContent = text;
    el.className = `alert show ${type}`;
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => { el.classList.remove('show'); }, dur);
  }

  setPhase(label, timer, warn) {
    this._phase = label;
    this._phaseTimer = timer;
    this._phaseWarn = warn;
  }

  setIntel(pct, ready) {
    $('intelPct').textContent = `${Math.round(pct)}%`;
    $('intelFill').style.width = `${clamp(pct, 0, 100)}%`;
    const kit = $('kitLabel');
    kit.textContent = ready ? 'DEFUSE KIT: READY' : 'DEFUSE KIT: LOCKED';
    kit.classList.toggle('ready', ready);
  }

  setContext(ctx) {
    const hint = $('contextHint');
    const use = $('btnUse');
    if (!ctx) {
      hint.classList.remove('show');
      use.querySelector('.btn-label').textContent = 'USE';
      use.disabled = true;
      use.classList.remove('ready');
      return;
    }
    hint.textContent = ctx.label;
    hint.classList.add('show');
    const short = { task: 'TASK', defuse: 'DEFUSE', plant: 'PLANT', fix: 'FIX', report: 'REPORT', meeting: 'MEET' }[ctx.type] || 'USE';
    use.querySelector('.btn-label').textContent = short;
    use.disabled = false;
    use.classList.add('ready');
  }

  setUseReady(on) {
    const use = $('btnUse');
    use.disabled = !on;
    use.classList.toggle('ready', on);
  }

  setActionVisibility({ knife, sabotage, report, meeting }) {
    $('btnKnife').classList.toggle('hidden', !knife);
    $('btnSabotage').classList.toggle('hidden', !sabotage);
    $('btnReport').classList.toggle('hidden', !report);
    $('btnMeeting').classList.toggle('hidden', !meeting);
  }

  setProgress(label, pct, visible) {
    $('progressWrap').classList.toggle('hidden', !visible);
    if (visible) {
      $('progressLabel').textContent = label;
      $('progressFill').style.width = `${clamp(pct * 100, 0, 100)}%`;
    }
  }

  crosshairFire() {
    const c = $('crosshair');
    c.classList.add('firing');
    clearTimeout(this.crossTimer);
    this.crossTimer = setTimeout(() => c.classList.remove('firing'), 90);
  }

  setSpectate(show, reason) {
    $('spectateBar').classList.toggle('hidden', !show);
    if (show && reason) $('spectateReason').textContent = reason;
  }

  updateHUD(game) {
    const p = game.player;
    if (!p) return;
    const planted = game.bomb && game.bomb.state === 'planted';
    const timerVal = planted ? game.bomb.timer : game.roundTime;
    const timerEl = $('roundTimer');
    timerEl.textContent = fmt(timerVal);
    const warn = planted ? timerVal <= 10 : timerVal <= 20;
    timerEl.classList.toggle('warn', warn);
    $('phaseLabel').textContent = game.phase === 'deploy' ? 'DEPLOYING' : planted ? 'BOMB PLANTED' : game.phase === 'meeting' ? 'MEETING' : 'ROUND LIVE';
    $('intelPct').textContent = `${Math.round(game.intel)}%`;
    $('intelFill').style.width = `${game.intel}%`;
    $('ammoLine').textContent = p.reloadT > 0 ? `PISTOL · RELOADING` : `PISTOL · ${p.ammo} / ${p.maxAmmo}`;
    const kit = $('kitLabel');
    kit.textContent = game.intel >= 100 ? 'DEFUSE KIT: READY' : 'DEFUSE KIT: LOCKED';
    kit.classList.toggle('ready', game.intel >= 100);

    for (const a of game.agents) {
      const chip = this.crewChips.get(a.id);
      if (!chip) continue;
      chip.classList.toggle('dead', !a.alive);
      const tag = chip.querySelector('.tag');
      if (tag) {
        if (!a.alive) tag.textContent = 'DEAD';
        else if (a.isPlayer) tag.textContent = 'YOU';
        else if (p.isImpostor && a.isImpostor) tag.textContent = 'IMP';
        else tag.textContent = 'OP';
      }
    }

    const ctx = game.phase === 'live' && p.alive ? game.getContext() : null;
    this.setContext(ctx);
    const reportCtx = ctx && ctx.type === 'report';
    $('btnReport').classList.toggle('hidden', !reportCtx);
    $('btnKnife').classList.toggle('hidden', !p.isImpostor);
    $('btnSabotage').classList.toggle('hidden', !p.isImpostor);
    $('btnSabotage').disabled = game.sabotageCd > 0 || game.lightsOut > 0;
    $('btnKnife').disabled = p.knifeCd > 0;
    $('btnMeeting').disabled = game.emergencyUsed || planted || !p.alive ||
      dist(p.x, p.y, 250, 1115) > 90;
    $('btnMeeting').classList.toggle('hidden', game.emergencyUsed || planted || !p.alive ||
      dist(p.x, p.y, 250, 1115) > 90);

    let label = '', pct = 0, show = false;
    if (p.alive && game.phase === 'live') {
      if (p.plantProgress > 0) { label = 'PLANTING BOMB'; pct = p.plantProgress / 4; show = true; }
      else if (p.fixProgress > 0) { label = 'RESETTING BREAKER'; pct = p.fixProgress / 2.5; show = true; }
      else if (planted && !p.isImpostor && dist(p.x, p.y, game.bomb.x, game.bomb.y) < 90 && (game.bomb.defuseProgress > 0 || game.useHeld)) {
        label = 'DEFUSING'; pct = game.bomb.defuseProgress; show = true;
      }
    }
    this.setProgress(label, pct, show);

    const cross = $('crosshair');
    const showCross = p.alive && game.phase === 'live' && !game.taskOpen && !game.paused;
    cross.style.display = showCross ? '' : 'none';
    if (showCross) {
      let cx, cy;
      if (this.input.touchMode) {
        cx = (p.x + Math.cos(p.angle) * 86 - game.cam.x) * game.cam.zoom + game.view.w / 2 + game.cam.sx;
        cy = (p.y + Math.sin(p.angle) * 86 - game.cam.y) * game.cam.zoom + game.view.h / 2 + game.cam.sy;
      } else {
        cx = this.input.mouse.x; cy = this.input.mouse.y;
      }
      cross.style.left = cx + 'px';
      cross.style.top = cy + 'px';
    }
  }

  openTask(station, fake, onDone, onClose) {
    this.game.tasks.open(station, fake, onDone, onClose);
  }

  closeTask() { this.game.tasks.close(false); }

  openMeeting(m, agents, player) {
    $('meetingModal').classList.remove('hidden');
    $('meetingKicker').textContent = m.reason;
    $('meetingTitle').textContent = m.bodyName ? `${m.bodyName} is dead.` : 'Who called this?';
    $('meetingTimer').textContent = Math.ceil(m.timer);
    $('meetingPhase').textContent = 'DISCUSS';
    $('meetingChat').innerHTML = '';
    $('voteTally').classList.add('hidden');
    $('voteTally').innerHTML = '';
    $('voteHint').textContent = player.alive ? 'Tap an operator, then vote. Or skip.' : 'You are dead. You can watch, but not vote.';
    this.buildVoteGrid(m, agents, player);
    this.updateMeeting(m, agents, player);
  }

  buildVoteGrid(m, agents, player) {
    const grid = $('voteGrid');
    grid.innerHTML = '';
    for (const a of agents) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'vote-card' + (a.isPlayer ? ' me' : '') + (!a.alive ? ' dead' : '');
      card.dataset.id = a.id;
      card.innerHTML = `<span class="dot" style="background:${a.color};color:${a.color}"></span><span class="vc-info"><span class="vc-name">${a.name}</span><span class="vc-tag">${a.isPlayer ? 'YOU' : a.alive ? 'ALIVE' : 'DEAD'}</span></span><span class="vc-votes"></span>`;
      grid.appendChild(card);
    }
  }

  updateMeeting(m, agents, player) {
    if (!m) return;
    const counts = {};
    for (const t of Object.values(m.votes)) if (t !== 'skip') counts[t] = (counts[t] || 0) + 1;
    for (const card of $('voteGrid').children) {
      const id = Number(card.dataset.id);
      const agent = agents.find(a => a.id === id);
      card.classList.toggle('selected', m.selected === id);
      card.classList.toggle('dead', !agent || !agent.alive);
      const vc = card.querySelector('.vc-votes');
      if (vc) vc.textContent = counts[id] ? counts[id] : '';
      const tag = card.querySelector('.vc-tag');
      if (tag && agent) tag.textContent = agent.isPlayer ? 'YOU' : agent.alive ? 'ALIVE' : 'DEAD';
    }
    const alive = player.alive;
    $('voteBtn').disabled = !alive || m.phase !== 'vote' || m.playerVoted || m.selected == null;
    $('accuseBtn').disabled = !alive || m.phase !== 'discuss' || m.resolving || m.selected == null;
    $('skipBtn').disabled = !alive || m.phase !== 'vote' || m.playerVoted || m.resolving;
    document.querySelectorAll('[data-quick]').forEach(b => { b.disabled = !alive || m.phase !== 'discuss' || m.resolving; });
    $('meetingTimer').textContent = Math.max(0, Math.ceil(m.timer));
    $('meetingPhase').textContent = m.phase === 'vote' ? 'VOTE' : m.phase === 'tally' ? 'TALLY' : 'DISCUSS';
  }

  updateMeetingTimer(m) {
    $('meetingTimer').textContent = Math.max(0, Math.ceil(m.timer));
    $('meetingPhase').textContent = m.phase === 'vote' ? 'VOTE' : m.phase === 'tally' ? 'TALLY' : 'DISCUSS';
  }

  setMeetingPhase(phase) { $('meetingPhase').textContent = phase; }

  addMeetingChat(line) {
    const chat = $('meetingChat');
    const el = document.createElement('div');
    el.className = 'chat-line' + (line.system ? ' system' : '');
    el.innerHTML = `<span class="who" style="color:${line.color || '#ffb545'}">${line.who}</span><span>${escapeHtml(line.text)}</span>`;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  showMeetingTally(m, agents, player) {
    const tally = $('voteTally');
    tally.classList.remove('hidden');
    if (m.ejectedId != null) {
      const v = agents.find(a => a.id === m.ejectedId);
      tally.innerHTML = `<b>${v ? v.name : 'OPERATOR'}</b> was ejected · <b>${m.ejectedRole}</b>`;
    } else {
      tally.innerHTML = 'No one was ejected · <b>SKIP</b>';
    }
    this.updateMeeting(m, agents, player);
  }

  closeMeeting() { $('meetingModal').classList.add('hidden'); }

  showEnd(data) {
    const modal = $('endModal');
    modal.classList.remove('hidden');
    $('endKicker').textContent = data.playerWon ? 'ROUND COMPLETE · VICTORY' : 'ROUND COMPLETE · DEFEAT';
    const title = $('endTitle');
    title.textContent = data.winner === 'crew' ? 'CREW VICTORY' : 'IMPOSTORS WIN';
    title.className = data.winner === 'crew' ? 'crew' : 'imp';
    const card = $('endCard');
    card.classList.toggle('crew-win', data.winner === 'crew');
    card.classList.toggle('imp-win', data.winner !== 'crew');
    $('endReason').textContent = data.reason;
    $('endReveal').innerHTML = data.reveal.map(r =>
      `<div class="reveal-row ${r.isImpostor ? 'imp' : 'crew'}"><span class="dot" style="background:${r.color}"></span><span>${r.name}${r.isPlayer ? ' (YOU)' : ''}${r.alive ? '' : ' · DEAD'}</span><span class="role">${r.isImpostor ? 'IMPOSTOR' : 'CREW'}</span></div>`
    ).join('');
    $('endStats').innerHTML = `
      <span><b>${Math.round(data.stats.tasks)}%</b>INTEL</span>
      <span><b>${data.stats.kills}</b>KILLS</span>
      <span><b>${data.stats.reports}</b>REPORTS</span>
      <span><b>${data.stats.wins}/${data.stats.rounds}</b>WINS</span>`;
    this.updateTitleStats();
  }

  hideEnd() { $('endModal').classList.add('hidden'); }

  showPause() { $('pauseModal').classList.remove('hidden'); }
  hidePause() { $('pauseModal').classList.add('hidden'); }
  showHow() { $('howModal').classList.remove('hidden'); }
  hideHow() { $('howModal').classList.add('hidden'); }

  updateRotateHint() {
    const portrait = window.innerHeight > window.innerWidth;
    const inGame = this.game && this.game.phase !== 'menu';
    const show = inGame && portrait && window.innerWidth < 700 && this.input.touchMode;
    $('rotateHint').classList.toggle('hidden', !show);
  }
}

function fmt(sec) {
  sec = Math.max(0, Math.ceil(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
