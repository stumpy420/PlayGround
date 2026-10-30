import { clamp, angleDiff } from './util.js';

export class Input {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, down: false, inside: false };
    this.move = { x: 0, y: 0, active: false, id: null };
    this.aim = { x: 0, y: 0, active: false, firing: false, id: null };
    this.fireHeld = false;
    this.tilt = { enabled: false, supported: false, permission: 'unknown', base: null, vec: { x: 0, y: 0 }, raw: null };
    this.touchMode = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.onKeyAction = null;
    this.moveZone = document.getElementById('moveZone');
    this.aimZone = document.getElementById('aimZone');
    this.moveBase = this.moveZone.querySelector('.stick-base');
    this.aimBase = this.aimZone.querySelector('.stick-base');
    this.moveKnob = this.moveZone.querySelector('.stick-knob');
    this.aimKnob = this.aimZone.querySelector('.stick-knob');
    this.bindStick(this.moveZone, this.moveBase, this.moveKnob, this.move, 54);
    this.bindStick(this.aimZone, this.aimBase, this.aimKnob, this.aim, 50, true);
    this.bindDesktop();
    this.bindTilt();
    if (!this.touchMode) document.body.classList.add('desktop');
  }

  bindDesktop() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      if (this.keys.has(k)) return;
      this.keys.add(k);
      const actions = {
        e: 'use', r: 'report', f: 'knife', q: 'sabotage',
        ' ': 'meeting', escape: 'pause', m: 'meeting'
      };
      if (actions[k] && this.onKeyAction) this.onKeyAction(actions[k]);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.down = false; });
    const canvas = document.getElementById('game');
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.inside = true;
    });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (e.button === 0) { this.mouse.down = true; this.mouse.x = e.clientX; this.mouse.y = e.clientY; }
    });
    window.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) this.mouse.down = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  bindStick(zone, base, knob, state, radius, isAim = false) {
    const down = (e) => {
      if (e.pointerType === 'mouse') return;
      if (state.id !== null) return;
      e.preventDefault();
      zone.setPointerCapture?.(e.pointerId);
      state.id = e.pointerId;
      state.active = true;
      const zr = zone.getBoundingClientRect();
      const bx = clamp(e.clientX - zr.left, 54, zr.width - 54);
      const by = clamp(e.clientY - zr.top, 54, zr.height - 54);
      base.style.left = bx + 'px';
      base.style.top = by + 'px';
      base.style.bottom = 'auto';
      base.style.marginLeft = '0';
      base.style.transform = 'translate(-50%,-50%)';
      base.dataset.ox = bx;
      base.dataset.oy = by;
      zone.classList.add('active');
      if (isAim) { state.firing = true; state.lastAngle = null; }
      this.updateStick(zone, base, knob, state, e.clientX, e.clientY, radius);
    };
    const move = (e) => {
      if (state.id !== e.pointerId) return;
      e.preventDefault();
      this.updateStick(zone, base, knob, state, e.clientX, e.clientY, radius);
    };
    const up = (e) => {
      if (state.id !== e.pointerId) return;
      state.id = null;
      state.active = false;
      if (isAim) state.firing = false;
      state.x = 0; state.y = 0;
      zone.classList.remove('active');
      knob.style.transform = 'translate(0,0)';
      setTimeout(() => {
        if (state.id !== null) return;
        base.style.left = '';
        base.style.top = '';
        base.style.bottom = '';
        base.style.marginLeft = '';
        base.style.transform = '';
      }, 120);
    };
    zone.addEventListener('pointerdown', down);
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', up);
    zone.addEventListener('lostpointercapture', up);
  }

  updateStick(zone, base, knob, state, cx, cy, radius) {
    const zr = zone.getBoundingClientRect();
    const ox = zr.left + Number(base.dataset.ox || zr.width / 2);
    const oy = zr.top + Number(base.dataset.oy || zr.height / 2);
    let dx = cx - ox, dy = cy - oy;
    const len = Math.hypot(dx, dy);
    if (len > radius) { dx = dx / len * radius; dy = dy / len * radius; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    const nx = dx / radius, ny = dy / radius;
    const dead = 0.12;
    const mag = Math.hypot(nx, ny);
    if (mag < dead) { state.x = 0; state.y = 0; }
    else {
      const scale = (mag - dead) / (1 - dead) / mag;
      state.x = nx * scale;
      state.y = ny * scale;
    }
    if (state === this.aim && mag > 0.18) {
      state.lastAngle = Math.atan2(ny, nx);
    }
  }

  bindTilt() {
    this.tilt.supported = typeof DeviceOrientationEvent !== 'undefined';
    if (this.tilt.supported) {
      window.addEventListener('deviceorientation', (e) => {
        if (!this.tilt.enabled) return;
        const beta = e.beta ?? 0, gamma = e.gamma ?? 0;
        this.tilt.raw = { beta, gamma };
        if (!this.tilt.base) this.tilt.base = { beta, gamma };
        let dx = gamma - this.tilt.base.gamma;
        let dy = beta - this.tilt.base.beta;
        const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
        if (Math.abs(angle) === 90) {
          const t = dx; dx = dy * (angle > 0 ? 1 : -1); dy = -t * (angle > 0 ? 1 : -1);
        }
        const dead = 1.8;
        if (Math.abs(dx) < dead) dx = 0;
        if (Math.abs(dy) < dead) dy = 0;
        this.tilt.vec.x = clamp(dx / 24, -1, 1);
        this.tilt.vec.y = clamp(dy / 24, -1, 1);
      });
    }
  }

  async enableTilt() {
    if (!this.tilt.supported) return { ok: false, reason: 'Motion sensors are not available on this device.' };
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') return { ok: false, reason: 'Motion permission was denied. You can still use touch aim.' };
      }
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try { await DeviceMotionEvent.requestPermission(); } catch { /* orientation is enough */ }
      }
      this.tilt.enabled = true;
      this.tilt.base = null;
      this.tilt.vec.x = 0; this.tilt.vec.y = 0;
      this.tilt.permission = 'granted';
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'Motion permission could not be requested. Touch aim is still active.' };
    }
  }

  disableTilt() {
    this.tilt.enabled = false;
    this.tilt.vec.x = 0; this.tilt.vec.y = 0;
  }

  recalibrate() { this.tilt.base = this.tilt.raw ? { ...this.tilt.raw } : null; }

  get tiltActive() {
    return this.tilt.enabled && Math.hypot(this.tilt.vec.x, this.tilt.vec.y) > 0.06;
  }

  get moveVector() {
    let x = this.move.x, y = this.move.y;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y };
  }

  get firing() {
    return this.aim.firing || this.fireHeld || this.mouse.down;
  }

  get aimAngle() {
    if (this.tiltActive) return Math.atan2(this.tilt.vec.y, this.tilt.vec.x);
    if (this.aim.active && this.aim.lastAngle != null) return this.aim.lastAngle;
    return null;
  }
}
