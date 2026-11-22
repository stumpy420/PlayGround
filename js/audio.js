// Tiny synthesized sound engine. No external audio assets required.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfx = null;
    this.music = null;
    this.noise = null;
    this.started = false;
    this.volume = 0.8;
    this.musicVolume = 0.55;
    this.ambientNodes = null;
    this.ambientTimer = null;
    this.voices = 0;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.sfx = this.ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.music = this.ctx.createGain();
    this.music.gain.value = this.musicVolume * 0.5;
    this.music.connect(this.master);
    const len = Math.floor(this.ctx.sampleRate * 1.2);
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.started = true;
  }

  setVolumes(volume, music) {
    this.volume = volume;
    this.musicVolume = music;
    if (this.master) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    if (this.music) this.music.gain.setTargetAtTime(music * 0.5, this.ctx.currentTime, 0.2);
  }

  ready() {
    if (!this.ctx) this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx.state === 'running';
  }

  panner(x = 0) {
    if (!this.ctx.createStereoPanner) return null;
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, x));
    p.connect(this.sfx);
    return p;
  }

  noiseBurst({ dur = 0.12, gain = 0.2, freq = 1200, q = 0.8, type = 'bandpass', pan = 0, rate = 1 }) {
    if (!this.ready()) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rate;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const p = pan ? this.panner(pan) : this.sfx;
    src.connect(filter).connect(g).connect(p);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  tone({ freq = 440, endFreq = null, dur = 0.1, gain = 0.1, type = 'sine', pan = 0, attack = 0.002 }) {
    if (!this.ready()) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const p = pan ? this.panner(pan) : this.sfx;
    osc.connect(g).connect(p);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  shoot(kind = 'rifle', { suppressed = false, enemy = false, pan = 0 } = {}) {
    if (!this.ready()) return;
    const vol = enemy ? 0.5 : 0.75;
    const pitch = suppressed ? 0.6 : 1;
    if (suppressed) {
      this.noiseBurst({ dur: 0.06, gain: 0.08 * vol, freq: 800, q: 1.2, pan });
      this.tone({ freq: 170, endFreq: 70, dur: 0.08, gain: 0.05 * vol, type: 'triangle', pan });
      return;
    }
    if (kind === 'shotgun') {
      this.noiseBurst({ dur: 0.24, gain: 0.32 * vol, freq: 780, q: 0.5, pan, rate: 0.75 });
      this.tone({ freq: 105, endFreq: 38, dur: 0.28, gain: 0.22 * vol, type: 'sine', pan });
      this.noiseBurst({ dur: 0.09, gain: 0.16 * vol, freq: 2600, q: 0.7, pan, rate: 1.3 });
    } else if (kind === 'dmr' || kind === 'lmg') {
      this.noiseBurst({ dur: 0.18, gain: 0.27 * vol, freq: 1100, q: 0.6, pan, rate: 0.85 });
      this.tone({ freq: 150, endFreq: 48, dur: 0.22, gain: 0.18 * vol, type: 'triangle', pan });
      this.noiseBurst({ dur: 0.05, gain: 0.1 * vol, freq: 3400, q: 0.9, pan, rate: 1.4 });
    } else if (kind === 'pistol') {
      this.noiseBurst({ dur: 0.09, gain: 0.17 * vol, freq: 1500, q: 0.9, pan, rate: 1.15 });
      this.tone({ freq: 190, endFreq: 70, dur: 0.1, gain: 0.1 * vol, type: 'square', pan });
    } else if (kind === 'smg') {
      this.noiseBurst({ dur: 0.075, gain: 0.15 * vol, freq: 1700, q: 1.1, pan, rate: 1.2 });
      this.tone({ freq: 175, endFreq: 80, dur: 0.07, gain: 0.09 * vol, type: 'square', pan });
    } else {
      this.noiseBurst({ dur: 0.11, gain: 0.22 * vol, freq: 1250, q: 0.7, pan, rate: pitch });
      this.tone({ freq: 165, endFreq: 52, dur: 0.15, gain: 0.14 * vol, type: 'triangle', pan });
      this.noiseBurst({ dur: 0.04, gain: 0.08 * vol, freq: 3200, q: 1, pan, rate: 1.4 });
    }
    this.tone({ freq: 2600, endFreq: 1800, dur: 0.025, gain: 0.018 * vol, type: 'square', pan });
  }

  explosion(pan = 0) {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.7, gain: 0.42, freq: 420, q: 0.4, pan, rate: 0.55 });
    this.noiseBurst({ dur: 0.25, gain: 0.24, freq: 1800, q: 0.5, pan, rate: 0.8 });
    this.tone({ freq: 95, endFreq: 26, dur: 0.7, gain: 0.32, type: 'sine', pan });
    this.tone({ freq: 60, endFreq: 20, dur: 0.9, gain: 0.18, type: 'triangle', pan });
  }

  ricochet(pan = 0) {
    const f = 1900 + Math.random() * 1400;
    this.tone({ freq: f, endFreq: f * 0.35, dur: 0.16, gain: 0.05, type: 'sine', pan });
    this.noiseBurst({ dur: 0.04, gain: 0.04, freq: 4200, q: 2, pan, rate: 1.5 });
  }

  impact(pan = 0) {
    this.noiseBurst({ dur: 0.045, gain: 0.06, freq: 2200, q: 1.5, pan, rate: 1.2 });
  }

  hitmarker(head = false) {
    if (!this.ready()) return;
    this.tone({ freq: head ? 1800 : 1150, endFreq: head ? 1400 : 900, dur: 0.045, gain: head ? 0.09 : 0.055, type: 'square' });
  }

  hurt() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.18, gain: 0.12, freq: 380, q: 0.7 });
    this.tone({ freq: 130, endFreq: 55, dur: 0.2, gain: 0.1, type: 'sawtooth' });
  }

  reload() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.04, gain: 0.09, freq: 2800, q: 1.2 });
    setTimeout(() => this.noiseBurst({ dur: 0.05, gain: 0.08, freq: 1800, q: 1.5 }), 180);
  }
  reloadDone() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.05, gain: 0.11, freq: 2200, q: 1.2 });
    this.tone({ freq: 640, endFreq: 420, dur: 0.06, gain: 0.04, type: 'square' });
  }
  empty() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.03, gain: 0.08, freq: 3200, q: 2 });
  }
  pickup(kind = 'ammo') {
    if (!this.ready()) return;
    const base = kind === 'intel' ? 520 : kind === 'med' ? 660 : 440;
    this.tone({ freq: base, endFreq: base * 1.5, dur: 0.09, gain: 0.055, type: 'triangle' });
    setTimeout(() => this.tone({ freq: base * 1.5, endFreq: base * 2, dur: 0.1, gain: 0.04, type: 'triangle' }), 70);
  }
  ui(active = false) {
    if (!this.ready()) return;
    this.tone({ freq: active ? 720 : 520, endFreq: active ? 860 : 500, dur: 0.04, gain: 0.035, type: 'square' });
  }
  alert() {
    if (!this.ready()) return;
    this.tone({ freq: 880, endFreq: 660, dur: 0.12, gain: 0.05, type: 'square' });
    setTimeout(() => this.tone({ freq: 660, endFreq: 520, dur: 0.1, gain: 0.04, type: 'square' }), 120);
  }
  dash() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.22, gain: 0.1, freq: 900, q: 0.5, rate: 1.5 });
    this.tone({ freq: 300, endFreq: 120, dur: 0.18, gain: 0.05, type: 'sine' });
  }
  focus(on = true) {
    if (!this.ready()) return;
    if (on) {
      this.tone({ freq: 220, endFreq: 440, dur: 0.5, gain: 0.05, type: 'sine' });
      this.tone({ freq: 330, endFreq: 660, dur: 0.5, gain: 0.025, type: 'triangle' });
    } else {
      this.tone({ freq: 440, endFreq: 180, dur: 0.35, gain: 0.04, type: 'sine' });
    }
  }
  grenade() {
    if (!this.ready()) return;
    this.noiseBurst({ dur: 0.08, gain: 0.07, freq: 1400, q: 1 });
    this.tone({ freq: 320, endFreq: 180, dur: 0.09, gain: 0.04, type: 'triangle' });
  }
  success() {
    if (!this.ready()) return;
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => setTimeout(() => this.tone({ freq: f, endFreq: f * 1.005, dur: 0.5, gain: 0.07, type: 'triangle' }), i * 130));
    setTimeout(() => this.tone({ freq: 1046.5, endFreq: 1046.5, dur: 1.1, gain: 0.05, type: 'sine' }), 560);
  }
  fail() {
    if (!this.ready()) return;
    this.tone({ freq: 220, endFreq: 110, dur: 1.2, gain: 0.09, type: 'sawtooth' });
    this.tone({ freq: 110, endFreq: 55, dur: 1.4, gain: 0.07, type: 'sine' });
  }

  startAmbient() {
    if (!this.ready() || this.ambientNodes) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.gain.linearRampToValueAtTime(0.14, now + 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.8;
    gain.connect(filter).connect(this.music);
    const oscs = [];
    const freqs = [55, 82.41, 110, 164.81];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.34 : 0.12 / (i + 1);
      osc.connect(g).connect(gain);
      osc.start(now);
      oscs.push(osc);
    });
    // Slow filter LFO for a breathing, oppressive ambience.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start(now);
    // Distant industrial pulse.
    const pulse = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (Math.random() < 0.7) {
        this.tone({ freq: 52, endFreq: 30, dur: 1.6, gain: 0.05, type: 'sine' });
        this.noiseBurst({ dur: 1.2, gain: 0.012, freq: 300, q: 0.5, rate: 0.4 });
      }
    }, 5200);
    this.ambientNodes = { gain, oscs, lfo, pulse };
    this.ambientTimer = pulse;
  }

  setMusicIntensity(intensity) {
    if (!this.ambientNodes) return;
    const target = 0.1 + intensity * 0.08;
    this.ambientNodes.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 1.2);
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    const { gain, oscs, lfo, pulse } = this.ambientNodes;
    clearInterval(pulse);
    try {
      gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      setTimeout(() => {
        oscs.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
        try { lfo.stop(); } catch { /* already stopped */ }
      }, 1400);
    } catch {
      /* ignore */
    }
    this.ambientNodes = null;
  }
}
