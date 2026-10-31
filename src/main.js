import * as THREE from 'three'
import { buildWorld } from './world.js'
import { Weapon } from './weapon.js'
import { AudioEngine } from './audio.js'
import { glowTexture } from './textures.js'

const $ = (selector) => document.querySelector(selector)
const clamp = THREE.MathUtils.clamp
const lerp = THREE.MathUtils.lerp
const TAU = Math.PI * 2
const UP = new THREE.Vector3(0, 1, 0)
const START = new THREE.Vector3(0, 0, 10.5)
const getBaseFov = () => {
  const aspect = window.innerWidth / window.innerHeight
  return aspect < .75 ? 88 : aspect < 1.15 ? 80 : 68
}
const EYE = 1.68
const MAG_SIZE = 30
const RELOAD_TIME = 1.28
const WAVES = [
  { count: 4, types: ['scout', 'scout', 'assault', 'scout'] },
  { count: 6, types: ['assault', 'scout', 'scout', 'assault', 'scout', 'heavy'] },
  { count: 8, types: ['assault', 'scout', 'heavy', 'assault', 'scout', 'assault', 'scout', 'heavy'] }
]
const ENEMY_TYPES = {
  scout: { hp: 66, speed: 2.65, fireMin: 1.35, fireMax: 2.2, damage: 9, spread: .055, keep: 7.5, scale: .97, fur: 0xa76f45, accent: 0xb54528, score: 100, helmet: 0x45463a, label: 'RED PAW SCOUT' },
  assault: { hp: 96, speed: 2.05, fireMin: 1.6, fireMax: 2.5, damage: 12, spread: .045, keep: 9.5, scale: 1.04, fur: 0x8b7861, accent: 0x9d3825, score: 125, helmet: 0x3d433a, label: 'RED PAW TROOPER' },
  heavy: { hp: 168, speed: 1.45, fireMin: 1.25, fireMax: 2.0, damage: 17, spread: .038, keep: 10.5, scale: 1.18, fur: 0x6f6254, accent: 0xc04428, score: 200, helmet: 0x333830, label: 'RED PAW BRUTE' }
}

const dom = {
  canvas: $('#game-canvas'),
  hud: $('#hud'),
  title: $('#title-screen'),
  play: $('#play-btn'),
  pause: $('#pause-screen'),
  pauseBtn: $('#pause-btn'),
  resume: $('#resume-btn'),
  end: $('#end-screen'),
  endTitle: $('#end-title'),
  endKicker: $('#end-kicker'),
  endSubtitle: $('#end-subtitle'),
  redeploy: $('#redeploy-btn'),
  menu: $('#menu-btn'),
  restart: $('#restart-btn'),
  toast: $('#toast'),
  health: $('#health-value'),
  healthFill: $('#health-fill'),
  armor: $('#armor-text'),
  ammo: $('#ammo-value'),
  reserve: $('#reserve-value'),
  ammoPips: $('#ammo-pips'),
  reload: $('#reload-readout'),
  reloadFill: $('#reload-fill'),
  score: $('#score-value'),
  objective: $('#objective-text'),
  wave: $('#wave-text'),
  fieldStatus: $('#field-status'),
  timer: $('#mission-timer'),
  killfeed: $('#killfeed'),
  waveBanner: $('#wave-banner'),
  waveKicker: $('#wave-banner-kicker'),
  waveTitle: $('#wave-banner-title'),
  waveSub: $('#wave-banner-sub'),
  compass: $('#compass-track'),
  heading: $('#heading-value'),
  crosshair: $('#crosshair'),
  hitmarker: $('#hitmarker'),
  damageVignette: $('#damage-vignette'),
  hitFlash: $('#hit-flash'),
  damageDir: $('#damage-dir'),
  floating: $('#floating-layer'),
  minimap: $('#minimap'),
  fireBtn: $('#fire-btn'),
  reloadBtn: $('#reload-btn'),
  aimBtn: $('#aim-btn'),
  jumpBtn: $('#jump-btn'),
  joystickZone: $('#joystick-zone'),
  joystickStick: $('#joystick-stick'),
  tiltBtn: $('#tilt-btn'),
  tiltStatus: $('#tilt-status'),
  tiltToggle: $('#tilt-toggle'),
  pauseTiltBtn: $('#pause-tilt-btn'),
  pauseTiltStatus: $('#pause-tilt-status'),
  sensitivity: $('#sensitivity'),
  sensitivityValue: $('#sensitivity-value'),
  audioBtn: $('#audio-btn'),
  invertBtn: $('#invert-btn'),
  statKills: $('#stat-kills'),
  statAccuracy: $('#stat-accuracy'),
  statHeadshots: $('#stat-headshots'),
  statTime: $('#stat-time'),
  statRank: $('#stat-rank'),
  statRankLabel: $('#stat-rank-label'),
  rotateNudge: $('#rotate-nudge'),
  rotateDismiss: $('#rotate-dismiss')
}

const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
if (isTouch) document.body.classList.add('touch-device')

// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.65 : 2))
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(getBaseFov(), window.innerWidth / window.innerHeight, .035, 250)
camera.rotation.order = 'YXZ'
scene.add(camera)
const weapon = new Weapon(camera, scene)
weapon.root.visible = false
const audio = new AudioEngine()
const world = buildWorld(scene, renderer)

const rayTexture = glowTexture('rgba(255,153,66,1)')
const furTexture = glowTexture('rgba(201,122,72,1)')

const game = {
  mode: 'title',
  paused: false,
  started: false,
  over: false,
  deployT: 0,
  deployDuration: .78,
  introPos: new THREE.Vector3(),
  introQuat: new THREE.Quaternion(),
  time: 0,
  missionTime: 0,
  last: performance.now(),
  startedAt: 0,
  health: 100,
  armor: 100,
  regenTimer: 0,
  player: START.clone(),
  yaw: 0,
  pitch: 0,
  kick: 0,
  shake: 0,
  roll: 0,
  jumpY: 0,
  jumpV: 0,
  grounded: true,
  move: new THREE.Vector2(),
  walkPhase: 0,
  firing: false,
  aiming: false,
  ammo: MAG_SIZE,
  reserve: 120,
  reloading: false,
  reloadT: 0,
  nextFire: 0,
  heat: 0,
  score: 0,
  kills: 0,
  headshots: 0,
  shots: 0,
  hits: 0,
  enemies: [],
  enemyHitMeshes: [],
  bullets: [],
  tracers: [],
  effects: [],
  wave: 0,
  waveState: 'idle',
  waveKills: 0,
  pendingSpawns: [],
  spawnTimer: 0,
  nextWaveTimer: 0,
  waveTotal: 18,
  bannerTimer: 0,
  tilt: false,
  tiltSupported: 'DeviceOrientationEvent' in window,
  tiltBaseline: null,
  tiltLast: null,
  sensitivity: 1,
  invert: false,
  muted: false,
  sprinting: false,
  shakeTime: 0,
  lastStep: 0,
  training: false
}

const keys = {}
const tmp = {
  v1: new THREE.Vector3(), v2: new THREE.Vector3(), v3: new THREE.Vector3(),
  dir: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(),
  euler: new THREE.Euler(0, 0, 0, 'YXZ'), quat: new THREE.Quaternion(),
  ray: new THREE.Raycaster(), matrix: new THREE.Matrix4()
}
const raycaster = new THREE.Raycaster()
raycaster.far = 90

// Compass
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
function buildCompass() {
  const frag = document.createDocumentFragment()
  for (let d = -360; d <= 360; d += 15) {
    const span = document.createElement('span')
    const normalized = ((d % 360) + 360) % 360
    const cardinal = normalized % 45 === 0 ? DIRS[normalized / 45] : ''
    span.textContent = cardinal || (normalized % 15 === 0 ? String(normalized).padStart(3, '0') : '')
    if (cardinal) span.className = 'major'
    span.style.width = '38px'
    span.style.minWidth = '38px'
    span.dataset.degree = d
    frag.append(span)
  }
  dom.compass.append(frag)
}
buildCompass()

