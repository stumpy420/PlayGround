/* ------------------------------------------------------------------ */
/* Gamepad input                                                       */
/*                                                                     */
/* Polls the Gamepad API with the W3C "standard" mapping and exposes   */
/* a stable input snapshot for the game loop. Buttons are edge-detected */
/* so a press is never repeated while the button is held.              */
/* ------------------------------------------------------------------ */

const DEADZONE = 0.17;
const LOOK_DEADZONE = 0.14;
const TRIGGER = 0.3;

const BUTTON = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  VIEW: 8,
  MENU: 9,
  L3: 10,
  R3: 11,
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
};

function deadzone(value, zone = DEADZONE) {
  const a = Math.abs(value);
  if (a <= zone) return 0;
  return Math.sign(value) * Math.min(1, (a - zone) / (1 - zone));
}

function response(value, exponent = 1.35) {
  return Math.sign(value) * Math.pow(Math.abs(value), exponent);
}

function friendlyName(id = '') {
  const upper = id.toUpperCase();
  if (upper.includes('XBOX') || upper.includes('XINPUT')) return 'XBOX PAD';
  if (upper.includes('DUALSENSE')) return 'DUALSENSE';
  if (upper.includes('DUALSHOCK') || upper.includes('PLAYSTATION')) return 'DUALSHOCK';
  if (upper.includes('SWITCH') || upper.includes('JOY-CON')) return 'SWITCH PAD';
  const clean = id.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
  const first = clean.split(/\s+/).slice(0, 2).join(' ');
  return (first || 'CONTROLLER').toUpperCase().slice(0, 22);
}

export class Gamepad {
  constructor() {
    this.connected = false;
    this.id = '';
    this.label = 'CONTROLLER';
    this.index = -1;
    this.mapping = '';
    this._pad = null;
    this._prev = [];
    this._pressed = [];
    this._time = 0;

    this.moveX = 0;
    this.moveY = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.fire = false;
    this.aim = false;
    this.interact = false;
    this.sprint = false;
    this.jump = false;
    this.reload = false;
    this.nextWeapon = false;
    this.prevWeapon = false;
    this.pause = false;
    this.help = false;
    this.start = false;
    this.back = false;
    this.active = false;
    this.lastInputAt = 0;

    this.onConnect = null;
    this.onDisconnect = null;

    // Sticks below the deadzone still count as a connected-but-idle pad.
    this._onConnectEvent = (e) => this._connect(e.gamepad);
    this._onDisconnectEvent = (e) => {
      if (!this._pad || e.gamepad.index === this._pad.index) this._disconnect();
    };
    window.addEventListener('gamepadconnected', this._onConnectEvent);
    window.addEventListener('gamepaddisconnected', this._onDisconnectEvent);
  }

  _value(pad, index) {
    const button = pad.buttons[index];
    if (button) return button.pressed ? Math.max(button.value || 0, 0.55) : (button.value || 0);
    // Some non-standard pads expose triggers on the last two axes.
    if (index === BUTTON.LT) return Math.max(0, pad.axes[4] || 0);
    if (index === BUTTON.RT) return Math.max(0, pad.axes[5] || 0);
    return 0;
  }

  _held(pad, index) {
    return this._value(pad, index) > 0.5;
  }

  _connect(pad) {
    if (!pad) return;
    const changed = !this.connected || this.index !== pad.index || this.id !== (pad.id || '');
    this.connected = true;
    this._pad = pad;
    this.index = pad.index;
    this.id = pad.id || '';
    this.label = friendlyName(this.id);
    this.mapping = pad.mapping || '';
    if (changed) {
      this._prev = new Array(pad.buttons.length).fill(false);
      this._pressed = new Array(pad.buttons.length).fill(false);
      if (this.onConnect) this.onConnect(this);
    }
  }

  _disconnect() {
    if (!this.connected) return;
    this.connected = false;
    this._pad = null;
    this.index = -1;
    this.mapping = '';
    this._reset();
    if (this.onDisconnect) this.onDisconnect(this);
  }

  _reset() {
    this.moveX = 0;
    this.moveY = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.fire = false;
    this.aim = false;
    this.interact = false;
    this.sprint = false;
    this.jump = false;
    this.reload = false;
    this.nextWeapon = false;
    this.prevWeapon = false;
    this.pause = false;
    this.help = false;
    this.start = false;
    this.back = false;
    this.active = false;
  }

  poll(dt = 0) {
    this._time += dt;
    let pads = [];
    try {
      pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    } catch {
      pads = [];
    }
    let pad = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        pad = pads[i];
        break;
      }
    }

    if (!pad) {
      this._disconnect();
      return this;
    }

    if (!this.connected || this.index !== pad.index) this._connect(pad);

    const buttons = pad.buttons || [];
    const pressed = new Array(buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      pressed[i] = b ? (b.pressed || (b.value || 0) > 0.5) : false;
    }
    const edge = (i) => !!pressed[i] && !this._prev[i];
    const value = (i) => this._value(pad, i);
    const held = (i) => !!pressed[i];

    const lx = response(deadzone(pad.axes[0] || 0));
    const ly = response(deadzone(pad.axes[1] || 0));
    const rx = response(deadzone(pad.axes[2] || 0, LOOK_DEADZONE), 1.55);
    const ry = response(deadzone(pad.axes[3] || 0, LOOK_DEADZONE), 1.55);

    this.moveX = lx;
    this.moveY = ly;
    this.lookX = rx;
    this.lookY = ry;

    const fireValue = value(BUTTON.RT);
    const aimValue = value(BUTTON.LT);
    this.fire = fireValue > TRIGGER;
    this.aim = aimValue > TRIGGER;
    this.interact = held(BUTTON.X);
    this.jump = edge(BUTTON.A);
    this.reload = edge(BUTTON.B);
    this.nextWeapon = edge(BUTTON.Y) || edge(BUTTON.RB) || edge(BUTTON.RIGHT);
    this.prevWeapon = edge(BUTTON.LB) || edge(BUTTON.LEFT);
    this.pause = edge(BUTTON.MENU);
    this.help = edge(BUTTON.VIEW);
    this.start = edge(BUTTON.MENU) || edge(BUTTON.A);
    this.back = edge(BUTTON.B);
    this.sprint = held(BUTTON.L3) || Math.hypot(lx, ly) > 0.9;

    const stickActive = Math.hypot(lx, ly) > 0.02 || Math.hypot(rx, ry) > 0.02;
    const triggerActive = fireValue > 0.08 || aimValue > 0.08;
    const buttonActive = pressed.some(Boolean);
    this.active = stickActive || triggerActive || buttonActive;
    if (this.active) this.lastInputAt = performance.now();

    this._prev = pressed;
    return this;
  }

  /** Stop a just-consumed action so it cannot fire again on the next frame. */
  consume(action) {
    if (action in this) this[action] = false;
  }

  /** Optional dual-rumble. Silently ignored on pads without haptics. */
  rumble(duration = 60, strong = 0.22, weak = 0.12) {
    const pad = this._pad;
    if (!pad) return;
    const actuator = pad.vibrationActuator;
    if (!actuator || typeof actuator.playEffect !== 'function') return;
    try {
      const result = actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        strongMagnitude: Math.min(1, strong),
        weakMagnitude: Math.min(1, weak),
      });
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch { /* controller without rumble */ }
  }
}
