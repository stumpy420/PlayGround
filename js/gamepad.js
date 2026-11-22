// ============ GAMEPAD INPUT ============
// Standard-mapping controller support: analog movement + look, full combat
// bindings, menu / pause navigation, and optional haptic feedback.
import { audio } from './audio.js';

const SENS_BASE = 0.0021;

// Standard Gamepad API button indices (Xbox layout / DualShock equivalent).
const BTN = {
  A: 0, B: 1, X: 2, Y: 3,
  LB: 4, RB: 5, LT: 6, RT: 7,
  BACK: 8, START: 9,
  LS: 10, RS: 11,
  UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15
};

const MOVE_DEADZONE = 0.16;
const LOOK_DEADZONE = 0.13;
const NAV_THRESHOLD = 0.55;
const NAV_DELAY = 0.38;
const NAV_REPEAT = 0.12;

const FOCUS_SELECTOR = 'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

const radialDead = (x, y, zone) => {
  const mag = Math.hypot(x, y);
  if (mag < zone) return [0, 0];
  const scaled = (mag - zone) / (1 - zone);
  const k = Math.min(1, scaled) / mag;
  return [x * k, y * k];
};

const curve = v => Math.sign(v) * Math.pow(Math.abs(v), 1.65);

export class GamepadInput {
  constructor(game) {
    this.game = game;
    this.index = null;
    this.connected = false;
    this.active = false;
    this.prev = [];
    this.focusEl = null;
    this.lastScreen = null;
    this.navDir = null;
    this.navNext = 0;
    this.lastRumble = 0;

    window.addEventListener('gamepadconnected', e => this.onConnect(e.gamepad));
    window.addEventListener('gamepaddisconnected', e => {
      if (this.index === null || e.gamepad.index === this.index) this.onDisconnect();
    });

    // Hand control back to mouse / keyboard as soon as either is used.
    const handBack = () => this.setActive(false);
    window.addEventListener('pointerdown', handBack, { passive: true });
    window.addEventListener('keydown', handBack);

    // A controller may already be paired before the page loads.
    const existing = this.pollPads();
    if (existing[0]) this.onConnect(existing[0]);
    this.updateStatus();
  }

  // ---------- lifecycle ----------
  pollPads() {
    if (!navigator.getGamepads) return [];
    const pads = [];
    for (const pad of navigator.getGamepads()) {
      if (pad && pad.connected) pads.push(pad);
    }
    return pads;
  }

  onConnect(pad) {
    if (!pad) return;
    this.index = pad.index;
    this.connected = true;
    document.body.classList.add('gamepad');
    this.updateStatus(pad.id);
    if (!this._announced) {
      this._announced = true;
      this.setActive(true);
      this.focusInitial();
      this.game.ui?.toast('CONTROLLER LINKED — RT FIRE · LT AIM · START PAUSE', 'ok');
      audio.resume();
    }
  }

  onDisconnect() {
    this.index = null;
    this.connected = false;
    this.prev = [];
    this.setActive(false);
    this.clearFocus();
    this.resetChannels();
    document.body.classList.remove('gamepad');
    this.updateStatus();
    this.game.ui?.toast('CONTROLLER DISCONNECTED', 'warn');
    this._announced = false;
    if (this.game.inMatch && this.game.matchState === 'live' && !this.game.paused) this.game.pause();
  }

  resetChannels() {
    const inp = this.game.input;
    inp.moveX = 0;
    inp.moveZ = 0;
    inp.padSprint = false;
    inp.padCrouch = false;
    inp.padJump = false;
    inp.padFire = false;
    inp.padAds = false;
    inp.padReload = false;
    inp.padSwap = false;
    inp.padGrenade = false;
    inp.padMelee = false;
  }

  updateStatus(id) {
    const el = document.getElementById('pad-status');
    if (!el) return;
    if (this.connected) {
      const label = (id || 'STANDARD PAD').replace(/\s*\(.*?\)\s*/g, ' ').trim();
      el.textContent = `LINKED · ${label.toUpperCase()}`;
      el.classList.add('on');
    } else {
      el.textContent = 'NO CONTROLLER DETECTED — CONNECT PAD AND PRESS A BUTTON';
      el.classList.remove('on');
    }
  }

  setActive(on) {
    if (on === this.active) return;
    this.active = on;
    document.body.classList.toggle('pad-active', on);
    if (on) {
      audio.resume();
      this.game.inputMode = 'pad';
    } else {
      this.game.inputMode = this.game.touchEnabled ? 'touch' : 'mk';
      this.resetChannels();
      this.clearFocus();
    }
  }

