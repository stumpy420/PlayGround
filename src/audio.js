export class AudioSys {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.alarm = null;
    this.ambient = null;
    this.volume = 0.55;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? this.volume : 0;
    this.master.connect(this.ctx.destination);
    this.ctx.resume?.();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.02);
    if (!on && this.alarm) this.stopAlarm();
  }

  now() { return this.ctx?.currentTime || 0; }

  tone(freq, dur = 0.12, type = "sine", vol = 0.12, slide = 0) {
    if (!this.ctx || !this.enabled) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noise(dur = 0.18, vol = 0.16, freq = 1200, q = 0.7) {
    if (!this.ctx || !this.enabled) return;
    const t = this.now();
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t);
  }

  startAlarm() {
    if (!this.ctx || this.ambient || !this.enabled) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine"; o2.type = "sine";
    o.frequency.value = 47; o2.frequency.value = 55.5;
    g.gain.value = 0.018;
    o.connect(g); o2.connect(g); g.connect(this.master);
    o.start(t); o2.start(t);
    this.ambient = { o, o2, g };
  }

  startSabotageAlarm() {
    if (!this.ctx || !this.enabled || this.alarm) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const g = this.ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = 330;
    lfo.type = "sine";
    lfo.frequency.value = 2.4;
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    g.gain.value = 0.022;
    o.connect(g); g.connect(this.master);
    o.start(t); lfo.start(t);
    this.alarm = { o, lfo, g };
  }

  stopAlarm() {
    if (!this.alarm || !this.ctx) return;
    const t = this.now();
    try {
      this.alarm.g.gain.setTargetAtTime(0.0001, t, 0.05);
      this.alarm.o.stop(t + 0.25);
      this.alarm.lfo.stop(t + 0.25);
    } catch {}
    this.alarm = null;
  }

  setSabotage(active) {
    if (active) this.startSabotageAlarm();
    else this.stopAlarm();
  }

  shot(player = false) {
    this.noise(0.13, player ? 0.2 : 0.13, player ? 2400 : 1500, 0.9);
    this.tone(85, 0.09, "square", 0.07, -45);
  }

  dry() { this.tone(180, 0.04, "square", 0.05); }
  reload() { this.tone(320, 0.05, "square", 0.05); setTimeout(() => this.tone(240, 0.06, "square", 0.045), 110); }
  hit(player = false) { this.tone(player ? 140 : 190, 0.08, "sawtooth", 0.09, -40); }
  death() { this.noise(0.3, 0.18, 500, 0.6); this.tone(110, 0.4, "sawtooth", 0.09, -70); }
  knife() { this.noise(0.12, 0.16, 3200, 1.4); this.tone(520, 0.06, "triangle", 0.06, -180); }
  vent() { this.noise(0.2, 0.1, 900, 0.7); this.tone(210, 0.14, "sine", 0.05, 90); }
  task() { this.tone(660, 0.09, "sine", 0.08); setTimeout(() => this.tone(990, 0.12, "sine", 0.08), 90); }
  fake() { this.tone(330, 0.09, "square", 0.05); setTimeout(() => this.tone(260, 0.12, "square", 0.045), 90); }
  holdStart() { this.tone(420, 0.04, "sine", 0.035); }
  holdStop() { this.tone(260, 0.04, "sine", 0.03); }
  defuseTick() { this.tone(720, 0.03, "square", 0.03); }
  defused() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.16, "triangle", 0.07), i * 80)); }
  sabotage() { this.tone(180, 0.5, "sawtooth", 0.1, -90); this.noise(0.5, 0.1, 700); }
  explode() { this.noise(1.1, 0.3, 260, 0.5); this.tone(55, 1.2, "sine", 0.18, -30); }
  meeting() { [440, 554, 659].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, "triangle", 0.06), i * 110)); }
  eject() { this.noise(0.8, 0.13, 900, 0.5); this.tone(320, 0.7, "sawtooth", 0.05, -260); }
  skip() { this.tone(240, 0.18, "triangle", 0.05, -40); }
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.28, "triangle", 0.08), i * 130)); }
  lose() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.32, "sawtooth", 0.06), i * 150)); }
}