// ---------- UI helpers ----------
let toastTimeout = 0
function showToast(text, duration = 1700) {
  dom.toast.textContent = text
  dom.toast.classList.add('show')
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), duration)
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function updateHUD() {
  dom.health.textContent = String(Math.ceil(game.health))
  dom.healthFill.style.width = `${clamp(game.health, 0, 100)}%`
  dom.healthFill.classList.toggle('low', game.health < 35)
  dom.armor.textContent = `ARMOR ${Math.round(game.armor)}%`
  dom.ammo.textContent = String(game.ammo).padStart(2, '0')
  dom.ammo.classList.toggle('empty', game.ammo === 0)
  dom.reserve.textContent = String(game.reserve)
  dom.score.textContent = String(game.score).padStart(6, '0')
  dom.wave.textContent = game.wave ? `WAVE ${game.wave} / 3` : 'STANDBY'
  dom.timer.textContent = formatTime(game.missionTime)
  const ammoPips = []
  for (let i = 0; i < MAG_SIZE; i++) ammoPips.push(`<i class="ammo-pip${i < game.ammo ? '' : ' spent'}"></i>`)
  dom.ammoPips.innerHTML = ammoPips.join('')
  if (game.reloading) {
    dom.reload.classList.add('show')
    dom.reloadFill.style.width = `${clamp(game.reloadT / RELOAD_TIME, 0, 1) * 100}%`
  } else {
    dom.reload.classList.remove('show')
  }
  let remaining = game.pendingSpawns.length
  for (const e of game.enemies) if (!e.dead) remaining++
  if (game.mode === 'playing' && !game.over) {
    if (game.waveState === 'active') dom.fieldStatus.textContent = remaining ? `HOSTILES REMAINING ${String(remaining).padStart(2, '0')}` : 'SECTOR CLEAR'
    else if (game.waveState === 'clear') dom.fieldStatus.textContent = game.wave < 3 ? `NEXT WAVE IN ${Math.max(1, Math.ceil(game.nextWaveTimer))}` : 'MARKET SECURED'
    else dom.fieldStatus.textContent = 'AWAITING ORDERS'
  }
  dom.objective.textContent = game.mode === 'title' || !game.wave ? 'CLEAR THE FISH MARKET' : (game.waveState === 'clear' ? 'HOLD THE FISH MARKET' : 'ELIMINATE RED PAW FORCES')
}

function updateCompass() {
  const heading = ((-game.yaw * 180 / Math.PI) % 360 + 360) % 360
  dom.compass.style.transform = `translateX(calc(-50% + ${-heading / 15 * 38}px))`
  const idx = Math.round(heading / 45) % 8
  dom.heading.textContent = `${DIRS[idx]} ${String(Math.round(heading)).padStart(3, '0')}`
}

function flashDamage() {
  dom.damageVignette.style.opacity = '1'
  dom.hitFlash.style.opacity = '.12'
  setTimeout(() => { dom.damageVignette.style.opacity = '0' }, 170)
  setTimeout(() => { dom.hitFlash.style.opacity = '0' }, 70)
}

function showHitmarker(kill = false, head = false) {
  dom.hitmarker.classList.toggle('kill', kill)
  dom.hitmarker.classList.toggle('head', head)
  dom.hitmarker.classList.remove('show')
  void dom.hitmarker.offsetWidth
  dom.hitmarker.classList.add('show')
  clearTimeout(showHitmarker.timer)
  showHitmarker.timer = setTimeout(() => dom.hitmarker.classList.remove('show'), kill ? 180 : 90)
}

function addKillFeed(text, headshot = false) {
  const item = document.createElement('div')
  item.className = `kill-item${headshot ? ' is-head' : ''}`
  item.innerHTML = headshot ? `<b>${text}</b><span class="head-tag">HEADSHOT</span>` : `<b>${text}</b>`
  dom.killfeed.prepend(item)
  while (dom.killfeed.children.length > 4) dom.killfeed.lastChild.remove()
  setTimeout(() => { item.style.opacity = '0'; item.style.transition = 'opacity .3s'; setTimeout(() => item.remove(), 320) }, 3100)
}

function showBanner(kicker, title, sub, duration = 2.1) {
  dom.waveKicker.textContent = kicker
  dom.waveTitle.textContent = title
  dom.waveSub.textContent = sub
  dom.waveBanner.classList.add('show')
  clearTimeout(game.bannerTimer)
  game.bannerTimer = setTimeout(() => dom.waveBanner.classList.remove('show'), duration)
}

function spawnDamageNumber(worldPos, text, headshot = false) {
  const p = worldPos.clone().project(camera)
  if (p.z < -1 || p.z > 1) return
  const el = document.createElement('div')
  el.className = `damage-float${headshot ? ' head' : ''}`
  el.textContent = headshot ? `${text}  HEAD` : text
  el.style.left = `${(p.x * .5 + .5) * window.innerWidth}px`
  el.style.top = `${(-p.y * .5 + .5) * window.innerHeight}px`
  dom.floating.append(el)
  setTimeout(() => el.remove(), 700)
}

function updateTiltUI() {
  const on = game.tilt
  dom.tiltBtn.setAttribute('aria-pressed', String(on))
  dom.tiltToggle.classList.toggle('on', on)
  dom.tiltStatus.textContent = on ? 'ACTIVE / TILT TO AIM' : (game.tiltSupported ? 'OPTIONAL / MOTION PERMISSION' : 'MOTION NOT AVAILABLE')
  dom.pauseTiltBtn.classList.toggle('is-on', on)
  dom.pauseTiltBtn.setAttribute('aria-checked', String(on))
  dom.pauseTiltStatus.textContent = on ? 'Tilt controls are active' : (game.tiltSupported ? 'Request motion permission' : 'No motion sensor detected')
}

// ---------- Audio / input ----------
async function enableAudio() {
  try { await audio.unlock(); audio.ui(true) } catch (e) { console.warn('Audio unavailable', e) }
}

function enablePointerLock() {
  if (!isTouch && document.pointerLockElement !== dom.canvas) {
    const p = dom.canvas.requestPointerLock?.()
    if (p?.catch) p.catch(() => {})
  }
}

function startFiring() {
  if (game.mode !== 'playing' || game.paused || game.over) return
  game.firing = true
  dom.fireBtn.classList.add('held')
}
function stopFiring() {
  game.firing = false
  dom.fireBtn.classList.remove('held')
}

function requestReload() {
  if (game.mode !== 'playing' || game.paused || game.over) return
  if (game.reloading) return
  if (game.ammo >= MAG_SIZE || game.reserve <= 0) {
    if (game.reserve <= 0) showToast('NO RESERVE AMMO // CLAW IT OUT')
    return
  }
  startReload()
}

function startReload() {
  game.reloading = true
  game.reloadT = 0
  weapon.startReload(RELOAD_TIME)
  audio.reload()
}

function finishReload() {
  const needed = MAG_SIZE - game.ammo
  const take = Math.min(needed, game.reserve)
  game.ammo += take
  game.reserve -= take
  game.reloading = false
  game.reloadT = 0
  weapon.stopReload()
  audio.ui(false)
}

function setAim(on) {
  if (game.mode !== 'playing' || game.over) return
  game.aiming = on
  dom.aimBtn.classList.toggle('held', on)
}

function jump() {
  if (game.mode !== 'playing' || game.paused || game.over) return
  if (!game.grounded) return
  game.grounded = false
  game.jumpV = 4.7
  audio.jump()
}

function togglePause(force) {
  if (game.mode !== 'playing' || game.over) return
  const next = typeof force === 'boolean' ? force : !game.paused
  if (next === game.paused) return
  game.paused = next
  dom.pause.classList.toggle('is-hidden', !next)
  if (next) {
    stopFiring()
    game.aiming = false
    document.exitPointerLock?.()
    audio.ui(false)
  } else {
    audio.ui(true)
    dom.pause.classList.add('is-hidden')
  }
}

