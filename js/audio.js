// Tiny procedural audio kit — no external assets.
export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuf = null;
    this.windGain = null;
    this.windFilter = null;
    this.muted = false;
    this.storm = false;
    this.ready = false;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch {
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);

    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    // ambient wind bed
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 420;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.05;
    src.connect(this.windFilter).connect(this.windGain).connect(this.master);
    src.start();
    this.ready = true;
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.05);
  }

  setStorm(active) {
    this.storm = active;
    if (!this.ctx) return;
    this.windGain.gain.setTargetAtTime(active ? 0.16 : 0.05, this.ctx.currentTime, 1.2);
    this.windFilter.frequency.setTargetAtTime(active ? 900 : 420, this.ctx.currentTime, 1.2);
  }

  get t() {
    return this.ctx.currentTime;
  }

  tone(freq, dur, type = 'sine', vol = 0.08, slideTo = null, delay = 0) {
    if (!this.ready) return;
    const t = this.t + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, freq), t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise(dur, cutoff = 1800, vol = 0.2, type = 'lowpass', delay = 0) {
    if (!this.ready) return;
    const t = this.t + delay;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(cutoff, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  shot(kind = 'rifle') {
    if (kind === 'shotgun') {
      this.noise(0.22, 1800, 0.46);
      this.tone(78, 0.26, 'sine', 0.42, 34);
      this.tone(620, 0.08, 'square', 0.07, 140);
      this.noise(0.12, 900, 0.14, 'lowpass', 0.26);
      return;
    }
    if (kind === 'smg') {
      this.noise(0.07, 4200, 0.22);
      this.tone(210, 0.09, 'sine', 0.2, 62);
      this.tone(1450, 0.035, 'square', 0.035, 420);
      return;
    }
    this.noise(0.11, 3200, 0.3);
    this.tone(160, 0.14, 'sine', 0.3, 42);
    this.tone(1100, 0.05, 'square', 0.045, 300);
  }

  enemyShot(dist = 20) {
    const vol = Math.max(0.02, 0.14 - dist * 0.003);
    this.tone(760, 0.09, 'square', vol, 240);
    this.noise(0.06, 1400, vol * 0.6);
  }

  dryFire() {
    this.noise(0.03, 2400, 0.12, 'highpass');
  }

  reload() {
    this.noise(0.04, 1800, 0.15, 'highpass');
    this.noise(0.05, 1200, 0.14, 'highpass', 0.55);
    this.tone(320, 0.05, 'square', 0.05, 180, 1.55);
  }

  hit(kill = false) {
    if (kill) {
      this.tone(220, 0.28, 'sine', 0.2, 55);
      this.noise(0.22, 900, 0.2);
    } else {
      this.tone(1250, 0.04, 'square', 0.07, 900);
    }
  }

  pickup() {
    this.tone(760, 0.07, 'triangle', 0.07, 980);
    this.tone(1180, 0.09, 'triangle', 0.05, 1500, 0.05);
  }

  core() {
    this.tone(620, 0.12, 'sine', 0.08, 900);
    this.tone(980, 0.14, 'sine', 0.07, 1400, 0.09);
    this.tone(1560, 0.2, 'triangle', 0.05, 1900, 0.18);
  }

  heal() {
    this.tone(520, 0.12, 'sine', 0.07, 780);
    this.tone(780, 0.18, 'sine', 0.05, 1040, 0.1);
  }

  step() {
    this.noise(0.05, 520, 0.045);
  }

  jump() {
    this.noise(0.1, 700, 0.06);
  }

  land() {
    this.tone(90, 0.12, 'sine', 0.12, 45);
    this.noise(0.08, 400, 0.1);
  }

  alert() {
    this.tone(1500, 0.06, 'square', 0.05);
    this.tone(1050, 0.08, 'square', 0.05, 900, 0.09);
  }

  damage() {
    this.tone(120, 0.18, 'sawtooth', 0.12, 50);
    this.noise(0.14, 700, 0.12);
  }

  extractionCall() {
    this.tone(420, 0.14, 'sine', 0.08, 560);
    this.tone(620, 0.14, 'sine', 0.07, 780, 0.16);
    this.tone(880, 0.3, 'triangle', 0.06, 1100, 0.32);
  }

  extractionTick(urgent = false) {
    this.tone(urgent ? 1320 : 880, 0.05, 'square', urgent ? 0.07 : 0.04);
  }

  success() {
    const notes = [392, 494, 587, 784];
    notes.forEach((n, i) => this.tone(n, 0.5, 'sine', 0.08, n * 1.002, i * 0.11));
    this.noise(0.6, 2200, 0.05, 'highpass', 0.1);
  }

  death() {
    this.tone(320, 0.9, 'sawtooth', 0.14, 40);
    this.noise(0.8, 500, 0.2);
  }

  click() {
    this.tone(700, 0.04, 'square', 0.04);
  }
}