  // ---------- per-frame poll ----------
  update(dt) {
    const pads = this.pollPads();
    let pad = this.index !== null ? pads.find(p => p.index === this.index) : null;
    if (!pad) {
      pad = pads[0] || null;
      if (!pad) {
        if (this.connected) this.onDisconnect();
        return;
      }
      this.onConnect(pad);
    }

    const b = pad.buttons || [];
    const axes = pad.axes || [];
    const pressed = i => !!(b[i] && (b[i].pressed || b[i].value > 0.45));
    const value = i => (b[i] ? Math.max(b[i].value || 0, b[i].pressed ? 1 : 0) : 0);
    const down = i => pressed(i) && !this.prev[i];

    const [lx, ly] = radialDead(axes[0] || 0, axes[1] || 0, MOVE_DEADZONE);
    const [rx, ry] = radialDead(axes[2] || 0, axes[3] || 0, LOOK_DEADZONE);
    const stickMoving = Math.abs(lx) + Math.abs(ly) + Math.abs(rx) + Math.abs(ry) > 0.05;
    const anyPressed = b.some((btn, i) => btn && (btn.pressed || btn.value > 0.45) && i !== 8);
    if ((stickMoving || anyPressed) && !this.active) this.setActive(true);

    const g = this.game;
    const booting = !document.getElementById('boot')?.classList.contains('hidden');
    const live = !booting && g.inMatch && g.matchState === 'live' && !g.paused && !g.ui.modalOpen;

    // START always controls pause / resume.
    if (!booting && down(BTN.START)) {
      if (g.paused) g.resume();
      else if (g.inMatch && g.matchState !== 'over') g.pause();
    }

    if (live) this.updateGameplay(dt, pad, { lx, ly, rx, ry, pressed, value, down });
    else if (!booting) this.updateNavigation(dt, pad, { lx, ly, pressed, down });

    if (!live) {
      g.input.moveX = 0;
      g.input.moveZ = 0;
      g.input.padFire = false;
      g.input.padAds = false;
      g.input.padSprint = false;
    }

    this.prev = b.map(btn => !!(btn && (btn.pressed || btn.value > 0.45)));
    this.updateFocusRing();
  }

  updateGameplay(dt, pad, s) {
    const g = this.game;
    const inp = g.input;
    const p = g.player;

    // analog movement + sprint
    inp.moveX = -s.ly;
    inp.moveZ = s.lx;
    inp.padSprint = Math.hypot(s.lx, s.ly) > 0.9 || s.pressed(BTN.LS);
    inp.padFire = s.pressed(BTN.RT) || s.value(BTN.RT) > 0.4;
    inp.padAds = s.pressed(BTN.LT) || s.value(BTN.LT) > 0.35;

    if (s.down(BTN.A)) inp.padJump = true;
    if (s.down(BTN.B) || s.down(BTN.DOWN)) inp.padCrouch = !inp.padCrouch;
    if (s.down(BTN.X) || s.down(BTN.UP)) inp.padReload = true;
    if (s.down(BTN.Y) || s.down(BTN.LEFT) || s.down(BTN.RIGHT)) inp.padSwap = true;
    if (s.down(BTN.LB)) inp.padMelee = true;
    if (s.down(BTN.RB)) inp.padGrenade = true;

    // right stick look with response curve, ADS slowdown and Y inversion
    if (Math.abs(s.rx) > 0.001 || Math.abs(s.ry) > 0.001) {
      const userSens = (g.settings.sens ?? 50) / 50;
      const padSens = (g.settings.padSens ?? 55) / 55;
      const speed = 920 * userSens * padSens;
      const dx = curve(s.rx) * speed * dt;
      const dy = curve(s.ry) * speed * dt;
      const invert = g.settings.invert ? -1 : 1;
      p.look(dx, dy * invert, SENS_BASE);
      g.mouseVelX = dx * 0.65;
    }
  }

  updateNavigation(dt, pad, s) {
    if (this.lastScreen !== this.screenId()) {
      this.lastScreen = this.screenId();
      this.focusInitial();
    }
    if (!this.focusEl || !this.focusEl.getClientRects().length) this.focusInitial();

    const now = performance.now() / 1000;
    let dir = null;
    if (s.pressed(BTN.UP) || s.ly < -NAV_THRESHOLD) dir = 'up';
    else if (s.pressed(BTN.DOWN) || s.ly > NAV_THRESHOLD) dir = 'down';
    else if (s.pressed(BTN.LEFT) || s.lx < -NAV_THRESHOLD) dir = 'left';
    else if (s.pressed(BTN.RIGHT) || s.lx > NAV_THRESHOLD) dir = 'right';

    if (dir) {
      const fresh = dir !== this.navDir;
      if (fresh || now >= this.navNext) {
        this.navDir = dir;
        this.navNext = now + (fresh ? NAV_DELAY : NAV_REPEAT);
        this.stepFocus(dir);
      }
      this.setActive(true);
    } else {
      this.navDir = null;
    }

    if (s.down(BTN.A)) this.activate();
    if (s.down(BTN.B) || s.down(BTN.BACK)) this.back();
  }