// Keyboard
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
  if (e.repeat) return
  keys[e.code] = true
  if (e.code === 'KeyR') requestReload()
  if (e.code === 'Space') jump()
  if (e.code === 'Escape' || e.code === 'KeyP') togglePause()
  if ((e.code === 'Enter') && game.mode === 'title') startMission()
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') game.sprinting = true
})
window.addEventListener('keyup', (e) => {
  keys[e.code] = false
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') game.sprinting = false
})

// Mouse look / fire
dom.canvas.addEventListener('mousedown', (e) => {
  if (game.mode !== 'playing' || game.paused) return
  if (document.pointerLockElement !== dom.canvas) {
    enablePointerLock()
    return
  }
  if (e.button === 0) startFiring()
  if (e.button === 2) setAim(true)
})
window.addEventListener('mouseup', (e) => {
  if (e.button === 0) stopFiring()
  if (e.button === 2) setAim(false)
})
window.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('mousemove', (e) => {
  if (game.mode !== 'playing' || game.paused || isTouch) return
  if (document.pointerLockElement !== dom.canvas) return
  const dx = e.movementX || 0, dy = e.movementY || 0
  game.yaw -= dx * .00235 * game.sensitivity
  game.pitch -= dy * .0022 * game.sensitivity * (game.invert ? -1 : 1)
  game.pitch = clamp(game.pitch, -1.18, 1.18)
  weapon.setSway(dx, dy)
})

// Touch look (canvas)
let lookPointer = null
let lookLast = { x: 0, y: 0 }
function onCanvasPointerDown(e) {
  if (game.mode !== 'playing' || game.paused) return
  if (e.pointerType === 'touch') {
    if (lookPointer !== null) return
    lookPointer = e.pointerId
    lookLast.x = e.clientX; lookLast.y = e.clientY
    try { dom.canvas.setPointerCapture?.(e.pointerId) } catch {}
  } else {
    if (document.pointerLockElement !== dom.canvas) enablePointerLock()
  }
}
function onCanvasPointerMove(e) {
  if (e.pointerId !== lookPointer) return
  const dx = e.clientX - lookLast.x
  const dy = e.clientY - lookLast.y
  lookLast.x = e.clientX; lookLast.y = e.clientY
  game.yaw -= dx * .0042 * game.sensitivity
  game.pitch -= dy * .0037 * game.sensitivity * (game.invert ? -1 : 1)
  game.pitch = clamp(game.pitch, -1.18, 1.18)
  weapon.setSway(dx, dy)
}
function onCanvasPointerUp(e) {
  if (e.pointerId === lookPointer) lookPointer = null
}
dom.canvas.addEventListener('pointerdown', onCanvasPointerDown)
dom.canvas.addEventListener('pointermove', onCanvasPointerMove)
dom.canvas.addEventListener('pointerup', onCanvasPointerUp)
dom.canvas.addEventListener('pointercancel', onCanvasPointerUp)

// Touch buttons
function bindHold(button, down, up) {
  button.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation()
    button.classList.add('held')
    try { button.setPointerCapture(e.pointerId) } catch {}
    down()
  })
  const end = (e) => {
    e.preventDefault(); e.stopPropagation()
    button.classList.remove('held')
    up()
  }
  button.addEventListener('pointerup', end)
  button.addEventListener('pointercancel', end)
  button.addEventListener('pointerleave', (e) => { if (e.pointerId !== undefined && button.hasPointerCapture?.(e.pointerId)) return; button.classList.remove('held'); up() })
}
bindHold(dom.fireBtn, () => { enableAudio(); startFiring() }, stopFiring)
dom.reloadBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); requestReload() })
dom.aimBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); setAim(!game.aiming); audio.ui(game.aiming) })
dom.jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); jump() })

// Joystick
let joyPointer = null
function updateJoystick(e) {
  const rect = dom.joystickZone.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const max = rect.width * .31
  let dx = e.clientX - cx
  let dy = e.clientY - cy
  const len = Math.hypot(dx, dy)
  if (len > max) { dx = dx / len * max; dy = dy / len * max }
  game.move.set(dx / max, dy / max)
  dom.joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
}
dom.joystickZone.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation()
  if (joyPointer !== null) return
  joyPointer = e.pointerId
  try { dom.joystickZone.setPointerCapture(e.pointerId) } catch {}
  updateJoystick(e)
})
dom.joystickZone.addEventListener('pointermove', (e) => {
  if (e.pointerId !== joyPointer) return
  e.preventDefault()
  updateJoystick(e)
})
function endJoystick(e) {
  if (e.pointerId !== joyPointer) return
  joyPointer = null
  game.move.set(0, 0)
  dom.joystickStick.style.transform = 'translate(-50%, -50%)'
}
dom.joystickZone.addEventListener('pointerup', endJoystick)
dom.joystickZone.addEventListener('pointercancel', endJoystick)

// ---------- Tilt ----------
async function toggleTilt() {
  if (!game.tiltSupported) {
    showToast('MOTION SENSORS NOT AVAILABLE ON THIS DEVICE')
    return
  }
  await enableAudio()
  if (game.tilt) {
    game.tilt = false
    game.tiltBaseline = null
    game.tiltLast = null
    updateTiltUI()
    showToast('TILT AIM DISABLED')
    audio.ui(false)
    return
  }
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission !== 'granted') {
        showToast('MOTION PERMISSION DENIED // TOUCH AIM STILL ACTIVE', 2600)
        return
      }
    }
    game.tilt = true
    game.tiltBaseline = null
    game.tiltLast = null
    updateTiltUI()
    showToast('TILT AIM ARMED // HOLD DEVICE STEADY')
    audio.ui(true)
  } catch (error) {
    console.warn('Device orientation permission failed', error)
    showToast('MOTION PERMISSION UNAVAILABLE')
  }
}
dom.tiltBtn.addEventListener('click', (e) => { e.preventDefault(); toggleTilt() })
dom.pauseTiltBtn.addEventListener('click', (e) => { e.preventDefault(); toggleTilt() })

window.addEventListener('deviceorientation', (e) => {
  if (!game.tilt || game.paused || game.mode !== 'playing') return
  const beta = e.beta
  const gamma = e.gamma
  if (beta == null || gamma == null) return
  if (!game.tiltBaseline) {
    game.tiltBaseline = { beta, gamma }
    game.tiltLast = { beta, gamma }
    return
  }
  const dGamma = gamma - game.tiltLast.gamma
  const dBeta = beta - game.tiltLast.beta
  game.tiltLast.beta = beta; game.tiltLast.gamma = gamma
  if (Math.abs(dGamma) < .035 && Math.abs(dBeta) < .035) return
  const angle = screen.orientation?.angle || 0
  const landscape = angle === 90 || angle === -90 || angle === 270
  const gain = .0016 * game.sensitivity
  if (landscape) {
    const flip = angle === -90 || angle === 270 ? -1 : 1
    game.yaw -= dBeta * gain * flip
    game.pitch += dGamma * gain * flip * (game.invert ? -1 : 1)
  } else {
    game.yaw -= dGamma * gain
    game.pitch += dBeta * gain * (game.invert ? -1 : 1)
  }
  game.pitch = clamp(game.pitch, -1.18, 1.18)
})

