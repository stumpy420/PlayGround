const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Input {
  constructor(opts = {}) {
    this.onAction = opts.onAction || (() => {});
    this.onRelease = opts.onRelease || (() => {});
    this.onReload = opts.onReload || (() => {});
    this.onSabotage = opts.onSabotage || (() => {});
    this.onTilt = opts.onTilt || (() => {});
    this.onMute = opts.onMute || (() => {});
    this.onState = opts.onState || (() => {});
    this.move = { x: 0, y: 0, active: false };
    this.aim = { x: 1, y: 0, active: false, angle: 0 };
    this.keys = new Set();
    this.firing = false;
    this.mouse = { x: 0, y: 0, active: false, down: false };
    this.actionHeld = false;
    this.tiltEnabled = false;
    this.tiltAngle = -Math.PI / 2;
    this.tiltRaw = { x: 0, y: 0 };
    this.tiltCal = null;
    this.tiltCalibrating = false;
    this.tiltStatus = "off";
    this.orientationHandler = null;
    this.coarse = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    this.stickPointers = new Map();
  }

  attach() {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    this.setupStick("stickLeft", this.move, "move");
    this.setupStick("stickRight", this.aim, "aim");
    this.setupAction();
    this.setupButtons();
    this.setupKeyboard();
    this.setupMouse();
    this.onState({ tilt: this.tiltStatus });
  }

  setupStick(id, state, kind) {
    const el = document.getElementById(id);
    if (!el) return;
    const knob = el.querySelector(".knob");
    const limit = 42;
    let origin = { x: 0, y: 0 };
    let pointerId = null;

    const update = (e) => {
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      const m = Math.hypot(dx, dy);
      const k = m > limit ? limit / m : 1;
      const kx = clamp(dx * k, -limit, limit);
      const ky = clamp(dy * k, -limit, limit);
      state.x = kx / limit;
      state.y = ky / limit;
      state.active = true;
      if (knob) knob.style.transform = `translate(${kx}px, ${ky}px)`;
      if (kind === "aim") {
        if (Math.hypot(state.x, state.y) > 0.24) state.angle = Math.atan2(state.y, state.x);
        el.classList.add("engaged");
      }
    };

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      const r = el.getBoundingClientRect();
      origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      el.setPointerCapture?.(e.pointerId);
      this.stickPointers.set(kind, pointerId);
      update(e);
    });
    el.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      update(e);
    });
    const end = (e) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      state.active = false;
      state.x = 0;
      state.y = 0;
      if (knob) knob.style.transform = "translate(0px, 0px)";
      el.classList.remove("engaged");
      this.stickPointers.delete(kind);
      if (kind === "aim") this.firing = false;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
  }

  setupAction() {
    const btn = document.getElementById("actionBtn");
    if (!btn) return;
    let pointerId = null;
    const down = (e) => {
      e.preventDefault();
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      btn.setPointerCapture?.(e.pointerId);
      btn.classList.add("pressed");
      this.actionHeld = true;
      this.onAction();
    };
    const up = (e) => {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      pointerId = null;
      btn.classList.remove("pressed");
      if (this.actionHeld) {
        this.actionHeld = false;
        this.onRelease();
      }
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("lostpointercapture", up);
  }

  setupButtons() {
    const reload = document.getElementById("reloadBtn");
    reload?.addEventListener("pointerdown", (e) => { e.preventDefault(); this.onReload(); });
    const sab = document.getElementById("sabotageBtn");
    sab?.addEventListener("pointerdown", (e) => { e.preventDefault(); this.onSabotage(); });
    const tilt = document.getElementById("tiltBtn");
    tilt?.addEventListener("click", (e) => { e.preventDefault(); this.onTilt(); });
    const mute = document.getElementById("muteBtn");
    mute?.addEventListener("click", (e) => { e.preventDefault(); this.onMute(); });
  }

  setupMouse() {
    const canvas = document.getElementById("world");
    if (!canvas) return;
    canvas.addEventListener("pointermove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      this.mouse.down = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      e.preventDefault();
    });
    window.addEventListener("pointerup", (e) => {
      if (e.pointerType === "touch") return;
      this.mouse.down = false;
    });
    canvas.addEventListener("pointerleave", () => { this.mouse.down = false; });
  }

  setupKeyboard() {
    window.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        this.keys.add(k);
        e.preventDefault();
      }
      if (k === "e" && !e.repeat) { this.actionHeld = true; this.onAction(); }
      if (k === "r" && !e.repeat) this.onReload();
      if (k === "q" && !e.repeat) this.onSabotage();
      if (k === "m" && !e.repeat) this.onMute();
      if (k === "t" && !e.repeat) this.onTilt();
    });
    window.addEventListener("keyup", (e) => {
      const k = e.key.toLowerCase();
      this.keys.delete(k);
      if (k === "e" && this.actionHeld) {
        this.actionHeld = false;
        this.onRelease();
      }
    });
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.mouse.down = false;
      if (this.actionHeld) { this.actionHeld = false; this.onRelease(); }
    });
  }

  keyboardVector() {
    const k = this.keys;
    let x = 0, y = 0;
    if (k.has("a") || k.has("arrowleft")) x -= 1;
    if (k.has("d") || k.has("arrowright")) x += 1;
    if (k.has("w") || k.has("arrowup")) y -= 1;
    if (k.has("s") || k.has("arrowdown")) y += 1;
    return { x, y };
  }

  async toggleTilt() {
    if (this.tiltEnabled) {
      this.tiltCalibrating = true;
      this.tiltStatus = "calibrating";
      this.onState({ tilt: this.tiltStatus });
      setTimeout(() => {
        this.tiltStatus = "on";
        this.onState({ tilt: this.tiltStatus });
      }, 500);
      return this.tiltStatus;
    }
    if (typeof window.DeviceOrientationEvent === "undefined") {
      this.tiltStatus = "unsupported";
      this.onState({ tilt: this.tiltStatus });
      return this.tiltStatus;
    }
    try {
      if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
        const res = await window.DeviceOrientationEvent.requestPermission();
        if (res !== "granted") {
          this.tiltStatus = "denied";
          this.onState({ tilt: this.tiltStatus });
          return this.tiltStatus;
        }
      }
      this.orientationHandler = (e) => this.onOrientation(e);
      window.addEventListener("deviceorientation", this.orientationHandler, true);
      this.tiltCalibrating = true;
      this.tiltEnabled = true;
      this.tiltStatus = "calibrating";
      this.onState({ tilt: this.tiltStatus });
      setTimeout(() => {
        if (this.tiltStatus === "calibrating") {
          this.tiltStatus = "on";
          this.onState({ tilt: this.tiltStatus });
        }
      }, 900);
      return this.tiltStatus;
    } catch (err) {
      this.tiltStatus = "denied";
      this.onState({ tilt: this.tiltStatus });
      return this.tiltStatus;
    }
  }

  onOrientation(e) {
    if (e.gamma == null && e.beta == null) {
      this.tiltStatus = "unsupported";
      this.onState({ tilt: this.tiltStatus });
      return;
    }
    let x = e.gamma || 0;
    let y = (e.beta || 0) - 42;
    const angle = ((screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI) / 180;
    const rx = x * Math.cos(angle) - y * Math.sin(angle);
    const ry = x * Math.sin(angle) + y * Math.cos(angle);
    if (this.tiltCalibrating || !this.tiltCal) {
      this.tiltCal = { x: rx, y: ry };
      this.tiltCalibrating = false;
      return;
    }
    const dx = rx - this.tiltCal.x;
    const dy = ry - this.tiltCal.y;
    this.tiltRaw = { x: dx, y: dy };
    const mag = Math.hypot(dx, dy);
    if (mag > 4.5) {
      const target = Math.atan2(dy, dx);
      let d = target - this.tiltAngle;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.tiltAngle += d * 0.35;
    }
  }

  isFiring() {
    if (this.tiltEnabled) return this.aim.active || this.mouse.down;
    return this.aim.active && Math.hypot(this.aim.x, this.aim.y) > 0.24 || this.mouse.down;
  }
}
