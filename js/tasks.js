import { pick, rand, shuffle, clamp } from './util.js';

const COLORS = [
  { name: 'RED', hex: '#ff4d5e' },
  { name: 'CYAN', hex: '#5fe3d0' },
  { name: 'AMBER', hex: '#ffb545' },
  { name: 'LIME', hex: '#8be28b' },
  { name: 'VIOLET', hex: '#c29bff' },
  { name: 'BLUE', hex: '#79b8ff' }
];

export class TaskSystem {
  constructor(audio) {
    this.audio = audio;
    this.modal = document.getElementById('taskModal');
    this.title = document.getElementById('taskTitle');
    this.kicker = document.getElementById('taskKicker');
    this.desc = document.getElementById('taskDesc');
    this.body = document.getElementById('taskBody');
    this.status = document.getElementById('taskStatus');
    this.closeBtn = document.getElementById('taskClose');
    this.active = false;
    this.raf = 0;
    this.timers = [];
    this.onDone = null;
    this.onClose = null;
    this.closeBtn.addEventListener('click', () => this.close(true));
  }

  later(fn, ms) {
    const id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  }

  open(station, fake, onDone, onClose) {
    this.active = true;
    this.fake = fake;
    this.onDone = onDone;
    this.onClose = onClose;
    this.modal.classList.remove('hidden');
    this.title.textContent = station.name;
    this.kicker.textContent = fake ? 'COVER TASK · NO INTEL' : 'CREW TASK';
    this.kicker.style.color = fake ? 'var(--red)' : 'var(--amber)';
    this.desc.textContent = station.desc + (fake ? ' Make it look convincing.' : '');
    this.status.textContent = '';
    this.status.className = 'task-status';
    this.body.innerHTML = '';
    this.closeBtn.style.display = fake ? 'none' : '';
    const type = station.type;
    if (type === 'wires') this.wires();
    else if (type === 'sequence') this.sequence();
    else if (type === 'timing') this.timing();
    else this.hold();
  }

  close(userClosed = false) {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.modal.classList.add('hidden');
    this.body.innerHTML = '';
    const cb = this.onClose;
    this.onDone = null; this.onClose = null;
    if (userClosed && cb) cb();
  }

  succeed() {
    if (!this.active) return;
    this.status.textContent = this.fake ? 'COVER MAINTAINED' : 'TASK COMPLETE · +20% INTEL';
    this.status.className = 'task-status good';
    this.audio.task();
    const cb = this.onDone;
    this.later(() => {
      this.active = false;
      this.modal.classList.add('hidden');
      this.body.innerHTML = '';
      this.onDone = null; this.onClose = null;
      if (cb) cb();
    }, 780);
  }

  fail(msg = 'CALIBRATION FAILED — RETRY') {
    this.status.textContent = msg;
    this.status.className = 'task-status bad';
    this.audio.fail();
  }