// Settings
dom.sensitivity.addEventListener('input', () => {
  game.sensitivity = Number(dom.sensitivity.value)
  dom.sensitivityValue.textContent = game.sensitivity.toFixed(1)
})
dom.audioBtn.addEventListener('click', () => {
  game.muted = !game.muted
  audio.setMuted(game.muted)
  dom.audioBtn.classList.toggle('is-on', !game.muted)
  dom.audioBtn.setAttribute('aria-checked', String(!game.muted))
  if (!game.muted) enableAudio()
})
dom.invertBtn.addEventListener('click', () => {
  game.invert = !game.invert
  dom.invertBtn.classList.toggle('is-on', game.invert)
  dom.invertBtn.setAttribute('aria-checked', String(game.invert))
  audio.ui(game.invert)
})
dom.pauseBtn.addEventListener('click', () => togglePause(true))
dom.resume.addEventListener('click', () => togglePause(false))
dom.restart.addEventListener('click', () => { togglePause(false); startMission() })
dom.redeploy.addEventListener('click', () => startMission())
dom.menu.addEventListener('click', () => showTitle())
dom.rotateDismiss.addEventListener('click', () => dom.rotateNudge.classList.remove('want'))
dom.play.addEventListener('click', () => startMission())
window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', () => { setTimeout(onResize, 80); if (Math.abs(window.orientation) === 90) dom.rotateNudge.classList.remove('want') })
document.addEventListener('visibilitychange', () => { if (document.hidden && game.mode === 'playing' && !game.over) togglePause(true) })

function onResize() {
  const w = window.innerWidth, h = window.innerHeight
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.65 : 2))
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.fov = getBaseFov()
  camera.updateProjectionMatrix()
  weapon.setViewport(w / h)
  updateIntroCamera(performance.now() * .001, true)
}

// ---------- Camera / intro ----------
function updateIntroCamera(time, immediate = false) {
  if (game.mode !== 'title') return
  const portrait = window.innerHeight > window.innerWidth
  if (portrait) {
    camera.position.set(3.3 + Math.sin(time * .12) * .15, 1.82 + Math.sin(time * .27) * .018, 11.6 + Math.sin(time * .09) * .12)
    camera.lookAt(1.15, 1.34, -2.2)
  } else {
    camera.position.set(5.15 + Math.sin(time * .12) * .23, 1.93 + Math.sin(time * .27) * .02, 14.0 + Math.sin(time * .09) * .16)
    camera.lookAt(-.4, 1.36, -6.4)
  }
  game.introPos.copy(camera.position)
  game.introQuat.copy(camera.quaternion)
  if (immediate) { camera.updateMatrixWorld() }
}

function updateCamera(dt) {
  const bobAmount = (game.grounded ? 1 : 0) * Math.min(1, Math.hypot(game.move.x, game.move.y)) * (game.sprinting ? .03 : .018)
  const bobY = Math.abs(Math.sin(game.walkPhase * .5)) * bobAmount
  const target = tmp.v1.set(game.player.x, EYE + game.jumpY + bobY, game.player.z)
  const targetQuat = tmp.quat.setFromEuler(tmp.euler.set(game.pitch + game.kick, game.yaw, game.roll, 'YXZ'))

  if (game.deployT > 0) {
    game.deployT = Math.max(0, game.deployT - dt)
    const p = 1 - game.deployT / game.deployDuration
    const e = 1 - Math.pow(1 - p, 3)
    camera.position.lerpVectors(game.introPos, target, e)
    camera.quaternion.slerpQuaternions(game.introQuat, targetQuat, e)
    if (p >= 1) { camera.position.copy(target); camera.quaternion.copy(targetQuat) }
    return
  }

  const shake = game.shake
  if (shake > .0001) {
    const t = performance.now() * .001
    camera.position.set(
      target.x + (Math.sin(t * 63) + Math.sin(t * 91)) * shake * .018,
      target.y + Math.sin(t * 77) * shake * .018,
      target.z + Math.cos(t * 57) * shake * .012
    )
    camera.quaternion.setFromEuler(tmp.euler.set(
      game.pitch + game.kick + Math.sin(t * 83) * shake * .009,
      game.yaw + Math.cos(t * 61) * shake * .012,
      game.roll + Math.sin(t * 71) * shake * .018,
      'YXZ'
    ))
    game.shake *= Math.exp(-dt * 7.2)
  } else {
    camera.position.lerp(target, 1 - Math.exp(-dt * 24))
    camera.quaternion.slerp(targetQuat, 1 - Math.exp(-dt * 30))
  }
}

// ---------- Mission lifecycle ----------
function clearTransient() {
  for (const e of game.enemies) scene.remove(e.model)
  for (const b of game.bullets) scene.remove(b.mesh)
  for (const t of game.tracers) { scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose() }
  for (const fx of game.effects) { scene.remove(fx.mesh); fx.mesh.geometry?.dispose?.(); fx.mesh.material?.dispose?.() }
  game.enemies = []
  game.enemyHitMeshes = []
  game.bullets = []
  game.tracers = []
  game.effects = []
  dom.killfeed.innerHTML = ''
  dom.floating.innerHTML = ''
}

function startMission() {
  if (game.mode === 'playing' && !game.over && game.deployT <= 0) return
  clearTimeout(game.bannerTimer)
  clearTransient()
  game.mode = 'playing'
  game.paused = false
  game.over = false
  game.started = true
  game.deployT = game.deployDuration
  game.health = 100
  game.armor = 100
  game.regenTimer = 0
  game.player.copy(START)
  game.yaw = 0
  game.pitch = -.02
  game.kick = 0
  game.shake = 0
  game.roll = 0
  game.jumpY = 0
  game.jumpV = 0
  game.grounded = true
  game.move.set(0, 0)
  game.ammo = MAG_SIZE
  game.reserve = 120
  game.reloading = false
  game.reloadT = 0
  game.nextFire = 0
  game.heat = 0
  game.score = 0
  game.kills = 0
  game.headshots = 0
  game.shots = 0
  game.hits = 0
  game.wave = 0
  game.waveState = 'idle'
  game.waveKills = 0
  game.pendingSpawns = []
  game.spawnTimer = 0
  game.nextWaveTimer = 0
  game.missionTime = 0
  game.lastStep = 0
  game.firing = false
  game.aiming = false
  game.walkPhase = 0
  weapon.stopReload()
  weapon.root.visible = true
  weapon.root.position.set(.27, -.255, -.52)
  weapon.root.rotation.set(-.015, -.05, 0)
  world.hero.visible = false
  world.buddy.visible = false
  dom.hud.classList.remove('is-hidden')
  dom.title.classList.add('is-hidden')
  dom.pause.classList.add('is-hidden')
  dom.end.classList.add('is-hidden')
  dom.waveBanner.classList.remove('show')
  document.body.classList.add('is-playing')
  updateTiltUI()
  updateHUD()
  enableAudio()
  // first wave shortly after boots hit the ground
  game.wave = 1
  game.waveState = 'active'
  game.pendingSpawns = [...WAVES[0].types]
  game.forceSpawnPoint = new THREE.Vector3(1.05, 0, 3.4)
  game.spawnTimer = .85
  showBanner('OPERATION DUST & WHISKERS', 'WAVE 01', 'RED PAW PATROL DETECTED', 2400)
  setTimeout(() => audio.warning(), 220)
  if (isTouch && window.innerHeight > window.innerWidth) {
    dom.rotateNudge.classList.add('want')
    setTimeout(() => dom.rotateNudge.classList.remove('want'), 7000)
  }
  updateHUD()
}

function showTitle() {
  clearTransient()
  clearTimeout(game.bannerTimer)
  game.mode = 'title'
  game.paused = false
  game.over = false
  game.started = false
  game.deployT = 0
  game.firing = false
  game.aiming = false
  game.reloading = false
  game.move.set(0, 0)
  game.wave = 0
  game.player.copy(START)
  game.yaw = 0
  game.pitch = 0
  dom.hud.classList.add('is-hidden')
  dom.title.classList.remove('is-hidden')
  dom.pause.classList.add('is-hidden')
  dom.end.classList.add('is-hidden')
  dom.waveBanner.classList.remove('show')
  dom.rotateNudge.classList.remove('want')
  document.body.classList.remove('is-playing')
  weapon.root.visible = false
  world.hero.visible = true
  world.buddy.visible = true
  updateIntroCamera(performance.now() * .001, true)
}

