const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Controls {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.callbacks = options.callbacks || {};
    this.isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || window.innerWidth < 850;
    this.sensitivity = options.sensitivity || 0.00225;
    this.touchSensitivity = 0.0042;
    this.yaw = 0;
    this.pitch = -0.015;
    this.moveX = 0;
    this.moveZ = 0;
    this.firing = false;
    this.aiming = false;
    this.sprint = false;
    this.lookDX = 0;
    this.lookDY = 0;
    this.jumpQueued = false;
    this.reloadQueued = false;
    this.grenadeQueued = false;
    this.tiltEnabled = false;
    this.tiltAvailable = typeof window.DeviceOrientationEvent !== 'undefined';
    this.tiltDenied = false;
    this.tiltNeedsPermission = typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function';
    this.tiltRef = { gamma: 0, beta: 0, baseYaw: 0, basePitch: 0, ready: false, gammaRaw: 0, betaRaw: 0 };
    this.tiltSensitivity = 0.0055;
    this.keys = new Set();
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };
    this.pointerLocked = false;
    this.stick = { id: null, x: 0, y: 0, cx: 0, cy: 0, radius: 48 };
    this.lookPointer = { id: null, x: 0, y: 0 };
    this.boundOrientation = this.onOrientation.bind(this);
    this.bind();
    if (this.isTouch) document.body.classList.add('touch');
  }

  bind() {
    const canvas = this.canvas;
    window.addEventListener('keydown', e => this.onKeyDown(e));
    window.addEventListener('keyup', e => this.onKeyUp(e));
    window.addEventListener('blur', () => { this.keys.clear(); this.firing = false; this.aiming = false; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.keys.clear(); this.firing = false; this.aiming = false; }
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
      if (!this.pointerLocked) document.body.classList.remove('locked');
      else document.body.classList.add('locked');
    });
    canvas.addEventListener('pointerdown', e => this.onCanvasDown(e));
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('pointermove', e => this.onPointerMove(e));
    window.addEventListener('pointerup', e => this.onPointerUp(e));
    window.addEventListener('pointercancel', e => this.onPointerUp(e));
    window.addEventListener('mousedown', e => {
      if (e.target !== canvas) return;
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this.aiming = true;
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) this.firing = false;
      if (e.button === 2) this.aiming = false;
    });
    canvas.addEventListener('click', () => {
      if (!this.isTouch && !this.pointerLocked && this.callbacks.canLockPointer?.() !== false) {
        this.requestPointerLock();
      }
    });
    canvas.addEventListener('wheel', e => e.preventDefault(), { passive: false });

    const stickZone = document.getElementById('stickZone');
    const knob = document.getElementById('stickKnob');
    if (stickZone) {
      stickZone.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        const r = document.getElementById('stickBase').getBoundingClientRect();
        this.stick.id = e.pointerId;
        this.stick.cx = r.left + r.width / 2;
        this.stick.cy = r.top + r.height / 2;
        this.stick.radius = r.width * 0.36;
        stickZone.setPointerCapture(e.pointerId);
        this.updateStick(e.clientX, e.clientY, knob);
      });
      stickZone.addEventListener('pointermove', e => {
        if (e.pointerId !== this.stick.id) return;
        e.preventDefault();
        this.updateStick(e.clientX, e.clientY, knob);
      });
      const end = e => {
        if (e.pointerId !== this.stick.id) return;
        this.stick.id = null;
        this.moveX = 0;
        this.moveZ = 0;
        this.stick.x = this.stick.y = 0;
        if (knob) knob.style.transform = 'translate(0px, 0px)';
      };
      stickZone.addEventListener('pointerup', end);
      stickZone.addEventListener('pointercancel', end);
    }

    const lookZone = document.getElementById('lookZone');
    if (lookZone) {
      lookZone.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        this.lookPointer.id = e.pointerId;
        this.lookPointer.x = e.clientX;
        this.lookPointer.y = e.clientY;
        lookZone.setPointerCapture(e.pointerId);
      });
      lookZone.addEventListener('pointermove', e => {
        if (e.pointerId !== this.lookPointer.id) return;
        e.preventDefault();
        const dx = e.clientX - this.lookPointer.x;
        const dy = e.clientY - this.lookPointer.y;
        this.lookPointer.x = e.clientX;
        this.lookPointer.y = e.clientY;
        this.applyLook(dx, dy, this.touchSensitivity);
      });
      const end = e => {
        if (e.pointerId !== this.lookPointer.id) return;
        this.lookPointer.id = null;
      };
      lookZone.addEventListener('pointerup', end);
      lookZone.addEventListener('pointercancel', end);
    }

    this.bindButton('fireBtn', {
      down: () => { this.firing = true; },
      up: () => { this.firing = false; }
    });
    this.bindButton('aimBtn', {
      down: () => { this.aiming = true; },
      up: () => { this.aiming = false; }
    });
    this.bindButton('reloadBtn', { tap: () => { this.reloadQueued = true; } });
    this.bindButton('jumpBtn', { tap: () => { this.jumpQueued = true; } });
    this.bindButton('grenadeBtn', { tap: () => { this.grenadeQueued = true; } });
    const tiltBtn = document.getElementById('tiltBtn');
    if (tiltBtn) {
      tiltBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTilt();
      });
    }
  }

  bindButton(id, handlers) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add('pressed');
      try { el.setPointerCapture(e.pointerId); } catch {}
      if (handlers.down) handlers.down();
      if (handlers.tap) handlers.tap();
    });
    const up = e => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('pressed');
      if (handlers.up) handlers.up();
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse') {
        el.classList.remove('pressed');
        if (handlers.up) handlers.up();
      }
    });
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  updateStick(x, y, knob) {
    const dx = x - this.stick.cx;
    const dy = y - this.stick.cy;
    const dist = Math.hypot(dx, dy) || 1;
    const max = this.stick.radius;
    const nx = dx / dist * Math.min(dist, max);
    const ny = dy / dist * Math.min(dist, max);
    this.stick.x = nx / max;
    this.stick.y = ny / max;
    if (knob) knob.style.transform = `translate(${nx}px, ${ny}px)`;
  }

  onCanvasDown(e) {
    if (this.isTouch && e.pointerType === 'touch') return;
    if (e.button === 2) { this.aiming = true; e.preventDefault(); return; }
    if (e.button !== 0) return;
    this.firing = true;
    this.dragging = true;
    this.lastPointer.x = e.clientX;
    this.lastPointer.y = e.clientY;
  }

  onPointerMove(e) {
    if (this.pointerLocked) {
      this.applyLook(e.movementX || 0, e.movementY || 0, this.sensitivity);
      return;
    }
    if (this.dragging && e.pointerType !== 'touch') {
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer.x = e.clientX;
      this.lastPointer.y = e.clientY;
      this.applyLook(dx, dy, this.sensitivity);
    }
  }

  onPointerUp(e) {
    if (e.pointerType === 'touch') return;
    if (e.button === 0) { this.firing = false; this.dragging = false; }
    if (e.button === 2) this.aiming = false;
  }

  applyLook(dx, dy, sens) {
    const s = sens * (this.aiming ? 0.66 : 1);
    this.yaw -= clamp(dx, -140, 140) * s;
    this.pitch -= clamp(dy, -140, 140) * s;
    this.pitch = clamp(this.pitch, -1.35, 1.25);
    this.lookDX += dx;
    this.lookDY += dy;
    if (this.tiltEnabled) {
      this.tiltRef.baseYaw = this.yaw;
      this.tiltRef.basePitch = this.pitch;
      this.tiltRef.gamma = this.tiltRef.gammaRaw;
      this.tiltRef.beta = this.tiltRef.betaRaw;
    }
  }

  onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (e.repeat) return;
    this.keys.add(k);
    if (k === 'r') this.reloadQueued = true;
    if (k === 'g') this.grenadeQueued = true;
    if (k === ' ') this.jumpQueued = true;
    if (k === 'f') this.aiming = true;
    if (k === 'escape' && this.callbacks.onPause) this.callbacks.onPause();
    if (k === 'shift') this.sprint = true;
  }

  onKeyUp(e) {
    const k = e.key.toLowerCase();
    this.keys.delete(k);
    if (k === 'f') this.aiming = false;
    if (k === 'shift') this.sprint = false;
  }

  get moving() {
    return Math.hypot(this.moveX, this.moveZ) > 0.08;
  }

  update() {
    let x = 0, z = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) z += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) z -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    x += this.stick.x;
    z += -this.stick.y;
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    this.moveX = x;
    this.moveZ = z;
  }

  consumeLook() {
    const dx = this.lookDX, dy = this.lookDY;
    this.lookDX = 0; this.lookDY = 0;
    return { dx, dy };
  }

  consumeActions() {
    const a = { jump: this.jumpQueued, reload: this.reloadQueued, grenade: this.grenadeQueued };
    this.jumpQueued = this.reloadQueued = this.grenadeQueued = false;
    return a;
  }

  requestPointerLock() {
    if (this.isTouch) return;
    const el = this.canvas;
    if (!el || document.pointerLockElement === el) return;
    try {
      const p = el.requestPointerLock?.({ unadjustedMovement: true });
      if (p && p.catch) p.catch(() => { try { el.requestPointerLock(); } catch {} });
    } catch {
      try { el.requestPointerLock(); } catch {}
    }
  }

  async toggleTilt() {
    if (this.tiltEnabled) {
      this.disableTilt();
      return false;
    }
    return this.enableTilt();
  }

  async enableTilt() {
    if (!this.tiltAvailable) {
      this.callbacks.onTilt?.('TILT NOT AVAILABLE ON THIS DEVICE', false);
      return false;
    }
    try {
      if (this.tiltNeedsPermission) {
        const res = await window.DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') {
          this.tiltDenied = true;
          this.callbacks.onTilt?.('MOTION PERMISSION DENIED — CHECK SETTINGS', false);
          return false;
        }
      }
      window.addEventListener('deviceorientation', this.boundOrientation, true);
      this.tiltEnabled = true;
      this.tiltRef.ready = false;
      this.callbacks.onTilt?.('GYRO AIM ONLINE — TILT TO STEER', true);
      setTimeout(() => this.calibrateTilt(), 260);
      return true;
    } catch (err) {
      this.callbacks.onTilt?.('MOTION PERMISSION UNAVAILABLE', false);
      return false;
    }
  }

  disableTilt() {
    window.removeEventListener('deviceorientation', this.boundOrientation, true);
    this.tiltEnabled = false;
    this.callbacks.onTilt?.('GYRO AIM OFFLINE', false);
  }

  calibrateTilt() {
    if (!this.tiltEnabled) return;
    this.tiltRef.baseYaw = this.yaw;
    this.tiltRef.basePitch = this.pitch;
    this.tiltRef.gamma = this.tiltRef.gammaRaw || 0;
    this.tiltRef.beta = this.tiltRef.betaRaw || 0;
    this.tiltRef.ready = true;
  }

  onOrientation(ev) {
    if (!this.tiltEnabled) return;
    if (ev.gamma === null || ev.beta === null) return;
    let gamma = ev.gamma;
    let beta = ev.beta;
    const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    let h = gamma, v = beta;
    if (angle === 90) { h = beta; v = -gamma; }
    else if (angle === 270) { h = -beta; v = gamma; }
    else if (angle === 180 || angle === -180) { h = -gamma; v = -beta; }
    h = clamp(h, -70, 70);
    v = clamp(v, -70, 70);
    this.tiltRef.gammaRaw = h;
    this.tiltRef.betaRaw = v;
    if (!this.tiltRef.ready) {
      this.tiltRef.gamma = h;
      this.tiltRef.beta = v;
      this.tiltRef.baseYaw = this.yaw;
      this.tiltRef.basePitch = this.pitch;
      this.tiltRef.ready = true;
      return;
    }
    const sx = 0.0058;
    const sy = 0.0046;
    this.yaw = this.tiltRef.baseYaw - (h - this.tiltRef.gamma) * sx;
    this.pitch = clamp(this.tiltRef.basePitch + (v - this.tiltRef.beta) * sy, -1.3, 1.2);
  }

  setTiltButton(on) {
    const b = document.getElementById('tiltBtn');
    if (!b) return;
    b.textContent = on ? 'TILT ON' : 'TILT OFF';
    b.classList.toggle('on', on);
  }

  reset() {
    this.yaw = 0;
    this.pitch = -0.015;
    this.moveX = this.moveZ = 0;
    this.firing = false;
    this.aiming = false;
    this.keys.clear();
    this.stick.x = this.stick.y = 0;
    this.lookDX = this.lookDY = 0;
    this.jumpQueued = this.reloadQueued = this.grenadeQueued = false;
    const knob = document.getElementById('stickKnob');
    if (knob) knob.style.transform = 'translate(0px, 0px)';
    if (this.tiltEnabled) this.calibrateTilt();
  }

  releasePointer() {
    if (document.pointerLockElement) document.exitPointerLock();
  }
}
