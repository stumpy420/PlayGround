export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.enabled = true;
    this.noiseBuffer = null;
    this.drone = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.48;
    this.master.connect(this.ctx.destination);
    this.noiseBuffer = this.makeNoise();
    this.startAmbience();
  }

  makeNoise() {
    const length = this.ctx.sampleRate * 1.4;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.84 + white * 0.16;
      data[i] = last;
    }
    return buffer;
  }

  startAmbience() {
    if (!this.ctx || this.drone) return;
    const now = this.ctx.currentTime;
    const bus = this.ctx.createGain();
    bus.gain.value = 0.026;
    bus.connect(this.master);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.connect(bus);

    const oscA = this.ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscA.frequency.value = 46;
    const oscB = this.ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 69.2;
    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.52;
    oscA.connect(oscGain);
    oscB.connect(oscGain);
    oscGain.connect(filter);
    oscA.start(now);
    oscB.start(now);

    const wind = this.ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 560;
    windFilter.Q.value = 0.45;
    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.065;
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.master);
    wind.start(now);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.042;
    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain);
    lfo.start(now);

    this.drone = { bus, oscA, oscB, wind };
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.48, this.ctx.currentTime, 0.04);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.setMuted(!enabled);
  }

  tone(freq, duration, type = 'sine', volume = 0.12, slide = 0, delay = 0) {
    if (!this.ctx || !this.enabled || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  }

  noise(duration = 0.12, volume = 0.2, cutoff = 1500, q = 0.7, delay = 0) {
    if (!this.ctx || !this.enabled || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cutoff, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(120, cutoff * 0.35), t0 + duration);
    filter.Q.value = q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  shoot() {
    this.noise(0.11, 0.25, 2100, 0.7);
    this.tone(118, 0.09, 'square', 0.12, -70);
    this.tone(62, 0.16, 'sine', 0.16, -24);
  }

  hit(head = false) {
    this.tone(head ? 1760 : 1040, 0.055, 'triangle', 0.11);
    if (head) {
      this.tone(2340, 0.09, 'sine', 0.09, 420, 0.025);
      this.tone(1320, 0.12, 'triangle', 0.06, 280, 0.045);
    }
  }

  enemyDie() {
    this.noise(0.32, 0.2, 700, 0.5);
    this.tone(240, 0.28, 'sawtooth', 0.08, -160);
    this.tone(92, 0.35, 'square', 0.06, -40, 0.02);
  }

  damage() {
    this.noise(0.2, 0.3, 330, 0.6);
    this.tone(74, 0.3, 'sawtooth', 0.2, -32);
    this.tone(190, 0.18, 'square', 0.08, -90);
  }

  reload(stage = 'start') {
    if (stage === 'start') {
      this.noise(0.045, 0.13, 2600, 1.8);
      this.tone(420, 0.04, 'square', 0.06);
    } else if (stage === 'mag') {
      this.noise(0.06, 0.12, 900, 1.2);
      this.tone(150, 0.06, 'square', 0.07, -30);
    } else {
      this.noise(0.055, 0.16, 1800, 1.5);
      this.tone(720, 0.04, 'square', 0.06);
      this.tone(310, 0.06, 'triangle', 0.06, 60);
    }
  }

  empty() {
    this.tone(1200, 0.025, 'square', 0.06);
    this.tone(700, 0.035, 'square', 0.04, -200, 0.035);
  }

  jump() {
    this.tone(260, 0.1, 'sine', 0.05, 100);
  }

  wave() {
    this.tone(196, 0.6, 'sawtooth', 0.05, -12);
    this.tone(293.7, 0.7, 'triangle', 0.05, 10, 0.04);
    this.tone(392, 0.9, 'sine', 0.045, 20, 0.09);
    this.noise(0.7, 0.035, 420, 0.4);
  }

  waveClear() {
    this.tone(392, 0.22, 'triangle', 0.09);
    this.tone(523.25, 0.24, 'triangle', 0.09, 0, 0.12);
    this.tone(659.25, 0.4, 'triangle', 0.1, 0, 0.25);
  }

  gameOver() {
    this.tone(220, 0.7, 'sawtooth', 0.08, -80);
    this.tone(110, 1.1, 'sine', 0.1, -35, 0.15);
    this.noise(1.1, 0.06, 280, 0.4);
  }

  ui() {
    this.tone(850, 0.035, 'triangle', 0.05);
    this.tone(1250, 0.04, 'sine', 0.035, 100, 0.025);
  }

  spawn() {
    this.tone(160, 0.12, 'square', 0.04, 80);
    this.tone(640, 0.16, 'triangle', 0.035, 120, 0.03);
  }
}