function startWave(index) {
  const wave = WAVES[index]
  if (!wave) return
  game.wave = index + 1
  game.waveState = 'active'
  game.waveKills = 0
  game.pendingSpawns = [...wave.types]
  game.spawnTimer = .55
  game.nextWaveTimer = 0
  showBanner(`WAVE ${String(index + 1).padStart(2, '0')} // INBOUND`, `WAVE ${String(index + 1).padStart(2, '0')}`, index === 0 ? 'RED PAW PATROL DETECTED' : index === 1 ? 'ARMORED RESPONSE TEAM INBOUND' : 'RED PAW ELITE GUARD INBOUND', 2300)
  audio.warning()
  updateHUD()
}

function waveCleared() {
  game.waveState = 'clear'
  game.waveKills = 0
  audio.waveClear()
  if (game.wave >= 3) {
    game.nextWaveTimer = 2.35
    showBanner('ALL HOSTILES DOWN', 'MARKET SECURED', 'EXTRACTION TEAM EN ROUTE', 2200)
    setTimeout(() => { if (game.mode === 'playing' && !game.over) endMission(true) }, 1900)
  } else {
    game.nextWaveTimer = 3.5
    showBanner('SECTOR SECURED', 'WAVE CLEAR', `REGROUP // WAVE ${String(game.wave + 1).padStart(2, '0')} INBOUND`, 2100)
  }
  updateHUD()
}

function endMission(victory) {
  if (game.over) return
  game.over = true
  game.firing = false
  game.aiming = false
  document.exitPointerLock?.()
  const accuracy = game.shots ? Math.round(game.hits / game.shots * 100) : 0
  dom.end.classList.remove('is-hidden')
  dom.hud.classList.remove('is-hidden')
  dom.endTitle.textContent = victory ? 'MARKET SECURED' : 'FELINE DOWN'
  dom.endTitle.classList.toggle('defeat', !victory)
  dom.endKicker.textContent = victory ? 'AFTER ACTION REPORT // MISSION COMPLETE' : 'AFTER ACTION REPORT // KIA'
  dom.endSubtitle.textContent = victory
    ? 'The fish market is ours. The Red Paw Syndicate is in full retreat. Somebody get this cat a saucer of milk.'
    : 'You ran out of lives. The Red Paw Syndicate holds the fish market — for now. Regroup, reload, and take it back.'
  dom.statKills.textContent = String(game.kills)
  dom.statAccuracy.textContent = `${accuracy}%`
  dom.statHeadshots.textContent = String(game.headshots)
  dom.statTime.textContent = formatTime(game.missionTime)
  let rank = 'C'
  if (victory && accuracy >= 55 && game.headshots >= 8) rank = 'S'
  else if (victory && accuracy >= 38) rank = 'A'
  else if (victory) rank = 'B'
  dom.statRank.textContent = rank
  dom.statRankLabel.textContent = victory
    ? (rank === 'S' ? 'PURRFECT TACTICAL EXECUTION' : rank === 'A' ? 'EXEMPLARY PURRFORMANCE' : 'MISSION ACCOMPLISHED')
    : 'NOT TODAY // TRY ANOTHER LIFE'
  if (victory) audio.victory(); else audio.defeat()
  stopFiring()
}

// ---------- Damage / combat ----------
function damagePlayer(amount, sourcePos, fromDirection = null) {
  if (game.mode !== 'playing' || game.over) return
  const absorbed = Math.min(game.armor, amount * .64)
  game.armor -= absorbed
  const healthDamage = amount - absorbed
  game.health -= healthDamage
  game.regenTimer = 6
  game.shake = Math.max(game.shake, .45)
  flashDamage()
  audio.damage()
  if (sourcePos) {
    const dx = sourcePos.x - game.player.x
    const dz = sourcePos.z - game.player.z
    const forward = -game.yaw
    const angle = Math.atan2(dx, dz) + forward
    dom.damageDir.style.transform = `rotate(${angle}rad)`
    dom.damageDir.style.opacity = '1'
    clearTimeout(damagePlayer.dirTimer)
    damagePlayer.dirTimer = setTimeout(() => { dom.damageDir.style.opacity = '0' }, 380)
  }
  dom.health.style.color = '#ffd9c6'
  setTimeout(() => { dom.health.style.color = '' }, 130)
  updateHUD()
  if (game.health <= 0) {
    game.health = 0
    endMission(false)
  }
}

function spawnEnemy(typeKey = 'scout') {
  const cfg = ENEMY_TYPES[typeKey] || ENEMY_TYPES.scout
  const model = world.createCatModel({ fur: cfg.fur, accent: cfg.accent, heavy: typeKey === 'heavy', helmet: cfg.helmet })
  let spawn = world.spawnPoints[0]
  if (game.forceSpawnPoint) {
    spawn = game.forceSpawnPoint
    game.forceSpawnPoint = null
  } else {
    let bestDist = -1
    for (let attempt = 0; attempt < 7; attempt++) {
      const candidate = world.spawnPoints[Math.floor(Math.random() * world.spawnPoints.length)]
      const dist = candidate.distanceTo(game.player)
      if (dist > bestDist && dist < 30) { bestDist = dist; spawn = candidate }
    }
  }
  // avoid spawning directly on top of any active enemy
  for (const other of game.enemies) {
    if (!other.dead && other.model.position.distanceTo(spawn) < 2.2) {
      spawn = world.spawnPoints.find(p => p.distanceTo(other.model.position) > 2.4 && p.distanceTo(game.player) > 8) || spawn
      break
    }
  }
  model.position.copy(spawn)
  model.scale.setScalar(.05)
  model.rotation.y = Math.atan2(-(game.player.x - spawn.x), -(game.player.z - spawn.z))
  scene.add(model)
  const head = model.userData.headBox
  const body = model.userData.bodyBox
  const enemy = {
    model, type: typeKey, cfg, hp: cfg.hp, maxHp: cfg.hp, dead: false,
    fireCooldown: .7 + Math.random() * 1.8, strafeDir: Math.random() > .5 ? 1 : -1,
    strafeTimer: .8 + Math.random() * 1.6, walk: 0, spawnT: 0,
    hitFlash: 0, deathT: 0, targetScale: cfg.scale, aimed: false,
    head, body, label: cfg.label
  }
  head.userData.entity = enemy
  body.userData.entity = enemy
  head.userData.zone = 'head'
  body.userData.zone = 'body'
  const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: rayTexture, color: 0xff5a2f, transparent: true, opacity: .72, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }))
  marker.position.y = 2.28
  marker.scale.setScalar(.28)
  model.add(marker)
  enemy.marker = marker
  game.enemyHitMeshes.push(head, body)
  game.enemies.push(enemy)
  spawnDust(spawn, 1.4)
  audio.ui(false)
  return enemy
}

function killEnemy(enemy, headshot) {
  if (enemy.dead) return
  enemy.dead = true
  enemy.state = 'dead'
  game.kills++
  game.waveKills++
  game.score += enemy.cfg.score + (headshot ? 75 : 0)
  const headIdx = game.enemyHitMeshes.indexOf(enemy.head)
  if (headIdx >= 0) game.enemyHitMeshes.splice(headIdx, 1)
  const bodyIdx = game.enemyHitMeshes.indexOf(enemy.body)
  if (bodyIdx >= 0) game.enemyHitMeshes.splice(bodyIdx, 1)
  addKillFeed(`YOU  ⟶  ${enemy.cfg.label}`, headshot)
  burst(enemy.model.position.clone().setY(1.3), enemy.cfg.fur, 10, .55)
  audio.kill()
  if (game.enemies.every(e => e.dead)) {
    // wave clear is evaluated on next update after all spawns are spent
  }
}

