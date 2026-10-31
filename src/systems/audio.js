// ---------------------------------------------------------------------------
// Procedural audio. No files, no royalties, no bard licensing fees.
// ---------------------------------------------------------------------------
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.ambientBus = null;
    this.ready = false;
    this.musicVol = 0.5;
    this.sfxVol = 0.8;
    this.enabled = true;
    this.night = 0;
    this.ambientT = 3;
    this.birdT = 4;
    this.musicT = 6;
    this.chordIndex = 0;
    this.creakT = 20;
    this._unlockHandler = () => this.unlock();
    window.addEventListener('pointerdown', this._unlockHandler, { once: true });
    window.addEventListener('keydown', this._unlockHandler, { once: true });
  }

  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVol;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVol * 0.5;
      this.musicBus.connect(this.master);
      this.ambientBus = this.ctx.createGain();
      this.ambientBus.gain.value = 0.5;
      this.ambientBus.connect(this.master);
      this.ready = true;
      this.startWind();
      this.startMusic();
    } catch (e) {
      console.warn('Audio unavailable', e);
    }
  }

  setMusicVolume(v) { this.musicVol = v; if (this.musicBus) this.musicBus.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.1); }
  setSfxVolume(v) { this.sfxVol = v; if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1); }
  setNight(n) { this.night = n; }

  // -- primitives -----------------------------------------------------------
  now() { return this.ctx ? this.ctx.currentTime : 0; }

  tone(freq, dur, type = 'sine', gain = 0.12, slideTo = null, delay = 0, bus = null) {
    if (!this.ready) return;
    const t = this.now() + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + Math.min(0.02, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(bus || this.sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  noise(dur = 0.2, gain = 0.15, filterFreq = 1200, type = 'bandpass', delay = 0, q = 1) {
    if (!this.ready) return;
    const t = this.now() + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type; filter.frequency.value = filterFreq; filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter); filter.connect(g); g.connect(this.sfxBus);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // -- ambience -------------------------------------------------------------
  startWind() {
    if (!this.ctx) return;
    const len = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + (Math.random() * 2 - 1) * 0.03) * 0.996;
      data[i] = last * 3;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 520; filter.Q.value = 0.4;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.16;
    src.connect(filter); filter.connect(gain); gain.connect(this.ambientBus);
    src.start();
    this.windGain = gain;
    this.windFilter = filter;
    // high whistle layer
    const src2 = this.ctx.createBufferSource();
    src2.buffer = buffer; src2.loop = true;
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass'; f2.frequency.value = 1500; f2.Q.value = 3;
    const g2 = this.ctx.createGain(); g2.gain.value = 0.02;
    src2.connect(f2); f2.connect(g2); g2.connect(this.ambientBus);
    src2.start();
    this.whistle = g2;
  }

  startMusic() {
    this.pad = [];
    const roots = [110, 130.81, 146.83, 98];
    for (const f of roots) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.value = 0.0;
      const lfo = this.ctx.createOscillator();
      const lfoG = this.ctx.createGain();
      lfo.frequency.value = 0.05 + Math.random() * 0.05;
      lfoG.gain.value = 1.2;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      osc.connect(g); g.connect(this.musicBus);
      osc.start(); lfo.start();
      this.pad.push({ osc, g });
    }
    this.padGain = 0.035;
  }

  update(dt, game) {
    if (!this.ready) return;
    const t = this.now();
    // wind swells
    if (this.windGain) this.windGain.gain.setTargetAtTime(0.1 + Math.sin(t * 0.11) * 0.05 + (this.night > 0.5 ? 0.05 : 0), t, 0.6);
    if (this.whistle) this.whistle.gain.setTargetAtTime(0.012 + Math.sin(t * 0.23) * 0.01, t, 0.8);
    // pad breathing
    for (let i = 0; i < this.pad.length; i++) {
      const p = this.pad[i];
      const g = this.padGain * (0.5 + Math.sin(t * 0.07 + i * 1.7) * 0.5) * (this.gamePaused ? 0.25 : 1);
      p.g.gain.setTargetAtTime(g, t, 0.8);
    }
    if (this.gamePaused) return;
    // birds by day
    this.birdT -= dt;
    if (this.birdT <= 0) {
      this.birdT = 2.5 + Math.random() * 7;
      if (this.night < 0.45) this.chirp();
    }
    // distant creaks / snow
    this.creakT -= dt;
    if (this.creakT <= 0) {
      this.creakT = 14 + Math.random() * 26;
      if (this.night > 0.5) this.tone(60 + Math.random() * 40, 1.8, 'sine', 0.03, 45);
      else this.noise(1.4, 0.02, 700, 'lowpass');
    }
    // sparse melodic bells
    this.musicT -= dt;
    if (this.musicT <= 0) {
      this.musicT = 4 + Math.random() * 6;
      this.bell();
    }
  }

  chirp() {
    if (!this.ready) return;
    const base = 1600 + Math.random() * 1400;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      this.tone(base + Math.random() * 400, 0.07, 'sine', 0.018, base - 300, i * 0.09, this.ambientBus);
    }
  }

  bell() {
    if (!this.ready) return;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
    const f = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.3 ? 2 : 1);
    this.tone(f, 3.2, 'sine', 0.028, f * 0.995, 0, this.musicBus);
    this.tone(f * 2.01, 2.2, 'sine', 0.012, f * 2, 0, this.musicBus);
    this.tone(f * 3.02, 1.4, 'sine', 0.006, f * 3, 0, this.musicBus);
  }

  // -- one-shots ------------------------------------------------------------
  playStep(water = false, surface = 'snow') {
    if (water) { this.noise(0.22, 0.07, 900, 'lowpass'); return; }
    if (surface === 'wood') this.noise(0.09, 0.05, 420, 'bandpass', 0, 2);
    else this.noise(0.11, 0.035, 900 + Math.random() * 500, 'highpass');
  }
  playSword() { this.noise(0.16, 0.11, 2600, 'bandpass', 0, 2); this.tone(420, 0.1, 'triangle', 0.03, 260); }
  playEnemySwing() { this.noise(0.2, 0.09, 900, 'bandpass', 0, 1.5); }
  playHit(crit = false) { this.noise(0.12, crit ? 0.2 : 0.13, crit ? 800 : 600, 'lowpass'); this.tone(crit ? 160 : 120, 0.12, 'square', 0.05, 60); }
  playBlock() { this.noise(0.18, 0.16, 3200, 'bandpass', 0, 4); this.tone(700, 0.2, 'triangle', 0.04, 500); }
  playHurt() { this.tone(180, 0.22, 'sawtooth', 0.05, 90); this.noise(0.14, 0.06, 500); }
  playDeath() { this.tone(140, 1.2, 'sine', 0.1, 55); this.tone(95, 1.6, 'triangle', 0.06, 40, 0.15); }
  playJump() { this.tone(320, 0.12, 'sine', 0.035, 480); }
  playLand() { this.noise(0.1, 0.05, 300, 'lowpass'); }
  playDoor() { this.noise(0.35, 0.07, 260, 'lowpass'); this.tone(90, 0.4, 'triangle', 0.04, 60); }
  playPickup() { this.tone(720, 0.12, 'sine', 0.05, 960); this.tone(1080, 0.1, 'sine', 0.03, 1200, 0.06); }
  playLoot() { this.tone(520, 0.16, 'triangle', 0.04, 700); }
  playEquip() { this.noise(0.1, 0.05, 1800, 'bandpass'); this.tone(300, 0.12, 'triangle', 0.04, 420); }
  playDrink() { this.tone(300, 0.18, 'sine', 0.05, 500); this.tone(600, 0.14, 'sine', 0.03, 700, 0.1); }
  playBow() { this.noise(0.1, 0.07, 2200, 'bandpass', 0, 3); this.tone(600, 0.2, 'triangle', 0.03, 180); }
  playQuest() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.05, f, i * 0.1)); }
  playQuestComplete() { [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.7, 'sine', 0.055, f, i * 0.12)); }
  playLevelUp() { [261, 329, 392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.9, 'triangle', 0.05, f, i * 0.09)); }
  playFail() { this.tone(220, 0.18, 'square', 0.035, 160); }
  playUIClick() { this.tone(660, 0.05, 'triangle', 0.025, 700); }
  playUIConfirm() { this.tone(520, 0.09, 'triangle', 0.03, 780); }
  playGrowl() { this.tone(90, 0.5, 'sawtooth', 0.045, 60); this.noise(0.4, 0.04, 300, 'lowpass'); }
  playEnemyDeath() { this.tone(200, 0.5, 'sawtooth', 0.04, 70); this.noise(0.3, 0.05, 400); }
  playBossRoar() { this.tone(70, 1.8, 'sawtooth', 0.09, 40); this.tone(105, 1.5, 'square', 0.04, 55, 0.1); this.noise(1.4, 0.08, 260, 'lowpass'); }
  playBossSlam() { this.noise(0.5, 0.2, 180, 'lowpass'); this.tone(60, 0.6, 'sine', 0.12, 35); }
  playBossCast() { this.tone(300, 0.7, 'sawtooth', 0.05, 900); this.tone(450, 0.9, 'sine', 0.04, 1200, 0.1); }
  playExplosion() { this.noise(0.5, 0.2, 320, 'lowpass'); this.tone(80, 0.4, 'square', 0.07, 40); }

  playMagic(kind = 'fire') {
    if (!this.ready) return;
    if (kind === 'fire') { this.noise(0.4, 0.12, 800, 'lowpass'); this.tone(220, 0.3, 'sawtooth', 0.05, 90); this.tone(440, 0.25, 'sine', 0.03, 880); }
    else if (kind === 'ice') { this.tone(900, 0.35, 'sine', 0.05, 1600); this.tone(1400, 0.4, 'triangle', 0.03, 2100, 0.05); this.noise(0.25, 0.04, 3000, 'bandpass'); }
    else if (kind === 'lightning') { this.noise(0.3, 0.18, 2400, 'bandpass', 0, 2); this.tone(1200, 0.2, 'sawtooth', 0.05, 200); }
    else if (kind === 'heal') { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.04, f, i * 0.08)); }
    else { this.tone(500, 0.3, 'sine', 0.04, 800); }
  }

  meow(pitch = 1) {
    if (!this.ready) return;
    const base = 420 * pitch;
    const dur = 0.42;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1100 * pitch; filter.Q.value = 2.5;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(base * 0.8, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(base * 1.1, t + 0.28);
    osc.frequency.exponentialRampToValueAtTime(base * 0.7, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filter); filter.connect(g); g.connect(this.sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  purr() {
    if (!this.ready) return;
    this.noise(1.2, 0.03, 120, 'lowpass');
  }
}
