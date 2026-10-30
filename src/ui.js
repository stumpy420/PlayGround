const $ = (id) => document.getElementById(id);

function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function avatarSVG(color) {
  return `<svg viewBox="0 0 48 52" aria-hidden="true">
    <path d="M10 10c0-5 4-8 9-8h10c5 0 9 3 9 8v27c0 4-3 7-7 7h-2l-2-7-2 7h-2l-2-7-2 7h-2c-4 0-7-3-7-7V10z" fill="${color}"/>
    <path d="M12 12c0-3 2-5 5-5h14c3 0 5 2 5 5v9H12V12z" fill="${color}" opacity=".8"/>
    <rect x="17" y="12" width="19" height="10" rx="5" fill="#c8f2ff"/>
    <rect x="21" y="14" width="9" height="3" rx="1.5" fill="#ffffff" opacity=".85"/>
    <path d="M6 19h5v16H6c-1 0-2-1-2-2V21c0-1 1-2 2-2z" fill="${color}" opacity=".72"/>
    <rect x="18" y="34" width="8" height="10" rx="3" fill="${color}" opacity=".55"/>
  </svg>`;
}

export class UI {
  constructor(game) {
    this.game = game;
    this.el = {};
    [
      'start-screen', 'btn-play', 'btn-howto', 'btn-tilt', 'btn-sound', 'boot-status',
      'hud', 'role-name', 'crew-alive', 'task-count', 'task-bar', 'objective-hint',
      'timer', 'radar', 'btn-meeting', 'crosshair', 'hitmarker', 'prompt', 'prompt-key',
      'prompt-text', 'prompt-sub', 'toasts', 'status-chips', 'desktop-hints', 'btn-action',
      'action-label', 'btn-pause', 'ammo', 'ammo-max', 'reload-bar', 'danger-vignette',
      'dark-vignette', 'flash', 'task-modal', 'task-code', 'task-title', 'task-body',
      'task-step', 'task-step-bar', 'task-close', 'meeting', 'meeting-kicker', 'meeting-title',
      'meeting-sub', 'vote-timer', 'crew-grid', 'transcript-lines', 'vote-readout',
      'vote-readout-bar', 'btn-skip', 'btn-vote', 'meeting-result', 'end-screen',
      'end-badge', 'end-title', 'end-reason', 'end-impostor', 'end-stats', 'btn-again',
      'btn-menu', 'pause', 'pause-tilt', 'pause-sound', 'pause-resume', 'pause-quit',
      'howto', 'btn-howto-close', 'rotate-hint', 'loading', 'stick-zone', 'stick-knob'
    ].forEach((id) => { this.el[id] = $(id); });
    this.radarCtx = this.el.radar?.getContext('2d');
    this.radarBg = null;
    this.radarTimer = 0;
    this.task = null;
    this.meeting = null;
    this.selectedVote = null;
    this.started = false;
    this.bind();
  }