function hurtEnemy(enemy, zone, point, damage) {
  const headshot = zone === 'head'
  const finalDamage = headshot ? damage * 3.2 : damage
  enemy.hp -= finalDamage
  enemy.hitFlash = .1
  enemy.model.userData.torso.material.emissive?.setHex(0xffffff)
  if (enemy.model.userData.torso.material.emissive) enemy.model.userData.torso.material.emissiveIntensity = .55
  game.hits++
  showHitmarker(enemy.hp <= 0, headshot)
  audio.hit(headshot)
  spawnDamageNumber(point, headshot ? 'HEADSHOT' : String(Math.round(finalDamage)), headshot)
  burst(point, headshot ? 0xffb46b : enemy.cfg.fur, headshot ? 9 : 5, .28)
  if (enemy.hp <= 0) killEnemy(enemy, headshot)
}

function addTracer(from, to, color = 0xffd9a0, opacity = .88, life = .075) {
  const geometry = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()])
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
  const line = new THREE.Line(geometry, material)
  scene.add(line)
  game.tracers.push({ line, life, max: life })
}

function spawnImpact(point, normalHint = null) {
  const p = point.clone()
  burst(p, 0xffc37c, 4, .18)
  const ring = new THREE.Mesh(new THREE.RingGeometry(.03, .065, 8), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: .65, side: THREE.DoubleSide, depthWrite: false }))
  ring.position.copy(p)
  if (normalHint) ring.lookAt(p.clone().add(normalHint))
  else ring.lookAt(camera.position)
  scene.add(ring)
  game.effects.push({ mesh: ring, life: .22, max: .22, kind: 'ring' })
}

function burst(point, color, count = 7, spread = .35) {
  const map = color === 0xffc37c || color === 0xffb46b ? rayTexture : furTexture
  for (let i = 0; i < count; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 }))
    sprite.position.copy(point)
    sprite.scale.setScalar(.09 + Math.random() * .16)
    sprite.userData.v = new THREE.Vector3((Math.random() - .5) * 2.6, Math.random() * 2.1 + .3, (Math.random() - .5) * 2.6).multiplyScalar(spread)
    scene.add(sprite)
    game.effects.push({ mesh: sprite, life: .25 + Math.random() * .35, max: .6, kind: 'spark', gravity: 3.2 })
  }
}

function spawnDust(origin, size = 1) {
  const map = rayTexture
  for (let i = 0; i < 7; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: 0xcbb092, transparent: true, opacity: .26, depthWrite: false }))
    sprite.position.set(origin.x + (Math.random() - .5) * 1.2, .1 + Math.random() * .3, origin.z + (Math.random() - .5) * 1.2)
    sprite.scale.setScalar((.4 + Math.random() * .8) * size)
    sprite.userData.v = new THREE.Vector3((Math.random() - .5) * .5, .2 + Math.random() * .4, (Math.random() - .5) * .5)
    scene.add(sprite)
    game.effects.push({ mesh: sprite, life: .5 + Math.random() * .4, max: .9, kind: 'dust', gravity: -.2 })
  }
}

function fireWeapon() {
  if (game.firing && !game.reloading && game.ammo > 0) {
    const now = performance.now()
    if (now < game.nextFire) return
    game.nextFire = now + 108
    game.ammo--
    game.shots++
    game.heat = Math.min(1, game.heat + .09)
    const spreadBase = game.aiming ? .0011 : .0045
    const spread = spreadBase + Math.min(.013, Math.hypot(game.move.x, game.move.y) * .007) + game.heat * .006
    tmp.euler.set(game.pitch + game.kick, game.yaw, 0, 'YXZ')
    tmp.dir.set(0, 0, -1).applyEuler(tmp.euler).normalize()
    tmp.right.crossVectors(tmp.dir, UP).normalize()
    tmp.up.crossVectors(tmp.right, tmp.dir).normalize()
    const a = Math.random() * TAU
    const r = Math.sqrt(Math.random()) * spread
    tmp.dir.addScaledVector(tmp.right, Math.cos(a) * r).addScaledVector(tmp.up, Math.sin(a) * r).normalize()
    const origin = camera.position.clone()
    raycaster.set(origin, tmp.dir)
    const candidates = world.hitMeshes.concat(game.enemyHitMeshes)
    const hits = raycaster.intersectObjects(candidates, false)
    const first = hits[0]
    const muzzle = weapon.getMuzzleWorldPosition(tmp.v3).clone()
    let end
    if (first) {
      end = first.point.clone()
      const entity = first.object.userData?.entity
      if (entity && !entity.dead) {
        hurtEnemy(entity, first.object.userData.zone, first.point, 30)
      } else if (!entity) {
        spawnImpact(first.point, first.face?.normal)
      }
    } else {
      end = origin.clone().addScaledVector(tmp.dir, 70)
    }
    addTracer(muzzle, end, game.aiming ? 0xfff2dc : 0xffc67e, .92, .055)
    weapon.fire()
    audio.shot(false)
    game.kick = Math.min(.085, game.kick + .010 + Math.random() * .006)
    game.shake = Math.max(game.shake, .07)
    game.heat = Math.min(1, game.heat + .12)
    if (game.ammo === 0) {
      audio.empty()
      setTimeout(() => { if (game.mode === 'playing' && !game.reloading && game.ammo === 0) requestReload() }, 280)
    }
    updateHUD()
  }
}

function enemyShoot(enemy) {
  const muzzle = enemy.model.userData.muzzlePoint.getWorldPosition(new THREE.Vector3())
  const target = tmp.v1.set(
    game.player.x + (Math.random() - .5) * 1.4,
    EYE + game.jumpY + (Math.random() - .5) * .75,
    game.player.z + (Math.random() - .5) * 1.4
  )
  const dir = target.clone().sub(muzzle).normalize()
  const spread = enemy.cfg.spread * (1 + enemy.walk * .65)
  dir.x += (Math.random() - .5) * spread
  dir.y += (Math.random() - .5) * spread * .65
  dir.z += (Math.random() - .5) * spread
  dir.normalize()
  const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff8f45 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 4), bulletMat)
  mesh.position.copy(muzzle)
  scene.add(mesh)
  const vel = dir.multiplyScalar(38)
  game.bullets.push({ mesh, vel, life: 2.2, damage: enemy.cfg.damage, origin: muzzle.clone() })
  const end = muzzle.clone().addScaledVector(vel.clone().normalize(), 7)
  addTracer(muzzle, end, 0xff8040, .7, .07)
  // muzzle flare
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: rayTexture, color: 0xffbc7a, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }))
  flare.position.copy(muzzle)
  flare.scale.setScalar(.33)
  scene.add(flare)
  game.effects.push({ mesh: flare, life: .045, max: .045, kind: 'flare' })
  const distance = muzzle.distanceTo(camera.position)
  const right = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation)
  const toEnemy = muzzle.clone().sub(camera.position).normalize()
  audio.enemyShot(distance, clamp(toEnemy.dot(right), -1, 1) * .8)
}

