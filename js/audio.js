// ============ PROCEDURAL AUDIO (WebAudio, no external assets) ============
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.volume = 0.65;
    this.muted = false;
    this.started = false;
    this.ambient = null;
    this.noiseBuf = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);

    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  }

  resume() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.started = true;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = this.muted ? 0 : v;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : this.volume;
    return this.muted;
  }

  now() { return this.ctx ? this.ctx.currentTime : 0; }

  noise(dur = 0.1, filterFreq = 1200, type = 'lowpass', gain = 0.3, q = 0.8, delay = 0) {
    if (!this.ctx || this.muted) return null;
    const t = this.now() + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = filterFreq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
    return { src, f, g, t };
  }

  tone(freq = 440, dur = 0.1, type = 'sine', gain = 0.2, delay = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t = this.now() + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  shot(weapon) {
    if (!this.ctx) return;
    if (weapon === 'sniper') {
      this.noise(0.34, 1400, 'lowpass', 0.55);
      this.tone(70, 0.28, 'sine', 0.5, 0, 34);
      this.noise(0.09, 4200, 'highpass', 0.22);
    } else if (weapon === 'shotgun') {
      this.noise(0.3, 900, 'lowpass', 0.55);
      this.tone(58, 0.24, 'sine', 0.5, 0, 30);
    } else if (weapon === 'smg') {
      this.noise(0.075, 2000, 'bandpass', 0.3, 1.4);
      this.tone(110, 0.06, 'square', 0.12, 0, 60);
    } else if (weapon === 'pistol') {
      this.noise(0.09, 1800, 'bandpass', 0.3, 1.2);
      this.tone(120, 0.07, 'triangle', 0.15, 0, 60);
    } else {
      this.noise(0.13, 1700, 'lowpass', 0.4);
      this.tone(90, 0.1, 'triangle', 0.25, 0, 45);
      this.noise(0.05, 5000, 'highpass', 0.1);
    }
  }

  hit(head = false) {
    this.tone(head ? 1650 : 1150, 0.045, 'square', 0.09);
    if (head) this.tone(2200, 0.05, 'sine', 0.06, 0.03);
  }

  kill() {
    this.tone(880, 0.07, 'triangle', 0.1);
    this.tone(1320, 0.09, 'triangle', 0.08, 0.05);
  }

  explosion() {
    this.noise(0.8, 420, 'lowpass', 0.65);
    this.tone(46, 0.7, 'sine', 0.55, 0, 22);
    this.noise(0.16, 3000, 'highpass', 0.15);
  }

  reload() {
    this.noise(0.03, 3800, 'bandpass', 0.12, 2);
    this.tone(320, 0.03, 'square', 0.04, 0.25);
    this.tone(260, 0.04, 'square', 0.05, 0.62);
    this.noise(0.03, 2600, 'bandpass', 0.1, 2, 0.9);
  }

  footstep(running = false) {
    this.noise(0.055, running ? 500 : 380, 'lowpass', running ? 0.09 : 0.05);
  }

  hurt() {
    this.tone(160, 0.12, 'sawtooth', 0.08, 0, 90);
    this.noise(0.1, 700, 'lowpass', 0.12);
  }

  ui() {
    this.tone(720, 0.035, 'square', 0.035);
    this.tone(980, 0.03, 'square', 0.025, 0.02);
  }

  error() {
    this.tone(220, 0.12, 'square', 0.06);
    this.tone(160, 0.16, 'square', 0.06, 0.08);
  }

  capture() {
    this.tone(520, 0.14, 'triangle', 0.1);
    this.tone(660, 0.16, 'triangle', 0.09, 0.1);
    this.tone(880, 0.24, 'triangle', 0.09, 0.22);
  }

  spawn() {
    this.tone(300, 0.2, 'sine', 0.09, 0, 620);
  }

  victory() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.6, 'triangle', 0.09, i * 0.13));
    this.tone(130, 0.9, 'sine', 0.12, 0);
  }

  defeat() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.55, 'triangle', 0.08, i * 0.16));
  }

  startAmbient() {
    if (!this.ctx || this.ambient) return;
    const t = this.now();
    const g = this.ctx.createGain();
    g.gain.value = 0; g.gain.linearRampToValueAtTime(0.045, t + 2);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 240;
    const o1 = this.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 48;
    const o2 = this.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 55.5;
    const wind = this.ctx.createBufferSource();
    wind.buffer = this.noiseBuf; wind.loop = true;
    const wf = this.ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 420; wf.Q.value = 0.4;
    const wg = this.ctx.createGain(); wg.gain.value = 0.12;
    o1.connect(f); o2.connect(f); wind.connect(wf); wf.connect(wg); wg.connect(f);
    f.connect(g); g.connect(this.master);
    o1.start(t); o2.start(t); wind.start(t);
    this.ambient = { g, o1, o2, wind };
  }
}

export const audio = new AudioEngine();
