export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.volume = .55;
    this.muted = false;
    this.started = false;
    this.rainGain = null;
    this.humGain = null;
    this.fight = false;
    this.beatTimer = 0;
    this.step = 0;
    this.thunderTimer = 35;
    this.lastEngine = 0;
    this.engineOsc = null;
    this.engineGain = null;
  }

  init() {
    if (this.started) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.makeRain();
      this.makeHum();
      this.makeAmbientPad();
      this.started = true;
    } catch (e) { console.warn('Audio unavailable', e); }
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : v, this.ctx.currentTime, .08);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, .08);
  }

  noiseBuffer(seconds = 2) {
    const len = this.ctx.sampleRate * seconds;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  makeRain() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer(3); src.loop = true;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 3400; filter.Q.value = .4;
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    this.rainGain = this.ctx.createGain(); this.rainGain.gain.value = .055;
    src.connect(filter).connect(hp).connect(this.rainGain).connect(this.master);
    src.start();
  }

  makeHum() {
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 56;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = 84.3;
    this.humGain = this.ctx.createGain(); this.humGain.gain.value = .018;
    osc.connect(this.humGain); osc2.connect(this.humGain); this.humGain.connect(this.master);
    osc.start(); osc2.start();
  }

  makeAmbientPad() {
    const freqs = [110, 164.81, 220, 277.18];
    this.padGains = freqs.map((f, i) => {
      const osc = this.ctx.createOscillator(); osc.type = i % 2 ? 'sine' : 'triangle'; osc.frequency.value = f;
      const detune = this.ctx.createOscillator(); detune.type = 'sine'; detune.frequency.value = .08 + i * .03;
      const dg = this.ctx.createGain(); dg.gain.value = 2.5; detune.connect(dg).connect(osc.detune); detune.start();
      const g = this.ctx.createGain(); g.gain.value = i === 0 ? .012 : .006;
      const filt = this.ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 700;
      osc.connect(filt).connect(g).connect(this.master); osc.start();
      return g;
    });
  }

  setWeather(kind) {
    if (!this.rainGain) return;
    const level = kind === 'storm' ? .13 : kind === 'heavy' ? .09 : kind === 'rain' ? .055 : kind === 'fog' ? .025 : .012;
    this.rainGain.gain.setTargetAtTime(level, this.ctx.currentTime, 1.5);
  }

  setFight(on) {
    this.fight = on;
    this.beatTimer = 0; this.step = 0;
    if (this.padGains) this.padGains.forEach((g,i) => g.gain.setTargetAtTime(on ? (i === 0 ? .018 : .008) : (i === 0 ? .012 : .006), this.ctx.currentTime, .4));
  }

  update(dt) {
    if (!this.started) return;
    this.thunderTimer -= dt;
    if (this.thunderTimer <= 0) {
      this.thunderTimer = 40 + Math.random() * 80;
      if (Math.random() < .55) this.thunder();
    }
    if (this.fight) {
      this.beatTimer -= dt;
      if (this.beatTimer <= 0) {
        this.beatTimer = .25;
        this.playBeat(this.step++ % 16);
      }
    }
  }

  tone(freq, dur, type = 'sine', gain = .08, slideTo = null, delay = 0) {
    if (!this.started || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(g).connect(this.master); osc.start(t); osc.stop(t + dur + .02);
  }

  noise(dur, freq = 1000, gain = .08, type = 'lowpass', delay = 0) {
    if (!this.started || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuffer(.4);
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f).connect(g).connect(this.master); src.start(t); src.stop(t + dur + .02);
  }

  footstep(crouch, wet) {
    this.noise(crouch ? .06 : .08, wet ? 700 : 420, crouch ? .015 : .035, 'lowpass');
    if (wet) this.noise(.06, 3200, .012, 'highpass', .01);
  }

  jump() { this.tone(160, .12, 'sine', .035, 80); this.noise(.09, 800, .025); }
  land() { this.noise(.13, 260, .06); this.tone(70, .12, 'sine', .05, 40); }
  punch() { this.noise(.09, 900, .05, 'bandpass'); this.tone(110, .08, 'sine', .05, 55); }
  kick() { this.noise(.12, 500, .07, 'lowpass'); this.tone(90, .12, 'sine', .06, 40); }
  hit(power = 1) {
    this.noise(.12 * power, 220, .09 * power, 'lowpass');
    this.tone(70, .14, 'sine', .08 * power, 32);
    this.noise(.05, 2400, .025, 'highpass', .005);
  }
  impact(power = 1) {
    this.noise(.18 * power, 160, .08 * power, 'lowpass');
    this.tone(52, .22, 'sine', .07 * power, 26);
  }
  block() { this.noise(.07, 1400, .04, 'bandpass'); this.tone(240, .05, 'square', .018, 180); }
  dodge() { this.noise(.14, 1200, .02, 'highpass'); }
  special() { this.tone(55, .5, 'sawtooth', .06, 160); this.noise(.3, 600, .06); setTimeout(() => this.tone(180, .3, 'square', .03, 60), 100); }
  ko() { this.tone(80, .6, 'sine', .1, 25); this.noise(.5, 180, .12); }
  ui() { this.tone(540, .05, 'square', .018, 700); }
  cash() { this.tone(880, .08, 'sine', .03, 1320); setTimeout(() => this.tone(1320, .1, 'sine', .025), 80); }
  thunder() {
    this.noise(1.7, 120, .1, 'lowpass');
    this.tone(36, 1.4, 'sine', .06, 24);
    setTimeout(() => this.noise(1.2, 90, .06, 'lowpass'), 500);
  }
  carStart() { this.tone(70, .2, 'sawtooth', .035, 110); this.noise(.2, 300, .04); }
  carStop() { this.tone(100, .2, 'sawtooth', .025, 40); }
  engine(speed) {
    if (!this.started) return;
    if (this.ctx.currentTime - this.lastEngine < .1) return;
    this.lastEngine = this.ctx.currentTime;
    this.tone(55 + speed * 40, .12, 'sawtooth', .012 + speed * .012, 50 + speed * 30);
  }
  playBeat(step) {
    const kick = step % 4 === 0;
    const snare = step === 4 || step === 12;
    const hat = step % 2 === 1;
    if (kick) { this.tone(52, .22, 'sine', .08, 32); }
    if (snare) { this.noise(.11, 1400, .05, 'bandpass'); this.tone(180, .09, 'triangle', .025, 100); }
    if (hat) { this.noise(.035, 8000, .012, 'highpass'); }
    if (step === 0 || step === 8) this.tone(110, .35, 'triangle', .018, 108);
  }
  speak() {
    // subtle NPC voice blip
    this.tone(180 + Math.random() * 80, .035, 'square', .008);
  }
}