function updateEnemies(dt, time) {
  const alive = []
  for (const enemy of game.enemies) {
    if (enemy.dead) {
      enemy.deathT += dt
      const t = enemy.deathT
      enemy.model.rotation.z = lerp(enemy.model.rotation.z, (enemy.cfg.heavy ? 1 : 1.4), 1 - Math.exp(-dt * 5))
      enemy.model.rotation.x = lerp(enemy.model.rotation.x, .4, 1 - Math.exp(-dt * 3))
      enemy.model.position.y = Math.max(-.35, -.1 - t * .12)
      if (t > 2.6) { scene.remove(enemy.model); enemy.gone = true }
      continue
    }
    alive.push(enemy)
    if (enemy.spawnT < 1) {
      enemy.spawnT = Math.min(1, enemy.spawnT + dt * 2.2)
      const s = enemy.targetScale * (.05 + .95 * (1 - Math.pow(1 - enemy.spawnT, 3)))
      enemy.model.scale.setScalar(s)
    }
    const toPlayer = tmp.v1.set(game.player.x - enemy.model.position.x, 0, game.player.z - enemy.model.position.z)
    const dist = toPlayer.length()
    if (dist > .001) toPlayer.divideScalar(dist)
    const cfg = enemy.cfg
    const desired = cfg.keep
    let forward = 0
    if (dist > desired + 1.2) forward = 1
    else if (dist < desired - 2.2) forward = -.65
    if (enemy.spawnT < 1) forward *= .3
    enemy.strafeTimer -= dt
    if (enemy.strafeTimer <= 0) { enemy.strafeDir *= -1; enemy.strafeTimer = .8 + Math.random() * 1.9 }
    const strafe = enemy.strafeDir * (dist < 17 ? .68 : .25)
    const perpX = -toPlayer.z, perpZ = toPlayer.x
    let vx = toPlayer.x * forward + perpX * strafe
    let vz = toPlayer.z * forward + perpZ * strafe
    const len = Math.hypot(vx, vz)
    if (len > 1) { vx /= len; vz /= len }
    const moving = Math.min(1, len) * enemy.spawnT
    enemy.walk = lerp(enemy.walk, moving, 1 - Math.exp(-dt * 7))
    const speed = cfg.speed * enemy.spawnT
    moveEnemy(enemy, vx * speed * dt, vz * speed * dt)
    const targetYaw = Math.atan2(-(game.player.x - enemy.model.position.x), -(game.player.z - enemy.model.position.z))
    let deltaYaw = targetYaw - enemy.model.rotation.y
    while (deltaYaw > Math.PI) deltaYaw -= TAU
    while (deltaYaw < -Math.PI) deltaYaw += TAU
    enemy.model.rotation.y += deltaYaw * (1 - Math.exp(-dt * 8))
    // hit flash decay
    if (enemy.hitFlash > 0) {
      enemy.hitFlash -= dt
      const mats = [enemy.model.userData.torso.material, enemy.model.userData.skull.material]
      for (const m of mats) { if (m.emissive) { m.emissive.setHex(0xffffff); m.emissiveIntensity = Math.max(0, enemy.hitFlash * 4) } }
    } else {
      const m = enemy.model.userData.torso.material
      if (m.emissive) m.emissiveIntensity = 0
    }
    world.animateCat(enemy.model, time + enemy.model.position.x, enemy.walk, dist < 18 ? 1 : 0)
    if (enemy.marker) {
      enemy.marker.material.opacity = .45 + Math.sin(time * 4 + enemy.model.position.x) * .18
      enemy.marker.position.y = 2.22 - Math.sin(time * 3 + enemy.model.position.z) * .035
    }
    // fire
    enemy.fireCooldown -= dt
    if (enemy.spawnT > .78 && enemy.fireCooldown <= 0) {
      if (dist < 27 && dist > 2.4) {
        if (hasLineOfSight(enemy)) {
          enemyShoot(enemy)
          enemy.fireCooldown = cfg.fireMin + Math.random() * (cfg.fireMax - cfg.fireMin)
        } else {
          enemy.fireCooldown = .32 + Math.random() * .25
        }
      } else {
        enemy.fireCooldown = .6
      }
    }
  }
  if (alive.length === 0) {
    // all remaining dead; prune gone
  }
  game.enemies = game.enemies.filter(e => !e.gone)
}

function moveEnemy(enemy, dx, dz) {
  const model = enemy.model
  const radius = .36
  let nx = model.position.x + dx
  if (!blockedAt(nx, model.position.z, radius)) model.position.x = nx
  let nz = model.position.z + dz
  if (!blockedAt(model.position.x, nz, radius)) model.position.z = nz
  model.position.x = clamp(model.position.x, world.bounds.minX + .1, world.bounds.maxX - .1)
  model.position.z = clamp(model.position.z, world.bounds.minZ + .1, world.bounds.maxZ - .1)
}

const losRay = new THREE.Raycaster()
function hasLineOfSight(enemy) {
  const from = enemy.model.userData.head.getWorldPosition(new THREE.Vector3())
  const to = new THREE.Vector3(game.player.x, EYE - .1, game.player.z)
  const d = to.clone().sub(from)
  const dist = d.length()
  d.normalize()
  losRay.set(from, d)
  losRay.far = dist - .6
  const hit = losRay.intersectObjects(world.hitMeshes, false)[0]
  return !hit
}

function updateBullets(dt) {
  const playerCenter = new THREE.Vector3(game.player.x, EYE + game.jumpY - .15, game.player.z)
  for (let i = game.bullets.length - 1; i >= 0; i--) {
    const b = game.bullets[i]
    b.life -= dt
    b.mesh.position.addScaledVector(b.vel, dt)
    const dist = b.mesh.position.distanceTo(playerCenter)
    if (dist < .55) {
      damagePlayer(b.damage, b.origin)
      scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
      game.bullets.splice(i, 1)
      continue
    }
    if (b.life <= 0 || b.mesh.position.y < -.2) {
      scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
      game.bullets.splice(i, 1)
    }
  }
}

function updateEffects(dt) {
  for (let i = game.effects.length - 1; i >= 0; i--) {
    const fx = game.effects[i]
    fx.life -= dt
    if (fx.kind === 'ring') {
      fx.mesh.scale.setScalar(1 + (1 - fx.life / fx.max) * 1.5)
      fx.mesh.material.opacity = Math.max(0, fx.life / fx.max * .65)
    } else if (fx.kind === 'flare') {
      fx.mesh.material.opacity = Math.max(0, fx.life / fx.max)
      fx.mesh.scale.setScalar(.3 + (1 - fx.life / fx.max) * .2)
    } else {
      if (fx.gravity && fx.mesh.userData.v) fx.mesh.userData.v.y -= fx.gravity * fx.gravity * dt * .16
      if (fx.mesh.userData.v) fx.mesh.position.addScaledVector(fx.mesh.userData.v, dt)
      fx.mesh.material.opacity = Math.max(0, fx.life / fx.max)
      if (fx.kind === 'dust') fx.mesh.scale.multiplyScalar(1 + dt * .55)
    }
    if (fx.life <= 0) {
      scene.remove(fx.mesh)
      fx.mesh.geometry?.dispose?.()
      fx.mesh.material?.dispose?.()
      game.effects.splice(i, 1)
    }
  }
  for (let i = game.tracers.length - 1; i >= 0; i--) {
    const t = game.tracers[i]
    t.life -= dt
    t.line.material.opacity = Math.max(0, t.life / t.max)
    if (t.life <= 0) {
      scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose()
      game.tracers.splice(i, 1)
    }
  }
}

function blockedAt(x, z, radius) {
  const b = world.bounds
  if (x < b.minX + radius || x > b.maxX - radius || z < b.minZ + radius || z > b.maxZ - radius) return true
  for (const c of world.colliders) {
    if (Math.abs(x - c.x) < c.hw + radius && Math.abs(z - c.z) < c.hd + radius) return true
  }
  return false
}