  // ---------- menu focus ----------
  screenId() {
    const screens = Array.from(document.querySelectorAll('#menu, .screen'))
      .filter(el => el.getClientRects().length);
    screens.sort((a, b) => (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0));
    return screens[0]?.id || 'none';
  }

  activeScreen() {
    return document.getElementById(this.screenId());
  }

  focusables() {
    const screen = this.activeScreen();
    if (!screen) return [];
    return Array.from(screen.querySelectorAll(FOCUS_SELECTOR)).filter(el => {
      if (el.disabled) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      return el.getClientRects().length > 0;
    });
  }

  focusInitial() {
    const screen = this.activeScreen();
    if (!screen) return;
    const preferred = screen.querySelector('#btn-deploy, #btn-resume, #btn-requeue, [data-autofocus], .btn-primary');
    const list = this.focusables();
    const target = (preferred && list.includes(preferred)) ? preferred : list[0];
    if (target) this.setFocus(target, false);
  }

  setFocus(el, scroll = true) {
    if (el && !el.getClientRects().length) return;
    if (this.focusEl === el) return;
    this.clearFocus();
    this.focusEl = el || null;
    if (!el) return;
    el.classList.add('gp-focus');
    if (scroll) {
      try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch {}
    }
  }

  clearFocus() {
    if (this.focusEl) this.focusEl.classList.remove('gp-focus');
    this.focusEl = null;
  }

  updateFocusRing() {
    if (!this.active) return;
    if (this.focusEl && !this.focusEl.isConnected) this.focusInitial();
  }

  stepFocus(dir) {
    const list = this.focusables();
    if (!list.length) return;
    if (!this.focusEl || !list.includes(this.focusEl)) {
      this.focusInitial();
      return;
    }

    // Left / right trims range sliders instead of moving focus.
    if ((dir === 'left' || dir === 'right') && this.focusEl.tagName === 'INPUT' && this.focusEl.type === 'range') {
      const step = +(this.focusEl.step || 1) * (dir === 'right' ? 1 : -1);
      this.focusEl.value = String(Math.max(+this.focusEl.min, Math.min(+this.focusEl.max, +this.focusEl.value + step)));
      this.focusEl.dispatchEvent(new Event('input', { bubbles: true }));
      audio.ui();
      return;
    }

    const from = this.focusEl.getBoundingClientRect();
    const cx = from.left + from.width / 2;
    const cy = from.top + from.height / 2;
    let best = null;
    let bestScore = Infinity;

    for (const el of list) {
      if (el === this.focusEl) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;

      let along = 0;
      let across = 0;
      if (dir === 'up') { along = -dy; across = Math.abs(dx); }
      else if (dir === 'down') { along = dy; across = Math.abs(dx); }
      else if (dir === 'left') { along = -dx; across = Math.abs(dy); }
      else { along = dx; across = Math.abs(dy); }

      if (along < 6) continue;
      // Penalise drift off the current row / column so navigation feels tidy.
      const score = along + across * 2.1;
      if (score < bestScore) { bestScore = score; best = el; }
    }

    if (best) {
      this.setFocus(best);
      audio.ui();
    }
  }

  activate() {
    const el = this.focusEl;
    if (!el) { this.focusInitial(); return; }
    audio.ui();
    if (el.tagName === 'INPUT') {
      if (el.type === 'checkbox') {
        el.checked = !el.checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      if (el.type === 'range') return;
    }
    el.click();
    this.lastScreen = null;
    requestAnimationFrame(() => this.focusInitial());
  }

  back() {
    const g = this.game;
    const shown = id => {
      const el = document.getElementById(id);
      return !!el && !el.classList.contains('hidden');
    };
    if (shown('checkout')) return document.getElementById('btn-checkout-close')?.click();
    if (shown('settings')) return document.getElementById('btn-settings-close')?.click();
    if (g.paused) return g.resume();
    if (shown('summary')) return document.getElementById('btn-sum-hq')?.click();
    if (!g.inMatch) {
      const screen = this.activeScreen();
      const backBtn = screen?.querySelector('[data-back], .back-btn, .modal-close');
      if (backBtn) return backBtn.click();
      if (screen && screen.id !== 'menu') g.ui.showMenu();
    }
  }

  // ---------- haptics ----------
  rumble(duration = 60, strong = 0.35, weak = 0.15) {
    if (!this.active) return;
    const pad = this.pollPads().find(p => p.index === this.index);
    const actuator = pad?.vibrationActuator;
    if (!actuator?.playEffect) return;
    const now = performance.now();
    if (now - this.lastRumble < 45) return;
    this.lastRumble = now;
    try {
      const res = actuator.playEffect('dual-rumble', {
        startDelay: 0, duration, weakMagnitude: weak, strongMagnitude: strong
      });
      if (res?.catch) res.catch(() => {});
    } catch {}
  }
}
