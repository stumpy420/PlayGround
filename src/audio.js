export class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.muted = false
    this.ready = false
    this.lastShot = 0
    this.noiseBuffer = null
  }

  async unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return false
      this.ctx = new Ctx()
      const master = this.ctx.createGain()
      master.gain.value = this.muted ? 0 : .82
      const comp = this.ctx.createDynamicsCompressor()
      comp.threshold.value = -15
      comp.knee.value = 18
      comp.ratio.value = 7
      comp.attack.value = .003
      comp.release.value = .25
      master.connect(comp)
      comp.connect(this.ctx.destination)
      this.master = master
      this.noiseBuffer = this.makeNoise(2.2)
      this.startAmbience()
      this.ready = true
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    return true
  }

  makeNoise(seconds) {
    const rate = this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(1, Math.floor(rate * seconds), rate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  startAmbience() {
    const ctx = this.ctx
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer
    noise.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 380
    filter.Q.value = .45
    const gain = ctx.createGain()
    gain.gain.value = .028
    noise.connect(filter).connect(gain).connect(this.master)
    noise.start()

    const windLfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    windLfo.frequency.value = .07
    lfoGain.gain.value = .011
    windLfo.connect(lfoGain).connect(gain.gain)
    windLfo.start()

    // low tension drone
    for (const [freq, vol] of [[55, .018], [82.5, .009], [110.3, .004]]) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = vol
      osc.connect(g).connect(this.master)
      osc.start()
    }

    // distant harbor wash
    const wash = ctx.createBufferSource()
    wash.buffer = this.noiseBuffer
    wash.loop = true
    const washFilter = ctx.createBiquadFilter()
    washFilter.type = 'bandpass'
    washFilter.frequency.value = 720
    washFilter.Q.value = .5
    const washGain = ctx.createGain()
    washGain.gain.value = .008
    wash.connect(washFilter).connect(washGain).connect(this.master)
    wash.start()
  }

  setMuted(muted) {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.linearRampToValueAtTime(muted ? 0 : .82, this.ctx.currentTime + .12)
    }
  }

  noiseBurst({ gain = .2, duration = .1, type = 'highpass', frequency = 800, q = .7, when = 0, pan = 0 } = {}) {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime + when
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.setValueAtTime(frequency, t)
    filter.frequency.exponentialRampToValueAtTime(Math.max(90, frequency * .35), t + duration)
    filter.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + .004)
    g.gain.exponentialRampToValueAtTime(.0001, t + duration)
    const p = ctx.createStereoPanner()
    p.pan.value = Math.max(-1, Math.min(1, pan))
    src.connect(filter).connect(g).connect(p).connect(this.master)
    src.start(t)
    src.stop(t + duration + .03)
  }

  tone({ freq = 440, end = 120, gain = .1, duration = .1, type = 'sine', when = 0, pan = 0 } = {}) {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime + when
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + .005)
    g.gain.exponentialRampToValueAtTime(.0001, t + duration)
    const p = ctx.createStereoPanner()
    p.pan.value = Math.max(-1, Math.min(1, pan))
    osc.connect(g).connect(p).connect(this.master)
    osc.start(t)
    osc.stop(t + duration + .02)
  }

  shot(headshot = false) {
    if (!this.ctx) return
    const now = performance.now()
    if (now - this.lastShot < 42) return
    this.lastShot = now
    this.noiseBurst({ gain: .34, duration: .115, type: 'highpass', frequency: 1500, q: 1.2 })
    this.noiseBurst({ gain: .18, duration: .18, type: 'lowpass', frequency: 300, q: .5 })
    this.tone({ freq: 94, end: 39, gain: .28, duration: .13, type: 'square' })
    if (headshot) this.tone({ freq: 1240, end: 780, gain: .035, duration: .12, type: 'sine' })
  }

  enemyShot(distance = 10, pan = 0) {
    if (!this.ctx) return
    const volume = Math.max(.035, Math.min(.19, 1.25 / (distance + 1)))
    this.noiseBurst({ gain: volume, duration: .1, frequency: 900, pan })
    this.tone({ freq: 68, end: 35, gain: volume * .55, duration: .12, type: 'triangle', pan })
  }

  hit(headshot = false) {
    if (!this.ctx) return
    this.tone({ freq: headshot ? 1600 : 1100, end: headshot ? 1250 : 780, gain: .06, duration: .06, type: 'sine' })
    if (headshot) {
      this.tone({ freq: 2300, end: 1900, gain: .035, duration: .09, type: 'triangle' })
      this.noiseBurst({ gain: .035, duration: .05, frequency: 3200 })
    }
  }

  kill() {
    if (!this.ctx) return
    this.tone({ freq: 620, end: 930, gain: .05, duration: .12, type: 'triangle' })
    this.tone({ freq: 930, end: 1400, gain: .03, duration: .15, type: 'sine', when: .06 })
  }

  damage() {
    if (!this.ctx) return
    this.tone({ freq: 78, end: 34, gain: .3, duration: .26, type: 'sawtooth' })
    this.noiseBurst({ gain: .16, duration: .22, type: 'lowpass', frequency: 390, q: .4 })
  }

  reload() {
    if (!this.ctx) return
    this.noiseBurst({ gain: .06, duration: .03, frequency: 2800, when: .02 })
    this.tone({ freq: 430, end: 240, gain: .04, duration: .05, type: 'square', when: .1 })
    this.noiseBurst({ gain: .08, duration: .025, frequency: 1900, when: .55 })
    this.tone({ freq: 310, end: 160, gain: .05, duration: .06, type: 'square', when: .62 })
    this.noiseBurst({ gain: .05, duration: .04, frequency: 3300, when: 1.05 })
    this.tone({ freq: 780, end: 500, gain: .03, duration: .04, type: 'sine', when: 1.05 })
  }

  empty() {
    if (!this.ctx) return
    this.tone({ freq: 1200, end: 350, gain: .04, duration: .04, type: 'square' })
  }

  step() {
    if (!this.ctx) return
    this.noiseBurst({ gain: .022, duration: .07, type: 'lowpass', frequency: 190, q: .4 })
    this.tone({ freq: 72, end: 48, gain: .022, duration: .06, type: 'sine' })
  }

  jump() {
    if (!this.ctx) return
    this.noiseBurst({ gain: .025, duration: .14, type: 'lowpass', frequency: 340 })
  }

  ui(high = false) {
    if (!this.ctx) return
    this.tone({ freq: high ? 820 : 480, end: high ? 1050 : 520, gain: .035, duration: .06, type: 'sine' })
  }

  warning() {
    if (!this.ctx) return
    this.tone({ freq: 160, end: 160, gain: .055, duration: .23, type: 'sawtooth', when: 0 })
    this.tone({ freq: 160, end: 160, gain: .055, duration: .23, type: 'sawtooth', when: .32 })
    this.noiseBurst({ gain: .04, duration: .4, type: 'bandpass', frequency: 400, q: .9 })
  }

  waveClear() {
    if (!this.ctx) return
    ;[440, 554, 659].forEach((f, i) => this.tone({ freq: f, end: f, gain: .045, duration: .45, type: 'sine', when: i * .12 }))
  }

  victory() {
    if (!this.ctx) return
    ;[330, 440, 554, 659, 880].forEach((f, i) => this.tone({ freq: f, end: f, gain: .055, duration: 1.1, type: 'triangle', when: i * .16 }))
    this.noiseBurst({ gain: .08, duration: 1.4, type: 'bandpass', frequency: 800, q: .3 })
  }

  defeat() {
    if (!this.ctx) return
    ;[220, 174, 130, 98].forEach((f, i) => this.tone({ freq: f, end: f * .96, gain: .06, duration: 1.2, type: 'sine', when: i * .27 }))
  }
}