function updatePlayer(dt) {
  let forward = 0, strafe = 0
  if (game.mode === 'playing' && !game.paused && !game.over) {
    if (keys['KeyW'] || keys['ArrowUp']) forward += 1
    if (keys['KeyS'] || keys['ArrowDown']) forward -= 1
    if (keys['KeyA'] || keys['ArrowLeft']) strafe -= 1
    if (keys['KeyD'] || keys['ArrowRight']) strafe += 1
    forward -= game.move.y
    strafe += game.move.x
  }
  const mag = Math.min(1, Math.hypot(forward, strafe))
  const moving = mag > .08
  if (moving) {
    const speed = (game.sprinting && forward > .2 ? 6.35 : 4.25) * (game.aiming ? .62 : 1)
    const sin = Math.sin(game.yaw), cos = Math.cos(game.yaw)
    const dx = (-sin * forward + cos * strafe) * speed * dt
    const dz = (-cos * forward - sin * strafe) * speed * dt
    const radius = .36
    const nx = game.player.x + dx
    if (!blockedAt(nx, game.player.z, radius)) game.player.x = nx
    const nz = game.player.z + dz
    if (!blockedAt(game.player.x, nz, radius)) game.player.z = nz
    game.player.x = clamp(game.player.x, world.bounds.minX + radius, world.bounds.maxX - radius)
    game.player.z = clamp(game.player.z, world.bounds.minZ + radius, world.bounds.maxZ - radius)
    game.walkPhase += dt * (game.sprinting ? 15.2 : 10.6) * (game.aiming ? .72 : 1)
    const stepInterval = game.sprinting ? .32 : .46
    if (performance.now() - game.lastStep > stepInterval * 1000) {
      game.lastStep = performance.now()
      audio.step()
    }
  }
  // jump physics
  if (!game.grounded) {
    game.jumpV -= 13.2 * dt
    game.jumpY += game.jumpV * dt
    if (game.jumpY <= 0) {
      if (game.jumpV < -2) { game.shake = Math.max(game.shake, .16); audio.step() }
      game.jumpY = 0
      game.jumpV = 0
      game.grounded = true
    }
  }
  game.kick *= Math.exp(-dt * 11)
  game.heat *= Math.exp(-dt * 1.8)
  game.shake *= Math.exp(-dt * 7.2)
  // regeneration
  if (game.regenTimer > 0) game.regenTimer -= dt
  else if (!game.over) {
    game.health = Math.min(100, game.health + 3.2 * dt)
    game.armor = Math.min(100, game.armor + 9 * dt)
  }
  if (game.reloading) {
    game.reloadT += dt
    if (game.reloadT >= RELOAD_TIME) finishReload()
  }
  // camera/weapon feedback
  game.roll = lerp(game.roll, moving ? -strafe * .012 : 0, 1 - Math.exp(-dt * 6))
  function noop() {}
  if (moving && isTouch) noop()
}

function updateWaves(dt) {
  if (game.mode !== 'playing' || game.over || game.paused) return
  game.spawnTimer -= dt
  if (game.pendingSpawns.length && game.spawnTimer <= 0) {
    const next = game.pendingSpawns.shift()
    spawnEnemy(next)
    game.spawnTimer = .42 + Math.random() * .25
  }
  if (game.waveState === 'active') {
    let alive = 0
    for (const e of game.enemies) if (!e.dead) alive++
    if (game.pendingSpawns.length === 0 && alive === 0) waveCleared()
  } else if (game.waveState === 'clear') {
    game.nextWaveTimer -= dt
    if (game.nextWaveTimer <= 0 && game.wave < 3) startWave(game.wave)
  }
}

function updateRadar(time) {
  const ctx = dom.minimap.getContext('2d')
  const size = 256, c = size / 2, radius = 116
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.beginPath(); ctx.arc(c, c, radius, 0, TAU); ctx.clip()
  const bg = ctx.createRadialGradient(c, c, 0, c, c, radius)
  bg.addColorStop(0, 'rgba(40,68,42,.38)')
  bg.addColorStop(1, 'rgba(3,9,6,.55)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(183,240,106,.12)'
  ctx.lineWidth = 1
  for (let r = 34; r <= 102; r += 34) { ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.stroke() }
  ctx.beginPath(); ctx.moveTo(c, 10); ctx.lineTo(c, size - 10); ctx.moveTo(10, c); ctx.lineTo(size - 10, c); ctx.stroke()
  // directional cone
  const cone = ctx.createLinearGradient(c, c, c, 30)
  cone.addColorStop(0, 'rgba(183,240,106,.12)')
  cone.addColorStop(1, 'rgba(183,240,106,0)')
  ctx.fillStyle = cone
  ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c - 52, 28); ctx.lineTo(c + 52, 28); ctx.closePath(); ctx.fill()
  const sin = Math.sin(game.yaw), cos = Math.cos(game.yaw)
  const scale = 105 / 26
  for (const enemy of game.enemies) {
    if (enemy.dead) continue
    const dx = enemy.model.position.x - game.player.x
    const dz = enemy.model.position.z - game.player.z
    const right = dx * cos - dz * sin
    const forward = -dx * sin - dz * cos
    let sx = c + right * scale, sy = c - forward * scale
    const dist = Math.hypot(sx - c, sy - c)
    if (dist > radius - 8) { sx = c + (sx - c) / dist * (radius - 8); sy = c + (sy - c) / dist * (radius - 8) }
    const pulse = .65 + Math.sin(time * 4 + enemy.model.position.x) * .25
    ctx.fillStyle = `rgba(255,86,44,${pulse})`
    ctx.shadowColor = 'rgba(255,76,40,.9)'
    ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, TAU); ctx.fill()
    ctx.shadowBlur = 0
  }
  // sweep line
  const ang = time * .9 % TAU
  const grad = ctx.createLinearGradient(c, c, c + Math.sin(ang) * radius, c - Math.cos(ang) * radius)
  grad.addColorStop(0, 'rgba(183,240,106,0)')
  grad.addColorStop(1, 'rgba(183,240,106,.28)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.sin(ang) * radius, c - Math.cos(ang) * radius); ctx.stroke()
  // player
  ctx.fillStyle = '#e7f7c8'
  ctx.beginPath(); ctx.moveTo(c, c - 7); ctx.lineTo(c - 5, c + 5); ctx.lineTo(c, c + 2); ctx.lineTo(c + 5, c + 5); ctx.closePath(); ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(183,240,106,.2)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(c, c, radius, 0, TAU); ctx.stroke()
}

// ---------- Update loop ----------
let lastFrame = performance.now()
function animate(now) {
  requestAnimationFrame(animate)
  const rawDt = (now - lastFrame) / 1000
  lastFrame = now
  const dt = Math.min(.05, Math.max(.0001, rawDt))
  game.time += dt
  world.update(dt, game.time)

  if (game.mode === 'title') {
    updateIntroCamera(game.time)
  } else if (game.mode === 'playing') {
    if (!game.paused && !game.over) {
      game.missionTime += dt
      updatePlayer(dt)
      updateWaves(dt)
      updateEnemies(dt, game.time)
      fireWeapon()
      updateBullets(dt)
      updateEffects(dt)
      updateCamera(dt)
      weapon.update(dt, game.time, Math.min(1, Math.hypot(game.move.x, game.move.y) + (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] ? 1 : 0)), game.sprinting, game.aiming)
      const base = getBaseFov()
      const targetFov = game.aiming ? base - 13 : (game.sprinting ? base + 3 : base)
      if (Math.abs(camera.fov - targetFov) > .02) {
        camera.fov = lerp(camera.fov, targetFov, 1 - Math.exp(-dt * 10))
        camera.updateProjectionMatrix()
      }
      // keep crosshair spread responsive
      const spread = 7 + Math.min(20, Math.hypot(game.move.x, game.move.y) * 10) + game.heat * 8 + (game.aiming ? -3 : 0)
      dom.crosshair.style.setProperty('--spread', `${spread}px`)
      dom.crosshair.style.opacity = game.reloading ? '.4' : '.92'
      updateHUD()
      updateCompass()
      updateRadar(game.time)
    } else {
      updateCamera(dt)
      weapon.update(dt, game.time, 0, false, false)
    }
  }

  renderer.render(scene, camera)
}

// Initial title camera + UI
updateIntroCamera(game.time, true)
updateTiltUI()
updateHUD()
requestAnimationFrame(animate)

// Expose a small debugging/testing API without changing normal gameplay.
window.__NINE_LIVES__ = {
  game, start: startMission, title: showTitle, world, camera, weapon, renderer,
  spawn: spawnEnemy, end: endMission, damage: damagePlayer,
  wave: () => ({ wave: game.wave, pending: game.pendingSpawns.length, alive: game.enemies.filter(e => !e.dead).length }),
  aim: setAim,
  fire: () => { game.firing = true; fireWeapon(); game.firing = false }
}
