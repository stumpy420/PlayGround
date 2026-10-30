export class GameAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.noise = null;
    this.lastStep = 0;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.42;
    this.master.connect(this.ctx.destination);
    const len = Math.floor(this.ctx.sampleRate * 1.2);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.42, this.ctx.currentTime, 0.03);
  }

  now() { return this.ctx ? this.ctx.currentTime : 0; }

  env(gain, t, a, d, peak = 1) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  tone(freq, dur, type = 'sine', vol = 0.2, slide = 0, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.now() + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    this.env(g, t, 0.005, dur, vol);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  noiseBurst(dur, vol, filterFreq, type = 'lowpass', delay = 0, q = 1) {
    if (!this.ctx || this.muted) return;
    const t = this.now() + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = filterFreq; f.Q.value = q;
    const g = this.ctx.createGain();
    this.env(g, t, 0.004, dur, vol);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  shoot() {
    this.noiseBurst(0.12, 0.42, 2200, 'lowpass');
    this.tone(120, 0.09, 'sawtooth', 0.16, -70);
    this.tone(900, 0.03, 'square', 0.05, -500);
  }
  dryFire() { this.tone(1800, 0.025, 'square', 0.06, -900); }
  reload() {
    this.tone(700, 0.03, 'square', 0.05, -300);
    this.tone(420, 0.04, 'square', 0.05, 200, 0.18);
    this.noiseBurst(0.04, 0.12, 3400, 'highpass', 0.3);
  }
  knife() {
    this.noiseBurst(0.16, 0.3, 5000, 'highpass');
    this.tone(300, 0.12, 'sawtooth', 0.14, -180);
  }
  hit() {
    this.noiseBurst(0.08, 0.22, 900, 'lowpass');
    this.tone(80, 0.1, 'sine', 0.2, -30);
  }
  kill() {
    this.tone(55, 0.5, 'sawtooth', 0.2, -30);
    this.noiseBurst(0.3, 0.3, 600, 'lowpass');
  }
  step() {
    const t = performance.now();
    if (t - this.lastStep < 260) return;
    this.lastStep = t;
    this.noiseBurst(0.05, 0.05, 500, 'lowpass');
  }
  beep(freq = 880, dur = 0.06, vol = 0.1) { this.tone(freq, dur, 'square', vol); }
  bombBeep(urgent = false) {
    this.tone(urgent ? 1500 : 1100, 0.05, 'square', urgent ? 0.14 : 0.09);
  }
  plantTick() { this.tone(620, 0.04, 'square', 0.08); }
  defuseTick() { this.tone(1250, 0.035, 'square', 0.07); }
  task() {
    this.tone(660, 0.08, 'sine', 0.14);
    this.tone(990, 0.12, 'sine', 0.12, 0, 0.09);
    this.tone(1320, 0.18, 'sine', 0.1, 0, 0.18);
  }
  fail() {
    this.tone(220, 0.16, 'sawtooth', 0.12, -60);
    this.tone(160, 0.22, 'sawtooth', 0.1, -40, 0.08);
  }
  meeting() {
    this.tone(520, 0.3, 'square', 0.09);
    this.tone(390, 0.4, 'square', 0.09, 0, 0.35);
    this.tone(520, 0.3, 'square', 0.08, 0, 0.8);
    this.tone(780, 0.6, 'square', 0.08, 0, 1.15);
  }
  vote() { this.tone(880, 0.06, 'square', 0.1); }
  eject() {
    this.noiseBurst(0.8, 0.14, 1200, 'bandpass', 0, 2);
    this.tone(220, 0.8, 'sawtooth', 0.1, -120);
  }
  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.5, 'triangle', 0.13, 0, i * 0.12));
  }
  lose() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.6, 'sawtooth', 0.1, -20, i * 0.15));
  }
  sabotage() {
    this.tone(90, 0.6, 'sawtooth', 0.15, -40);
    this.noiseBurst(0.5, 0.2, 300, 'lowpass');
  }
  alarm() {
    this.tone(880, 0.18, 'square', 0.12);
    this.tone(660, 0.18, 'square', 0.12, 0, 0.2);
  }
  click() { this.tone(620, 0.03, 'square', 0.04); }
  heartbeat(intensity = 1) {
    this.tone(58, 0.12, 'sine', 0.1 * intensity);
    this.tone(50, 0.1, 'sine', 0.07 * intensity, 0, 0.16);
  }
  ui() { this.tone(520, 0.04, 'sine', 0.06); }
}