  bind() {
    this.el['btn-play'].addEventListener('click', () => {
      if (this.started) return;
      this.started = true;
      this.game.startRound();
    });
    this.el['btn-howto'].addEventListener('click', () => this.el.howto.classList.remove('hidden'));
    this.el['btn-howto-close'].addEventListener('click', () => this.el.howto.classList.add('hidden'));
    this.el['btn-tilt'].addEventListener('click', async () => {
      await this.game.toggleTilt();
    });
    this.el['btn-sound'].addEventListener('click', () => this.game.toggleSound());
    this.el['btn-pause'].addEventListener('click', () => this.game.togglePause());
    this.el['pause-resume'].addEventListener('click', () => this.game.togglePause(false));
    this.el['pause-quit'].addEventListener('click', () => this.game.showMenu());
    this.el['pause-tilt'].addEventListener('click', async () => { await this.game.toggleTilt(); });
    this.el['pause-sound'].addEventListener('click', () => this.game.toggleSound());
    this.el['btn-meeting'].addEventListener('click', () => this.game.callEmergency());
    this.el['btn-action'].addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.game.useAction();
    });
    this.el['task-close'].addEventListener('click', () => this.closeTask());
    this.el['btn-skip'].addEventListener('click', () => this.castVote('skip'));
    this.el['btn-vote'].addEventListener('click', () => {
      if (this.selectedVote) this.castVote(this.selectedVote);
    });
    this.el['btn-again'].addEventListener('click', () => { this.el['end-screen'].classList.add('hidden'); this.game.startRound(); });
    this.el['btn-menu'].addEventListener('click', () => { this.el['end-screen'].classList.add('hidden'); this.game.showMenu(); });
    window.addEventListener('resize', () => this.updateRotateHint());
    this.updateRotateHint();
  }

  updateRotateHint() {
    const portrait = innerWidth < innerHeight && innerWidth < 900;
    this.el['rotate-hint'].classList.toggle('hidden', !portrait || this.el.hud.classList.contains('hidden'));
  }

  hideLoading() {
    this.el.loading.classList.add('done');
    setTimeout(() => this.el.loading.classList.add('hidden'), 600);
  }

  setBootStatus(text) { this.el['boot-status'].textContent = text; }

  showMenu() {
    this.el['start-screen'].classList.remove('hidden', 'leaving');
    this.el['end-screen'].classList.add('hidden');
    this.el['hud'].classList.add('hidden');
    this.el.meeting.classList.add('hidden');
    this.el.pause.classList.add('hidden');
    this.el['task-modal'].classList.add('hidden');
    this.started = false;
    this.updateRotateHint();
  }

  hideMenu() {
    this.el['start-screen'].classList.add('leaving');
    setTimeout(() => this.el['start-screen'].classList.add('hidden'), 560);
  }

  showHUD() {
    this.el.hud.classList.remove('hidden');
    this.updateRotateHint();
  }
  hideHUD() { this.el.hud.classList.add('hidden'); this.updateRotateHint(); }

  setRole(name) { this.el['role-name'].textContent = name; }
  setCrew(n) { this.el['crew-alive'].textContent = String(n); }
  setTimer(sec) {
    this.el.timer.textContent = fmtTime(sec);
    this.el.timer.classList.toggle('low', sec <= 30);
  }
  setTaskProgress(done, total) {
    this.el['task-count'].textContent = `${done} / ${total}`;
    [...this.el['task-bar'].children].forEach((el, i) => el.classList.toggle('done', i < done));
  }
  setObjectiveHint(text, alert = false) {
    this.el['objective-hint'].textContent = text;
    this.el['objective-hint'].classList.toggle('alert', alert);
  }
  setAmmo(n, max) {
    this.el.ammo.textContent = String(n);
    this.el['ammo-max'].textContent = `/ ${max}`;
    this.el.ammo.parentElement.classList.toggle('empty', n === 0);
  }
  setReloading(on, progress = 0) {
    this.el['reload-bar'].classList.toggle('on', on);
    this.el['reload-bar'].firstElementChild.style.width = `${Math.round(progress * 100)}%`;
  }
  setDanger(on) { this.el['danger-vignette'].classList.toggle('on', on); }
  setDark(on) { this.el['dark-vignette'].classList.toggle('on', on); }
  flash(kind) {
    const el = this.el.flash;
    el.className = 'fx';
    void el.offsetWidth;
    el.classList.add(kind === 'damage' ? 'damage' : 'fire');
  }
  hitmarker() {
    const el = this.el.hitmarker;
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }
  crosshairFire() {
    this.el.crosshair.classList.add('firing');
    setTimeout(() => this.el.crosshair.classList.remove('firing'), 90);
  }

  setPrompt(data) {
    if (!data) { this.el.prompt.classList.add('hidden'); return; }
    this.el.prompt.classList.remove('hidden');
    this.el.prompt.classList.toggle('report', data.type === 'report');
    this.el['prompt-key'].textContent = data.key || 'E';
    this.el['prompt-text'].textContent = data.text || 'USE';
    this.el['prompt-sub'].textContent = data.sub || '';
    this.el['prompt-key'].style.display = this.game.player?.isTouch ? 'none' : '';
  }

  setAction(label, enabled = true) {
    this.el['action-label'].textContent = label;
    this.el['btn-action'].disabled = !enabled;
    this.el['btn-action'].classList.toggle('ready', enabled);
  }

  setChips(list) {
    const root = this.el['status-chips'];
    const key = list.map((c) => `${c.text}${c.type || ''}`).join('|');
    if (key === this._chipKey) return;
    this._chipKey = key;
    root.innerHTML = '';
    for (const c of list) {
      const d = document.createElement('div');
      d.className = `status-chip ${c.type || ''}`;
      d.textContent = c.text;
      root.appendChild(d);
    }
  }

  toast(text, type = '') {
    const d = document.createElement('div');
    d.className = `toast ${type}`;
    d.textContent = text;
    this.el.toasts.appendChild(d);
    setTimeout(() => d.remove(), 3900);
  }

  setMeetingButton(enabled) { this.el['btn-meeting'].disabled = !enabled; }
  setTiltLabel(on) {
    this.el['btn-tilt'].setAttribute('aria-pressed', String(on));
    this.el['btn-tilt'].innerHTML = `<span class="chip-dot"></span>TILT AIM: ${on ? 'ON' : 'OFF'}`;
    this.el['pause-tilt'].querySelector('b').textContent = on ? 'ON' : 'OFF';
  }
  setSoundLabel(on) {
    this.el['btn-sound'].setAttribute('aria-pressed', String(on));
    this.el['btn-sound'].innerHTML = `<span class="chip-dot"></span>SOUND: ${on ? 'ON' : 'OFF'}`;
    this.el['pause-sound'].querySelector('b').textContent = on ? 'ON' : 'OFF';
  }

  openPause() { this.el.pause.classList.remove('hidden'); }
  closePause() { this.el.pause.classList.add('hidden'); }

  initRadar(world) {
    const size = 320;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const toPx = (v) => ((v + 31) / 62) * size;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(8,13,8,.9)';
    ctx.fillRect(0, 0, size, size);
    // grid
    ctx.strokeStyle = 'rgba(245,185,66,.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, (size / 2) * (i / 4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (size / 4) * i);
      ctx.lineTo(size, (size / 4) * i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo((size / 4) * i, 0);
      ctx.lineTo((size / 4) * i, size);
      ctx.stroke();
    }
    for (const col of world.colliders) {
      const w = (col.maxX - col.minX) / 62 * size;
      const h = (col.maxZ - col.minZ) / 62 * size;
      if (w < 2 && h < 2) continue;
      ctx.fillStyle = 'rgba(170,146,103,.32)';
      ctx.fillRect(toPx(col.minX), toPx(col.minZ), w, h);
    }
    // outer bounds
    ctx.strokeStyle = 'rgba(245,185,66,.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(toPx(-30.4), toPx(-30.4), (60.8 / 62) * size, (60.8 / 62) * size);
    // site A
    ctx.fillStyle = 'rgba(245,185,66,.6)';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('A', toPx(18) - 6, toPx(-19) + 6);
    ctx.restore();
    // outer ring
    ctx.strokeStyle = 'rgba(245,185,66,.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.stroke();
    this.radarBg = c;
  }

  updateRadar(dt, data) {
    this.radarTimer += dt;
    if (this.radarTimer < 0.08 || !this.radarBg) return;
    this.radarTimer = 0;
    const ctx = this.radarCtx;
    if (!ctx) return;
    const size = 320;
    const toPx = (v) => ((v + 31) / 62) * size;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(this.radarBg, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.clip();
    // tasks
    for (const st of data.stations) {
      if (st.done) continue;
      const x = toPx(st.x);
      const y = toPx(st.z);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }
    // bodies
    for (const b of data.bodies) {
      const x = toPx(b.x);
      const y = toPx(b.z);
      ctx.strokeStyle = '#ff4b3e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
      ctx.stroke();
    }
    // panel
    if (data.sabotage) {
      const x = toPx(data.panel.x);
      const y = toPx(data.panel.z);
      ctx.fillStyle = Math.sin(performance.now() / 200) > 0 ? '#ff4b3e' : '#5c120d';
      ctx.fillRect(x - 4, y - 4, 8, 8);
    }
    // bots
    for (const bot of data.bots) {
      if (!bot.alive) continue;
      const x = toPx(bot.x);
      const y = toPx(bot.z);
      ctx.fillStyle = bot.isYou ? '#f2e9d6' : '#64e6c2';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      if (!bot.isYou) {
        ctx.strokeStyle = 'rgba(5,9,5,.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    // player arrow
    const px = toPx(data.player.x);
    const py = toPx(data.player.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-data.player.yaw);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---------------- tasks ----------------
  openTask(station, onComplete) {
    this.task = { station, onComplete, raf: null, keyHandler: null, done: false, cleanups: [] };
    this.el['task-code'].textContent = station.code;
    this.el['task-title'].textContent = station.name;
    this.el['task-body'].innerHTML = '';
    this.el['task-modal'].classList.remove('hidden');
    this.setTaskStep(0, 1);
    if (station.type === 'wires') this.buildWires();
    else if (station.type === 'keypad') this.buildKeypad();
    else this.buildCalibrate();
  }

  setTaskStep(step, total) {
    this.el['task-step'].textContent = `STEP ${Math.min(step + 1, total)} OF ${total}`;
    this.el['task-step-bar'].style.width = `${Math.round((step / total) * 100)}%`;
  }

  closeTask(success = false) {
    if (!this.task) return;
    if (this.task.raf) cancelAnimationFrame(this.task.raf);
    if (this.task.keyHandler) window.removeEventListener('keydown', this.task.keyHandler);
    for (const fn of this.task.cleanups) fn();
    const task = this.task;
    this.task = null;
    this.el['task-modal'].classList.add('hidden');
    this.el['task-body'].innerHTML = '';
    if (success) this.game.taskClosed(true);
    else this.game.cancelTask(task.station);
  }

  finishTask() {
    if (!this.task || this.task.done) return;
    this.task.done = true;
    const task = this.task;
    this.game.audio?.taskDone();
    const outcome = this.game.completeTask(task.station);
    setTimeout(() => {
      if (!this.task) return;
      this.closeTask(true);
      if (!outcome) this.toast('TASK COMPLETE', 'green');
    }, 520);
  }

  buildWires() {
    const colors = ['#ff5a5a', '#56b6ff', '#ffd45e', '#c084ff'];
    const right = [...colors].sort(() => Math.random() - 0.5);
    const body = this.el['task-body'];
    const hint = document.createElement('p');
    hint.className = 'task-hint';
    hint.innerHTML = 'Restore the <b>fiber links</b>. Tap a socket on the left, then its matching colour on the right.';
    body.appendChild(hint);
    const gameEl = document.createElement('div');
    gameEl.className = 'wire-game';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.classList.add('wire-svg');
    gameEl.appendChild(svg);
    const leftCol = document.createElement('div');
    leftCol.className = 'wire-col left';
    const rightCol = document.createElement('div');
    rightCol.className = 'wire-col right';
    gameEl.appendChild(leftCol);
    gameEl.appendChild(rightCol);
    body.appendChild(gameEl);

    let selected = null;
    let matched = 0;
    const makeNode = (color, side, index) => {
      const n = document.createElement('button');
      n.className = 'wire-node';
      n.style.setProperty('--c', color);
      n.dataset.color = color;
      n.dataset.index = String(index);
      n.setAttribute('aria-label', `${side} ${color}`);
      n.addEventListener('click', () => {
        if (n.classList.contains('done')) return;
        if (side === 'left') {
          if (selected) selected.classList.remove('sel');
          selected = n;
          n.classList.add('sel');
          this.game.audio?.taskStep();
          return;
        }
        if (!selected) {
          this.game.audio?.taskFail();
          return;
        }
        if (selected.dataset.color === color) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '14');
          line.setAttribute('y1', String((Number(selected.dataset.index) + 0.5) * 25));
          line.setAttribute('x2', '86');
          line.setAttribute('y2', String((index + 0.5) * 25));
          line.setAttribute('stroke', color);
          svg.appendChild(line);
          selected.classList.add('done');
          n.classList.add('done');
          selected.classList.remove('sel');
          selected = null;
          matched++;
          this.game.audio?.taskStep();
          this.setTaskStep(matched, 4);
          if (matched === 4) this.finishTask();
        } else {
          this.game.audio?.taskFail();
          n.classList.add('sel');
          const captured = selected;
          setTimeout(() => { n.classList.remove('sel'); captured.classList.remove('sel'); }, 260);
          selected = null;
        }
      });
      return n;
    };
    colors.forEach((c, i) => leftCol.appendChild(makeNode(c, 'left', i)));
    right.forEach((c, i) => rightCol.appendChild(makeNode(c, 'right', i)));
  }

  buildKeypad() {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const body = this.el['task-body'];
    body.innerHTML = `
      <div class="keypad-wrap">
        <p class="task-hint" style="text-align:center;margin:0">Enter the <b>bypass code</b> shown on the console.</p>
        <div class="code-display"><span>ACCESS CODE</span><b>${code.split('').join(' ')}</b></div>
        <div class="code-slots" id="code-slots"><i></i><i></i><i></i><i></i></div>
        <div class="keypad" id="keypad">
          ${[1,2,3,4,5,6,7,8,9].map((n) => `<button data-key="${n}">${n}</button>`).join('')}
          <button data-key="clear" class="wide">CLEAR</button>
          <button data-key="0">0</button>
        </div>
      </div>`;
    let entered = '';
    const slots = [...body.querySelectorAll('#code-slots i')];
    const pad = body.querySelector('#keypad');
    const render = () => slots.forEach((s, i) => { s.textContent = entered[i] || ''; s.classList.toggle('filled', Boolean(entered[i])); });
    const check = () => {
      if (entered === code) {
        this.game.audio?.taskStep();
        pad.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        this.setTaskStep(4, 4);
        this.finishTask();
      } else {
        this.game.audio?.taskFail();
        pad.classList.add('shake');
        setTimeout(() => pad.classList.remove('shake'), 320);
        entered = '';
        render();
        this.setTaskStep(0, 4);
      }
    };
    pad.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const key = btn.dataset.key;
      if (key === 'clear') { entered = ''; render(); this.game.audio?.taskStep(); return; }
      if (entered.length >= 4) return;
      entered += key;
      this.game.audio?.taskStep();
      render();
      this.setTaskStep(entered.length, 4);
      if (entered.length === 4) setTimeout(check, 120);
    });
    render();
    this.setTaskStep(0, 4);
    this.task.keyHandler = (e) => {
      if (e.key >= '0' && e.key <= '9' && entered.length < 4) { entered += e.key; render(); this.setTaskStep(entered.length, 4); if (entered.length === 4) setTimeout(check, 120); }
      if (e.key === 'Backspace') { entered = entered.slice(0, -1); render(); }
    };
    window.addEventListener('keydown', this.task.keyHandler);
  }

  buildCalibrate() {
    const body = this.el['task-body'];
    body.innerHTML = `
      <div class="cal-wrap">
        <p class="task-hint" style="text-align:center;margin:0">Time the <b>pressure lock</b> inside the green band. Three clean locks restore the line.</p>
        <div class="cal-track" id="cal-track"><div class="cal-target" id="cal-target"></div><div class="cal-needle" id="cal-needle"></div></div>
        <div class="cal-pips" id="cal-pips"><i></i><i></i><i></i></div>
        <div class="cal-feedback" id="cal-feedback">AWAITING LOCK</div>
        <button class="btn btn-primary btn-small cal-btn" id="cal-btn">LOCK</button>
      </div>`;
    const track = body.querySelector('#cal-track');
    const target = body.querySelector('#cal-target');
    const needle = body.querySelector('#cal-needle');
    const pips = [...body.querySelectorAll('#cal-pips i')];
    const feedback = body.querySelector('#cal-feedback');
    const btn = body.querySelector('#cal-btn');
    let pos = 0.1;
    let dir = 1;
    let speed = 0.34;
    let hits = 0;
    let last = performance.now();
    let band = { start: 0.62, end: 0.78 };
    const placeBand = () => {
      const width = 0.12 + Math.random() * 0.055;
      const start = 0.14 + Math.random() * (0.78 - width - 0.14);
      band = { start, end: start + width };
      target.style.left = `${start * 100}%`;
      target.style.width = `${width * 100}%`;
    };
    placeBand();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      needle.style.left = `${pos * 100}%`;
      this.task.raf = requestAnimationFrame(loop);
    };
    this.task.raf = requestAnimationFrame(loop);
    const lock = () => {
      if (!this.task || this.task.done) return;
      if (pos >= band.start && pos <= band.end) {
        hits++;
        pips[hits - 1]?.classList.add('hit');
        feedback.textContent = hits < 3 ? 'LOCK CLEAN — HOLD' : 'PRESSURE STABLE';
        this.game.audio?.taskStep();
        this.setTaskStep(hits, 3);
        if (hits >= 3) {
          btn.disabled = true;
          this.finishTask();
          return;
        }
        speed = Math.min(0.78, speed + 0.11);
        placeBand();
      } else {
        feedback.textContent = 'MISS — RECALIBRATE';
        this.game.audio?.taskFail();
        track.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 180 });
      }
    };
    btn.addEventListener('click', lock);
    this.task.keyHandler = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); lock(); }
      if (e.code === 'Escape') this.closeTask();
    };
    window.addEventListener('keydown', this.task.keyHandler);
    this.setTaskStep(0, 3);
  }

  // ---------------- meeting ----------------
  openMeeting(data) {
    this.selectedVote = null;
    this.meeting = data;
    this.el['meeting-kicker'].textContent = data.kicker || 'BODY REPORTED';
    this.el['meeting-title'].textContent = data.title || 'WHO IS THE TRAITOR?';
    this.el['meeting-sub'].textContent = data.sub || 'Read the comms. The crew can only eject one operator.';
    this.el['vote-timer'].textContent = String(Math.ceil(data.seconds || 20));
    this.el['vote-readout'].textContent = `0 / ${data.voterCount || data.participants.length} VOTES LOCKED`;
    this.el['vote-readout-bar'].style.width = '0%';
    this.el['meeting-result'].classList.add('hidden');
    this.el['btn-vote'].disabled = true;
    this.el['btn-skip'].disabled = false;
    this.el['btn-vote'].textContent = 'LOCK VOTE';
    this.el['btn-skip'].textContent = 'SKIP VOTE';
    const grid = this.el['crew-grid'];
    grid.innerHTML = '';
    for (const p of data.participants) {
      const card = document.createElement('button');
      card.className = `crew-card${p.alive ? '' : ' dead'}${p.isYou ? ' you' : ''}`;
      card.dataset.id = p.id;
      card.disabled = !p.alive || p.isYou;
      card.innerHTML = `
        <div class="avatar" style="--c:${p.css}">${avatarSVG(p.css)}</div>
        <div class="crew-meta"><b style="color:${p.css}">${p.name}</b><span class="${p.isYou ? 'you' : ''}">${p.isYou ? 'YOU' : p.alive ? 'CREW LINK' : 'KIA'}</span></div>
        <span class="crew-vote">VOTED</span>`;
      card.addEventListener('click', () => this.selectVote(p.id));
      grid.appendChild(card);
    }
    const lines = this.el['transcript-lines'];
    lines.innerHTML = '';
    const sys = document.createElement('div');
    sys.className = 'msg sys';
    sys.textContent = data.opening || 'SQUAD LINK OPEN — comms are live.';
    lines.appendChild(sys);
    (data.transcript || []).forEach((line, i) => {
      const m = document.createElement('div');
      m.className = `msg${line.you ? ' you' : ''}${line.accuse ? ' accuse' : ''}${line.sys ? ' sys' : ''}`;
      m.style.animationDelay = `${0.18 + i * 0.55}s`;
      if (line.name) {
        const b = document.createElement('b');
        b.textContent = `${line.name}: `;
        b.style.setProperty('--c', line.css || '#f2e9d6');
        m.appendChild(b);
      }
      m.appendChild(document.createTextNode(line.text));
      lines.appendChild(m);
    });
    if (data.clue) {
      const clue = document.createElement('div');
      clue.className = 'msg sys';
      clue.style.animationDelay = `${0.18 + (data.transcript?.length || 0) * 0.55}s`;
      clue.textContent = data.clue;
      lines.appendChild(clue);
    }
    this.el.meeting.classList.remove('hidden');
    this.el['btn-meeting'].disabled = true;
  }

  selectVote(id) {
    if (!this.meeting || this.meeting.playerVoted) return;
    this.selectedVote = id;
    for (const card of this.el['crew-grid'].querySelectorAll('.crew-card')) {
      card.classList.toggle('selected', card.dataset.id === id);
    }
    this.el['btn-vote'].disabled = false;
    this.game.audio?.taskStep();
  }

  castVote(id) {
    if (!this.meeting || this.meeting.playerVoted) return;
    this.meeting.playerVoted = true;
    this.selectedVote = id === 'skip' ? null : id;
    this.el['btn-vote'].disabled = true;
    this.el['btn-skip'].disabled = true;
    this.el['btn-vote'].textContent = 'VOTE LOCKED';
    for (const card of this.el['crew-grid'].querySelectorAll('.crew-card')) {
      card.disabled = true;
      card.classList.remove('selected');
      if (id !== 'skip' && card.dataset.id === id) card.classList.add('selected');
    }
    this.game.audio?.vote();
    if (id === 'skip') this.el['btn-skip'].textContent = 'SKIP LOCKED';
    this.game.castVote(id);
  }

  markVoted(id, count, total) {
    const card = this.el['crew-grid'].querySelector(`[data-id="${id}"]`);
    card?.classList.add('voted');
    if (card) card.querySelector('.crew-vote').textContent = 'VOTED';
    this.el['vote-readout'].textContent = `${count} / ${total} VOTES LOCKED`;
    this.el['vote-readout-bar'].style.width = `${Math.round((count / total) * 100)}%`;
  }

  setVoteTimer(sec) {
    this.el['vote-timer'].textContent = String(Math.max(0, Math.ceil(sec)));
    if (sec <= 0 && this.meeting && !this.meeting.playerVoted) {
      this.meeting.playerVoted = true;
      this.el['btn-vote'].disabled = true;
      this.el['btn-skip'].disabled = true;
      this.el['btn-vote'].textContent = 'TIME EXPIRED';
    }
  }

  showMeetingResult({ ejected, isImpostor, tie, votes, total, skipped, players }) {
    const root = this.el['meeting-result'];
    root.classList.remove('hidden');
    const kicker = tie || skipped ? 'NO EJECTION' : isImpostor ? 'TRAITOR EJECTED' : 'CREWMATE EJECTED';
    const title = tie || skipped ? 'NO ONE WAS EJECTED' : `${ejected} WAS EJECTED`;
    const sub = tie || skipped ? 'The crew could not reach a majority. The round continues.' : isImpostor ? 'Their disguise is gone. The crew wins the round.' : `${ejected} was not the traitor. The crew is one short.`;
    const tally = [];
    for (const p of players) {
      const v = votes[p.id];
      if (!v) continue;
      const target = v === 'skip' ? 'SKIP' : players.find((q) => q.id === v)?.name || '?';
      tally.push(`<span class="res-vote">${p.name} → ${target}</span>`);
    }
    root.innerHTML = `
      <div class="res-kicker">${kicker} · ${total} VOTES</div>
      <h3>${title}</h3>
      <p>${sub}</p>
      <div class="res-tally">${tally.join('')}</div>`;
    this.game.audio?.eject(isImpostor);
  }

  closeMeeting() {
    this.el.meeting.classList.add('hidden');
    this.el['meeting-result'].classList.add('hidden');
    this.meeting = null;
  }

  // ---------------- end ----------------
  showEnd(data) {
    this.el['end-screen'].classList.remove('hidden');
    this.el['end-badge'].textContent = data.win ? 'CREW VICTORY' : 'TRAITOR VICTORY';
    this.el['end-badge'].classList.toggle('lose', !data.win);
    this.el['end-title'].textContent = data.title;
    this.el['end-reason'].textContent = data.reason;
    this.el['end-impostor'].textContent = data.impostor;
    const stats = data.stats || {};
    this.el['end-stats'].innerHTML = `
      <div class="end-stat"><b>${stats.tasks ?? 0}/6</b><span>TASKS</span></div>
      <div class="end-stat"><b>${stats.crewLost ?? 0}</b><span>CREW LOST</span></div>
      <div class="end-stat"><b>${stats.time ?? '0:00'}</b><span>ROUND TIME</span></div>
      <div class="end-stat"><b>${stats.shots ?? 0}</b><span>SHOTS FIRED</span></div>`;
    this.el.pause.classList.add('hidden');
    this.el['meeting'].classList.add('hidden');
  }
}
