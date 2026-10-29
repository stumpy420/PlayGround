export class GameAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.ambientStarted = false;
    this.lastStep = 0;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 22;
    comp.ratio.value = 7;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.72 : 0;
    this.master.connect(comp);
    comp.connect(this.ctx.destination);

    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.94 + white * 0.06;
      data[i] = last * 3.2;
    }
    this.noise = buffer;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.setTargetAtTime(on ? 0.72 : 0, this.ctx.currentTime, 0.03);
  }

  startAmbient() {
    if (!this.ctx || this.ambientStarted) return;
    this.ambientStarted = true;
    const t = this.ctx.currentTime;
    const wind = this.ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    const wf = this.ctx.createBiquadFilter();
    wf.type = 'bandpass';
    wf.frequency.value = 420;
    wf.Q.value = 0.35;
    const wg = this.ctx.createGain();
    wg.gain.value = 0.028;
    wind.connect(wf); wf.connect(wg); wg.connect(this.master);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.075;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.014;
    lfo.connect(lfoGain); lfoGain.connect(wg.gain);
    lfo.start(t);
    wind.start(t);

    const sea = this.ctx.createBufferSource();
    sea.buffer = this.noise;
    sea.loop = true;
    const sf = this.ctx.createBiquadFilter();
    sf.type = 'lowpass';
    sf.frequency.value = 260;
    const sg = this.ctx.createGain();
    sg.gain.value = 0.018;
    sea.connect(sf); sf.connect(sg); sg.connect(this.master);
    const seaLfo = this.ctx.createOscillator();
    seaLfo.frequency.value = 0.11;
    const seaLfoGain = this.ctx.createGain();
    seaLfoGain.gain.value = 0.012;
    seaLfo.connect(seaLfoGain); seaLfoGain.connect(sg.gain);
    seaLfo.start(t);
    sea.start(t);

    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 43;
    const dg = this.ctx.createGain();
    dg.gain.value = 0.018;
    drone.connect(dg); dg.connect(this.master);
    drone.start(t);
    const drone2 = this.ctx.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = 64.5;
    const dg2 = this.ctx.createGain();
    dg2.gain.value = 0.006;
    drone2.connect(dg2); dg2.connect(this.master);
    drone2.start(t);
  }

  noiseBurst({ dur = 0.1, freq = 900, q = 0.8, gain = 0.3, type = 'bandpass', slideTo = null, delay = 0, attack = 0.003 }) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    f.Q.value = q;
    if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 1.2, dur + 0.02);
  }

  tone({ freq = 440, to = null, dur = 0.2, type = 'sine', gain = 0.15, delay = 0, attack = 0.005 }) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.03);
  }

  shot() {
    this.noiseBurst({ dur: 0.11, freq: 1500, slideTo: 180, q: 0.7, gain: 0.42 });
    this.noiseBurst({ dur: 0.055, freq: 3600, q: 0.5, gain: 0.16, delay: 0.006 });
    this.tone({ freq: 150, to: 42, dur: 0.14, type: 'sine', gain: 0.34 });
    this.tone({ freq: 820, to: 140, dur: 0.06, type: 'square', gain: 0.05 });
  }

  enemyShot() {
    this.noiseBurst({ dur: 0.14, freq: 700, slideTo: 120, q: 1.2, gain: 0.13 });
    this.tone({ freq: 210, to: 70, dur: 0.18, type: 'sawtooth', gain: 0.06 });
  }

  hit(head = false) {
    this.tone({ freq: head ? 1250 : 760, to: head ? 900 : 560, dur: 0.055, type: 'triangle', gain: head ? 0.15 : 0.095 });
    this.noiseBurst({ dur: 0.035, freq: 2200, q: 1.4, gain: 0.09 });
    if (head) this.tone({ freq: 1760, dur: 0.12, type: 'sine', gain: 0.065, delay: 0.02 });
  }

  kill() {
    this.tone({ freq: 330, to: 220, dur: 0.18, type: 'triangle', gain: 0.07 });
    this.tone({ freq: 660, to: 440, dur: 0.18, type: 'sine', gain: 0.045, delay: 0.03 });
  }

  hurt() {
    this.noiseBurst({ dur: 0.22, freq: 420, slideTo: 90, q: 0.8, gain: 0.25 });
    this.tone({ freq: 95, to: 48, dur: 0.3, type: 'sine', gain: 0.24 });
  }

  reload() {
    if (!this.ctx) return;
    this.noiseBurst({ dur: 0.04, freq: 2400, q: 2, gain: 0.06 });
    this.tone({ freq: 540, to: 290, dur: 0.05, type: 'square', gain: 0.025 });
    this.noiseBurst({ dur: 0.05, freq: 1700, q: 2, gain: 0.09, delay: 0.55 });
    this.tone({ freq: 300, to: 460, dur: 0.06, type: 'square', gain: 0.03, delay: 0.62 });
    this.noiseBurst({ dur: 0.05, freq: 2800, q: 2, gain: 0.08, delay: 0.98 });
    this.tone({ freq: 700, to: 380, dur: 0.07, type: 'triangle', gain: 0.05, delay: 1.0 });
  }

  empty() {
    this.tone({ freq: 900, to: 500, dur: 0.035, type: 'square', gain: 0.05 });
    this.noiseBurst({ dur: 0.025, freq: 3200, q: 2, gain: 0.04 });
  }

  explosion() {
    this.noiseBurst({ dur: 0.9, freq: 900, slideTo: 60, q: 0.6, gain: 0.52, type: 'lowpass' });
    this.tone({ freq: 92, to: 26, dur: 0.75, type: 'sine', gain: 0.45 });
    this.tone({ freq: 180, to: 40, dur: 0.4, type: 'sawtooth', gain: 0.12 });
    this.noiseBurst({ dur: 0.2, freq: 2600, q: 0.4, gain: 0.16 });
  }

  step() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastStep < 0.22) return;
    this.lastStep = now;
    this.noiseBurst({ dur: 0.07, freq: 520, q: 0.7, gain: 0.045, type: 'lowpass' });
  }

  ui() {
    this.tone({ freq: 620, to: 880, dur: 0.09, type: 'triangle', gain: 0.05 });
  }

  deploy() {
    this.tone({ freq: 110, to: 220, dur: 0.6, type: 'sawtooth', gain: 0.09 });
    this.tone({ freq: 220, to: 330, dur: 0.5, type: 'triangle', gain: 0.07, delay: 0.08 });
    this.noiseBurst({ dur: 0.5, freq: 500, slideTo: 1200, q: 0.6, gain: 0.09 });
  }

  wave() {
    this.tone({ freq: 98, dur: 0.9, type: 'sawtooth', gain: 0.07 });
    this.tone({ freq: 146.8, dur: 0.9, type: 'triangle', gain: 0.06, delay: 0.05 });
    this.tone({ freq: 196, dur: 1.1, type: 'sine', gain: 0.05, delay: 0.12 });
    this.noiseBurst({ dur: 0.35, freq: 300, slideTo: 900, q: 0.8, gain: 0.07 });
  }

  gameOver() {
    this.tone({ freq: 220, to: 110, dur: 1.0, type: 'triangle', gain: 0.11 });
    this.tone({ freq: 164, to: 82, dur: 1.3, type: 'sine', gain: 0.09, delay: 0.16 });
    this.noiseBurst({ dur: 0.8, freq: 300, slideTo: 80, q: 0.8, gain: 0.1, type: 'lowpass' });
  }

  victory() {
    [523, 659, 784].forEach((f, i) => this.tone({ freq: f, dur: 0.45, type: 'triangle', gain: 0.07, delay: i * 0.11 }));
  }
}
