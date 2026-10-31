export class Soundscape {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambient = null;
    this.pad = null;
    this.muted = false;
    this.started = false;
    this.footstepTimer = 0;
  }

  async init() {
    if (this.started) {
      if (this.ctx?.state === "suspended") await this.ctx.resume();
      return;
    }
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.62;
    this.master.connect(this.ctx.destination);
    this.started = true;
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        // A later user gesture will retry.
      }
    }
    this.createAmbient();
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  createAmbient() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;

    // Wind: a slowly filtered noise bed.
    const length = Math.floor(ctx.sampleRate * 3.2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.94 + white * 0.06;
      data[i] = last * 2.4;
    }
    const wind = ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 420;
    lowpass.Q.value = 0.3;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 90;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.085;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.055;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.035;
    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain);
    wind.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(this.master);
    wind.start();
    lfo.start();

    // A hollow, northern drone.
    const padGain = ctx.createGain();
    padGain.gain.value = 0.0001;
    padGain.connect(this.master);
    padGain.gain.setTargetAtTime(0.055, ctx.currentTime, 3.5);
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 520;
    padFilter.Q.value = 0.6;
    padFilter.connect(padGain);
    const notes = [55, 82.5, 110, 164.81];
    const pads = [];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = index < 2 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = (index - 1.5) * 4;
      const gain = ctx.createGain();
      gain.gain.value = index === 3 ? 0.06 : 0.15 / (index + 1);
      osc.connect(gain);
      gain.connect(padFilter);
      osc.start();
      const breathe = ctx.createOscillator();
      breathe.type = "sine";
      breathe.frequency.value = 0.025 + index * 0.007;
      const breatheGain = ctx.createGain();
      breatheGain.gain.value = gain.gain.value * 0.7;
      breathe.connect(breatheGain);
      breatheGain.connect(gain.gain);
      breathe.start();
      pads.push({ osc, gain, breathe });
    });

    // Distant, sparse chime.
    const chimeInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== "running" || this.muted || document.hidden) return;
      if (Math.random() < 0.52) this.chime();
    }, 11500);

    this.ambient = { wind, lowpass, highpass, windGain, lfo, padGain, padFilter, pads, chimeInterval };
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.62, this.now, 0.08);
  }

  setPaused(paused) {
    if (!this.ctx || !this.master || this.muted) return;
    this.master.gain.setTargetAtTime(paused ? 0.24 : 0.62, this.now, 0.25);
  }

  tone({ frequency = 440, endFrequency = null, type = "sine", duration = 0.2, volume = 0.2, delay = 0, attack = 0.01, release = null, filter = null }) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + (release ?? 0));
    if (filter) {
      const node = ctx.createBiquadFilter();
      node.type = filter.type;
      node.frequency.value = filter.frequency;
      node.Q.value = filter.Q ?? 1;
      osc.connect(node);
      node.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + (release ?? 0) + 0.05);
  }

  noise({ duration = 0.2, volume = 0.2, frequency = 1200, type = "bandpass", Q = 0.8, delay = 0, sweep = null }) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(ctx.sampleRate * (duration + 0.05)));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, start);
    if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(20, sweep), start + duration);
    filter.Q.value = Q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(start);
    source.stop(start + duration + 0.04);
  }

  ui() {
    this.tone({ frequency: 720, endFrequency: 840, type: "sine", duration: 0.09, volume: 0.06 });
  }

  meow() {
    if (!this.ctx) return;
    this.tone({ frequency: 520, endFrequency: 760, type: "sawtooth", duration: 0.16, volume: 0.026, filter: { type: "bandpass", frequency: 1100, Q: 2.2 } });
    this.tone({ frequency: 760, endFrequency: 480, type: "triangle", duration: 0.27, volume: 0.035, delay: 0.13, filter: { type: "lowpass", frequency: 1300 } });
  }

  footstep(snow = true) {
    if (!this.ctx) return;
    this.noise({ duration: 0.075, volume: 0.032, frequency: snow ? 680 : 340, type: "lowpass", Q: 0.5, sweep: snow ? 450 : 220 });
  }

  sword() {
    this.noise({ duration: 0.22, volume: 0.16, frequency: 1800, type: "bandpass", Q: 1.2, sweep: 380 });
    this.tone({ frequency: 310, endFrequency: 140, type: "triangle", duration: 0.12, volume: 0.035 });
  }

  hit() {
    this.noise({ duration: 0.13, volume: 0.11, frequency: 380, type: "lowpass", Q: 0.7, sweep: 150 });
    this.tone({ frequency: 92, endFrequency: 48, type: "sine", duration: 0.2, volume: 0.13 });
  }

  spell() {
    this.tone({ frequency: 280, endFrequency: 1080, type: "sine", duration: 0.3, volume: 0.1, attack: 0.02 });
    this.tone({ frequency: 560, endFrequency: 1720, type: "triangle", duration: 0.24, volume: 0.035, delay: 0.04 });
    this.noise({ duration: 0.35, volume: 0.025, frequency: 3200, type: "highpass", Q: 0.8, sweep: 900 });
  }

  explode() {
    this.noise({ duration: 0.5, volume: 0.19, frequency: 420, type: "lowpass", Q: 0.5, sweep: 80 });
    this.tone({ frequency: 110, endFrequency: 34, type: "sine", duration: 0.5, volume: 0.16 });
  }

  heal() {
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      this.tone({ frequency, type: "sine", duration: 0.52, volume: 0.055, delay: index * 0.08, release: 0.2 });
    });
  }

  quest() {
    [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
      this.tone({ frequency, type: "triangle", duration: 0.75, volume: 0.06, delay: index * 0.13, release: 0.35 });
    });
  }

  chime() {
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51];
    const note = notes[Math.floor(Math.random() * notes.length)];
    this.tone({ frequency: note, type: "sine", duration: 2.2, volume: 0.022, attack: 0.1, release: 0.8 });
    this.tone({ frequency: note * 1.5, type: "sine", duration: 1.8, volume: 0.008, attack: 0.15, release: 0.8 });
  }

  roar() {
    this.tone({ frequency: 72, endFrequency: 38, type: "sawtooth", duration: 1.3, volume: 0.13, attack: 0.08, filter: { type: "lowpass", frequency: 220, Q: 1.6 } });
    this.noise({ duration: 1.15, volume: 0.13, frequency: 260, type: "lowpass", Q: 1.1, sweep: 70 });
    this.tone({ frequency: 144, endFrequency: 64, type: "triangle", duration: 0.9, volume: 0.055, delay: 0.1 });
  }

  death() {
    [220, 164.81, 110, 73.42].forEach((frequency, index) => {
      this.tone({ frequency, type: "sine", duration: 1.5, volume: 0.07, delay: index * 0.22, release: 0.7 });
    });
  }

  victory() {
    const melody = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
    melody.forEach((frequency, index) => {
      this.tone({ frequency, type: "triangle", duration: 1.8, volume: 0.07, delay: index * 0.2, release: 0.7 });
      this.tone({ frequency: frequency * 2, type: "sine", duration: 1.4, volume: 0.018, delay: index * 0.2, release: 0.5 });
    });
    this.chime();
    setTimeout(() => this.chime(), 900);
  }

  setBattle(active) {
    if (this._battle === active) return;
    this._battle = active;
    if (!this.ctx) return;
    if (active) {
      this.tone({ frequency: 58, endFrequency: 52, type: "sine", duration: 1.4, volume: 0.08, attack: 0.3 });
    }
  }
}