  // ---------- wires ----------
  wires() {
    const seq = shuffle(COLORS).slice(0, 3);
    let step = 0;
    const display = document.createElement('div');
    display.className = 'seq-display';
    const row = document.createElement('div');
    row.className = 'wire-row';
    const buttons = shuffle(COLORS).slice(0, 4);
    const update = () => {
      display.innerHTML = seq.map((c, i) =>
        `<span style="color:${i < step ? '#8be28b' : c.hex};opacity:${i === step ? 1 : .55}">${c.name}</span>`
      ).join('<span style="color:#4a5557">/</span>');
    };
    for (const c of buttons) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wire-btn';
      b.style.background = c.hex;
      b.style.color = '#07100e';
      b.textContent = c.name;
      b.addEventListener('click', () => {
        if (!this.active) return;
        this.audio.beep(540 + step * 120, 0.04, 0.05);
        if (c === seq[step]) {
          step++;
          update();
          if (step >= seq.length) this.succeed();
        } else {
          step = 0;
          update();
          this.fail('WRONG CIRCUIT — SEQUENCE RESET');
        }
      });
      row.appendChild(b);
    }
    const hint = document.createElement('div');
    hint.className = 'timing-meta';
    hint.innerHTML = '<span>MATCH THE SIGNAL ORDER</span><span>3 WIRES</span>';
    this.body.append(display, row, hint);
    update();
  }

  // ---------- sequence ----------
  sequence() {
    const total = 6;
    let next = 1;
    const hint = document.createElement('div');
    hint.className = 'timing-meta';
    hint.innerHTML = `<span>TAP IN ASCENDING ORDER</span><span id="seqCount">0 / ${total}</span>`;
    const grid = document.createElement('div');
    grid.className = 'pad-grid';
    const nums = shuffle([...Array(9)].map((_, i) => i + 1));
    for (const n of nums) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pad-btn';
      b.textContent = String(n);
      b.addEventListener('click', () => {
        if (!this.active || b.classList.contains('done')) return;
        if (n === next) {
          b.classList.add('done');
          next++;
          hint.querySelector('#seqCount').textContent = `${next - 1} / ${total}`;
          this.audio.beep(500 + next * 60, 0.04, 0.05);
          if (next > total) this.succeed();
        } else {
          this.fail('SEQUENCE ERROR — RESET');
          next = 1;
          grid.querySelectorAll('.pad-btn').forEach(x => x.classList.remove('done'));
          hint.querySelector('#seqCount').textContent = `0 / ${total}`;
        }
      });
      grid.appendChild(b);
    }
    this.body.append(hint, grid);
  }

  // ---------- timing ----------
  timing() {
    let hits = 0;
    const need = 3;
    let pos = 0, dir = 1, zoneStart = .42, zoneWidth = .2, speed = .72;
    const track = document.createElement('div');
    track.className = 'timing-track';
    const zone = document.createElement('div');
    zone.className = 'timing-zone';
    const cursor = document.createElement('div');
    cursor.className = 'timing-cursor';
    track.append(zone, cursor);
    const meta = document.createElement('div');
    meta.className = 'timing-meta';
    meta.innerHTML = `<span id="timingHits">HITS 0 / ${need}</span><span>TAP WHEN ALIGNED</span>`;
    const stop = document.createElement('button');
    stop.type = 'button';
    stop.className = 'primary-btn small';
    stop.textContent = 'LOCK PRESSURE';
    const layout = () => {
      zone.style.left = (zoneStart * 100) + '%';
      zone.style.width = (zoneWidth * 100) + '%';
      cursor.style.left = (pos * 100) + '%';
    };
    const tick = () => {
      if (!this.active) return;
      pos += dir * speed * 0.016;
      if (pos >= 1) { pos = 1; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      cursor.style.left = (pos * 100) + '%';
      this.raf = requestAnimationFrame(tick);
    };
    stop.addEventListener('click', () => {
      if (!this.active) return;
      if (pos >= zoneStart && pos <= zoneStart + zoneWidth) {
        hits++;
        this.audio.beep(880 + hits * 80, 0.05, 0.07);
        meta.querySelector('#timingHits').textContent = `HITS ${hits} / ${need}`;
        if (hits >= need) { this.succeed(); return; }
        zoneWidth = Math.max(.09, zoneWidth - .04);
        speed += .1;
        zoneStart = .15 + Math.random() * (.7 - zoneWidth);
        layout();
      } else {
        this.fail('PRESSURE SPIKE — TRY AGAIN');
      }
    });
    this.body.append(meta, track, stop);
    layout();
    this.raf = requestAnimationFrame(tick);
  }

  // ---------- hold ----------
  hold() {
    let value = 0, holding = false, done = false;
    const safeStart = .62, safeEnd = .86;
    const meter = document.createElement('div');
    meter.className = 'hold-meter';
    const safe = document.createElement('div');
    safe.className = 'safe';
    safe.style.left = safeStart * 100 + '%';
    safe.style.width = (safeEnd - safeStart) * 100 + '%';
    const fill = document.createElement('div');
    fill.className = 'fill';
    meter.append(safe, fill);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hold-btn';
    btn.textContent = 'HOLD TO SCAN';
    const meta = document.createElement('div');
    meta.className = 'timing-meta';
    meta.innerHTML = '<span>RELEASE IN THE GREEN</span><span>BIOMETRIC SWEEP</span>';
    const tick = () => {
      if (!this.active) return;
      if (holding && !done) {
        value += .009;
        if (value >= 1) {
          value = 1;
          holding = false;
          this.fail('OVERPRESSURE — SCAN ABORTED');
          value = 0;
        }
        fill.style.width = (value * 100) + '%';
      }
      this.raf = requestAnimationFrame(tick);
    };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (done || !this.active) return;
      holding = true;
      btn.classList.add('held');
      btn.textContent = 'HOLDING…';
    });
    const release = () => {
      if (!this.active || done) return;
      if (!holding) return;
      holding = false;
      btn.classList.remove('held');
      btn.textContent = 'HOLD TO SCAN';
      if (value >= safeStart && value <= safeEnd) {
        done = true;
        this.succeed();
      } else {
        value = 0;
        fill.style.width = '0%';
        this.fail('OUTSIDE SAFE RANGE — RETRY');
      }
    };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    this.body.append(meta, meter, btn);
    this.raf = requestAnimationFrame(tick);
  }
}
