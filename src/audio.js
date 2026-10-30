// Fully synthesized tactical audio: no external assets, mobile friendly.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.wind = null;
    this.drone = null;
    this.tension = null;
    this.lastStep = 0;
  }

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.62;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 16;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.22;
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
    this.noise = this.makeNoise(2.4);
    this.startAmbient();
  }

  resume() {
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.62, this.ctx.currentTime, 0.05);
  }

  makeNoise(seconds = 1) {
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.ceil(rate * seconds), rate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.24 + white * 0.76;
      data[i] = last;
    }
    return buffer;
  }

  startAmbient() {
    const ctx = this.ctx;
    // desert wind
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 340;
    lp.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.055;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(lp).connect(gain).connect(this.master);
    src.start();
    lfo.start();
    this.wind = { src, gain, lfo };
    // low tactical drone
    const dg = ctx.createGain();
    dg.gain.value = 0.022;
    dg.connect(this.master);
    const oscs = [41.2, 55, 82.4].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = i * 4 - 3;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.28 : 0.6;
      o.connect(g).connect(dg);
      o.start();
      return o;
    });
    const dlfo = ctx.createOscillator();
    dlfo.frequency.value = 0.037;
    const dlg = ctx.createGain();
    dlg.gain.value = 0.009;
    dlfo.connect(dlg).connect(dg.gain);
    dlfo.start();
    this.drone = { oscs, gain: dg, lfo: dlfo };
  }

  setTension(amount) {
    if (!this.ctx) return;
    amount = Math.max(0, Math.min(1, amount));
    if (!this.tension && amount > 0.02) {
      const ctx = this.ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(this.master);
      const o1 = ctx.createOscillator();
      o1.type = 'sawtooth';
      o1.frequency.value = 46;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 160;
      o1.connect(lp).connect(gain);
      o1.start();
      const o2 = ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.value = 92;
      const g2 = ctx.createGain();
      g2.gain.value = 0.16;
      o2.connect(g2).connect(gain);
      o2.start();
      this.tension = { gain, o1, o2 };
    }
    if (this.tension) this.tension.gain.gain.setTargetAtTime(amount * 0.05, this.ctx.currentTime, 0.4);
  }

  tone({ freq = 220, end = freq, dur = 0.12, type = 'sine', vol = 0.12, when = 0, attack = 0.005, release = null }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (end !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (release ?? dur));
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  burst({ dur = 0.15, vol = 0.2, freq = 1200, type = 'lowpass', when = 0, q = 0.8, pan = 0 }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.28), t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.0002, vol), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(f).connect(g).connect(p).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  shot() {
    if (!this.ctx) return;
    this.burst({ dur: 0.24, vol: 0.5, freq: 3600, type: 'lowpass', q: 0.5 });
    this.burst({ dur: 0.06, vol: 0.32, freq: 7000, type: 'highpass' });
    this.tone({ freq: 150, end: 42, dur: 0.22, type: 'sine', vol: 0.5 });
    this.tone({ freq: 860, end: 120, dur: 0.09, type: 'square', vol: 0.06 });
  }
  dryFire() { this.tone({ freq: 900, end: 520, dur: 0.04, type: 'square', vol: 0.05 }); }
  reload() {
    this.tone({ freq: 260, end: 190, dur: 0.05, type: 'square', vol: 0.05 });
    this.tone({ freq: 340, end: 260, dur: 0.06, type: 'square', vol: 0.055, when: 0.42 });
    this.tone({ freq: 210, end: 300, dur: 0.05, type: 'square', vol: 0.05, when: 0.86 });
    this.tone({ freq: 520, end: 420, dur: 0.03, type: 'square', vol: 0.04, when: 1.02 });
  }
  step(variant = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastStep < 0.16) return;
    this.lastStep = now;
    this.burst({ dur: 0.08, vol: 0.045, freq: 460 + variant * 40, q: 1.3 });
  }
  land() { this.burst({ dur: 0.12, vol: 0.06, freq: 300, q: 1 }); }
  taskStep() { this.tone({ freq: 660, dur: 0.06, type: 'sine', vol: 0.06 }); }
  taskDone() {
    this.tone({ freq: 523, dur: 0.12, type: 'triangle', vol: 0.09 });
    this.tone({ freq: 784, dur: 0.16, type: 'triangle', vol: 0.09, when: 0.1 });
    this.tone({ freq: 1046, dur: 0.22, type: 'sine', vol: 0.08, when: 0.22 });
  }
  taskFail() { this.tone({ freq: 180, end: 90, dur: 0.16, type: 'sawtooth', vol: 0.06 }); }
  kill() {
    this.burst({ dur: 0.22, vol: 0.24, freq: 500, q: 0.7 });
    this.tone({ freq: 90, end: 30, dur: 0.4, type: 'sine', vol: 0.28 });
    this.tone({ freq: 240, end: 70, dur: 0.3, type: 'triangle', vol: 0.08 });
  }
  reveal() {
    this.tone({ freq: 1400, end: 700, dur: 0.18, type: 'sawtooth', vol: 0.05 });
    this.tone({ freq: 2100, end: 1000, dur: 0.22, type: 'square', vol: 0.035 });
  }
  sabotage() {
    this.tone({ freq: 480, end: 180, dur: 0.5, type: 'sawtooth', vol: 0.08 });
    this.tone({ freq: 160, end: 90, dur: 0.8, type: 'square', vol: 0.06, when: 0.2 });
    this.burst({ dur: 0.5, vol: 0.08, freq: 1200, q: 0.6 });
  }
  fixed() {
    this.tone({ freq: 330, dur: 0.08, type: 'square', vol: 0.05 });
    this.tone({ freq: 523, dur: 0.12, type: 'triangle', vol: 0.07, when: 0.1 });
  }
  meeting() {
    for (let i = 0; i < 4; i++) {
      this.tone({ freq: 600 + (i % 2) * 260, end: 500 + (i % 2) * 200, dur: 0.18, type: 'square', vol: 0.05, when: i * 0.2 });
    }
    this.burst({ dur: 0.9, vol: 0.05, freq: 1200, q: 0.7 });
  }
  vote() { this.tone({ freq: 700, end: 900, dur: 0.06, type: 'sine', vol: 0.06 }); }
  eject(good) {
    this.tone({ freq: good ? 440 : 300, end: good ? 880 : 140, dur: 0.7, type: 'triangle', vol: 0.09 });
    this.burst({ dur: 0.5, vol: 0.07, freq: 800, q: 0.6, when: 0.15 });
  }
  win() {
    [392, 523, 659, 784].forEach((f, i) => this.tone({ freq: f, dur: 0.5, type: 'triangle', vol: 0.07, when: i * 0.12 }));
    this.tone({ freq: 98, dur: 1.4, type: 'sine', vol: 0.08 });
  }
  lose() {
    [220, 196, 164, 110].forEach((f, i) => this.tone({ freq: f, dur: 0.6, type: 'sawtooth', vol: 0.045, when: i * 0.18 }));
    this.tone({ freq: 60, dur: 1.6, type: 'sine', vol: 0.1 });
  }
  heartbeat(intensity = 1) {
    this.tone({ freq: 62, end: 42, dur: 0.18, type: 'sine', vol: 0.07 * intensity });
    this.tone({ freq: 55, end: 38, dur: 0.2, type: 'sine', vol: 0.05 * intensity, when: 0.18 });
  }
  distantShot() {
    const pan = Math.random() * 1.6 - 0.8;
    this.burst({ dur: 0.5, vol: 0.025 + Math.random() * 0.02, freq: 900, q: 0.8, pan, when: Math.random() * 0.1 });
    this.tone({ freq: 70, end: 40, dur: 0.3, type: 'sine', vol: 0.02, when: Math.random() * 0.1 });
  }
  voiceBlip(pitch = 0) {
    this.tone({ freq: 220 + pitch * 30 + Math.random() * 60, dur: 0.035, type: 'square', vol: 0.025 });
  }
  warn() { this.tone({ freq: 880, end: 640, dur: 0.22, type: 'square', vol: 0.06 }); }
}
