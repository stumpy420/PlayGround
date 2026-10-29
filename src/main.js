import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import './style.css';
import { buildWorld } from './world.js';
import { ViewModel } from './viewmodel.js';
import { EnemyManager } from './enemies.js';
import { AudioEngine } from './audio.js';

const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || innerWidth <= 820;

const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
  alpha: false,
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.75 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const gl = renderer.getContext();
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
const gpuName = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
const softwareRenderer = /swiftshader|llvmpipe|software|angle \(google, vulkan 1\.3\.0 \(swiftshader/i.test(gpuName);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(73, innerWidth / innerHeight, 0.05, 170);
camera.rotation.order = 'YXZ';
camera.position.set(0, 1.65, 17.2);
scene.add(camera);

const world = buildWorld(scene, renderer);
const viewModel = new ViewModel(camera);
const audio = new AudioEngine();
const enemies = new EnemyManager(scene, world, audio);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.62, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const refs = {
  menu: $('menu'),
  hud: $('hud'),
  touchUI: $('touchUI'),
  boot: $('boot'),
  bootBar: $('bootBar'),
  bootStatus: $('bootStatus'),
  waveNumber: $('waveNumber'),
  waveProgress: $('waveProgress'),
  enemyCount: $('enemyCount'),
  scoreValue: $('scoreValue'),
  bestValue: $('bestValue'),
  menuBest: $('menuBest'),
  menuKills: $('menuKills'),
  healthValue: $('healthValue'),
  healthFill: $('healthFill'),
  healthPanel: document.querySelector('.health-panel'),
  healthStatus: $('healthStatus'),
  ammoValue: $('ammoValue'),
  reserveValue: $('reserveValue'),
  ammoPanel: document.querySelector('.ammo-panel'),
  reloadHint: $('reloadHint'),
  reloadRing: $('reloadRing'),
  crosshair: $('crosshair'),
  hitmarker: $('hitmarker'),
  hitDirection: $('hitDirection'),
  killfeed: $('killfeed'),
  banner: $('waveBanner'),
  bannerTitle: $('bannerTitle'),
  bannerSub: $('bannerSub'),
  toast: $('toast'),
  combo: $('combo'),
  objectiveText: $('objectiveText'),
  objectiveSub: $('objectiveSub'),
  damageFlash: $('damageFlash'),
  lowHealth: $('lowHealth'),
  desktopHints: $('desktopHints'),
  pause: $('pause'),
  gameover: $('gameover'),
  briefing: $('briefing'),
  rotateHint: $('rotateHint'),
  tiltChip: $('tiltChip'),
  soundBtn: $('soundBtn'),
  menuSoundToggle: $('menuSoundToggle'),
  tiltToggle: $('tiltToggle'),
  qualityToggle: $('qualityToggle'),
  stickZone: $('stickZone'),
  stickKnob: $('stickKnob'),
  btnFire: $('btnFire'),
  btnAim: $('btnAim'),
  btnReload: $('btnReload'),
  btnJump: $('btnJump'),
  finalScore: $('finalScore'),
  finalWave: $('finalWave'),
  finalKills: $('finalKills'),
  finalAccuracy: $('finalAccuracy'),
  finalHeads: $('finalHeads'),
  newBest: $('newBest'),
  pauseWave: $('pauseWave'),
  pauseScore: $('pauseScore'),
  pauseKills: $('pauseKills'),
};

const storageKey = 'paws-of-duty-v1';
let saved = { best: 0, kills: 0, mute: false, quality: true };
try {
  saved = { ...saved, ...JSON.parse(localStorage.getItem(storageKey) || '{}') };
} catch {
  /* storage can be unavailable in private modes */
}
audio.setEnabled(!saved.mute);

const state = {
  mode: 'menu',
  started: false,
  menuTime: 0,
  elapsed: 0,
  wave: 0,
  waveTotal: 0,
  waveKilled: 0,
  spawnRemaining: 0,
  spawnTimer: 0,
  intermission: false,
  intermissionTimer: 0,
  score: 0,
  kills: 0,
  headshots: 0,
  shots: 0,
  hits: 0,
  combo: 0,
  comboTimer: 0,
  comboMultiplier: 1,
  best: Number(saved.best) || 0,
  gameOverTimer: 0,
  startedAt: 0,
  pausedFrom: 'playing',
  quality: saved.quality !== false && !softwareRenderer,
  bloomEnabled: saved.quality !== false && !softwareRenderer,
  tiltEnabled: false,
  tiltCalibrated: false,
  tiltBase: { beta: 0, gamma: 0 },
  tiltRaw: { beta: 0, gamma: 0 },
  touchAim: false,
  adsHeld: false,
  fireHeld: false,
  fireCooldown: 0,
  hitMarkerTimer: 0,
  toastTimer: 0,
  feedTimer: 0,
  bannerTimer: 0,
  shake: 0,
  shakeRot: 0,
  recoilKick: 0,
  recoilYaw: 0,
  muzzleFlash: 0,
  reloadStage: 0,
  lowHealthShown: false,
  pointerLockTried: false,
  lockGraceUntil: 0,
  scoreAtStart: 0,
  firstBlood: false,
  frameCount: 0,
  perfTime: 0,
  degraded: false,
  softwareRenderer,
  gpuName,
};

if (softwareRenderer) {
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = false;
}

const player = {
  position: new THREE.Vector3(0, 0, 18.6),
  yaw: 0,
  pitch: -0.02,
  health: 100,
  maxHealth: 100,
  ammo: 30,
  magSize: 30,
  reserve: 150,
  reloading: false,
  reloadTimer: 0,
  reloadDuration: 1.45,
  lastDamage: -20,
  jumpHeight: 0,
  jumpVelocity: 0,
  grounded: true,
  bob: 0,
  bobAmount: 0,
  moveAmount: 0,
  sprint: false,
  ads: false,
  damageFlashTimer: 0,
  deathTimer: 0,
};

const input = {
  keys: new Set(),
  move: new THREE.Vector2(),
  lookPointer: null,
  lookLast: { x: 0, y: 0 },
  mouseDragging: false,
  mouseLast: { x: 0, y: 0 },
  stickPointer: null,
  stickCenter: { x: 0, y: 0 },
  stickRadius: 42,
};

const raycaster = new THREE.Raycaster();
raycaster.far = 100;
const temp = {
  forward: new THREE.Vector3(),
  right: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  up: new THREE.Vector3(0, 1, 0),
  vec: new THREE.Vector3(),
  mat4: new THREE.Matrix4(),
};

const effects = {
  tracers: [],
  bursts: [],
  decals: [],
  shells: [],
  damageNumbers: [],
};
const particleCanvas = document.createElement('canvas');
particleCanvas.width = 64;
particleCanvas.height = 64;
{
  const ctx = particleCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 1, 32, 32, 31);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
}
const particleTexture = new THREE.CanvasTexture(particleCanvas);
particleTexture.colorSpace = THREE.SRGBColorSpace;
const shellGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.05, 6);
const shellMaterial = new THREE.MeshStandardMaterial({ color: '#d4aa5d', metalness: 0.72, roughness: 0.34 });
const decalGeometry = new THREE.CircleGeometry(0.045, 8);
const decalMaterial = new THREE.MeshBasicMaterial({ color: '#030709', transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ best: state.best, kills: state.kills, mute: audio.muted, quality: state.quality }));
  } catch {
    /* ignore */
  }
}

function fmt(value, length = 6) {
  return String(Math.max(0, Math.floor(value))).padStart(length, '0');
}

function showToast(message, duration = 1.8) {
  refs.toast.textContent = message;
  refs.toast.classList.add('show');
  state.toastTimer = duration;
}

function showBanner(kicker, title, sub, duration = 2.7) {
  const kickerEl = refs.banner.querySelector('.banner-kicker');
  if (kickerEl) kickerEl.textContent = kicker;
  refs.bannerTitle.textContent = title;
  refs.bannerSub.textContent = sub;
  refs.banner.classList.remove('show');
  void refs.banner.offsetWidth;
  refs.banner.classList.add('show');
  state.bannerTimer = duration;
}

function updateBestUI() {
  refs.bestValue.textContent = `BEST ${fmt(state.best)}`;
  refs.menuBest.textContent = fmt(state.best);
  refs.menuKills.textContent = fmt(state.kills, 3);
}

function updateSettingsUI() {
  refs.tiltToggle.setAttribute('aria-pressed', String(state.tiltEnabled));
  refs.menuSoundToggle.setAttribute('aria-pressed', String(!audio.muted));
  refs.qualityToggle.setAttribute('aria-pressed', String(state.quality));
  refs.soundBtn.classList.toggle('muted', audio.muted);
  refs.tiltChip.classList.toggle('visible', state.tiltEnabled && isTouch);
}

function setQuality(enabled) {
  state.quality = enabled;
  state.bloomEnabled = enabled;
  renderer.shadowMap.enabled = enabled;
  refs.qualityToggle.setAttribute('aria-pressed', String(enabled));
  world.moonLight.castShadow = enabled;
  showToast(enabled ? 'VISUAL EFFECTS: HIGH' : 'VISUAL EFFECTS: PERFORMANCE');
  persist();
}

function toggleSound() {
  audio.init();
  audio.setEnabled(audio.muted);
  updateSettingsUI();
  adjustSoundButton();
  persist();
}

function adjustSoundButton() {
  refs.soundBtn.setAttribute('aria-label', audio.muted ? 'Enable sound' : 'Mute sound');
}

function toggleSoundFromButton() {
  audio.init();
  audio.setMuted(!audio.muted);
  refs.soundBtn.classList.toggle('muted', audio.muted);
  refs.menuSoundToggle.setAttribute('aria-pressed', String(!audio.muted));
  persist();
}

async function toggleTilt() {
  audio.init();
  audio.ui();
  if (state.tiltEnabled) {
    state.tiltEnabled = false;
    updateSettingsUI();
    showToast('TILT AIM DISABLED');
    return;
  }
  const ok = await enableTilt();
  if (ok) showToast(isTouch ? 'TILT AIM ENABLED // HOLD DEVICE LEVEL' : 'GYRO ENABLED // TILT TO AIM');
}

async function enableTilt() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        showToast('MOTION ACCESS DENIED');
        return false;
      }
    }
    state.tiltEnabled = true;
    state.tiltCalibrated = false;
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
    updateSettingsUI();
    return true;
  } catch {
    showToast('MOTION SENSOR UNAVAILABLE');
    return false;
  }
}

function onDeviceOrientation(event) {
  if (!state.tiltEnabled) return;
  if (typeof event.beta !== 'number' || typeof event.gamma !== 'number') return;
  let beta = event.beta;
  let gamma = event.gamma;
  const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  if (Math.abs(angle) === 90) {
    const b = beta;
    beta = -gamma;
    gamma = b;
  }
  state.tiltRaw.beta = beta;
  state.tiltRaw.gamma = gamma;
  if (!state.tiltCalibrated) {
    state.tiltBase.beta = beta;
    state.tiltBase.gamma = gamma;
    state.tiltCalibrated = true;
  }
}

function calibrateTilt() {
  state.tiltBase.beta = state.tiltRaw.beta;
  state.tiltBase.gamma = state.tiltRaw.gamma;
  state.tiltCalibrated = true;
  showToast('TILT CALIBRATED');
}

function resetPlayer() {
  player.position.copy(world.playerStart);
  player.yaw = 0;
  player.pitch = -0.025;
  player.health = player.maxHealth;
  player.ammo = player.magSize;
  player.reserve = 150;
  player.reloading = false;
  player.reloadTimer = 0;
  player.lastDamage = -20;
  player.jumpHeight = 0;
  player.jumpVelocity = 0;
  player.grounded = true;
  player.bob = 0;
  player.moveAmount = 0;
  player.ads = false;
  state.adsHeld = false;
  state.touchAim = false;
  state.fireHeld = false;
  state.fireCooldown = 0;
  state.recoilKick = 0;
  state.recoilYaw = 0;
  state.tiltCalibrated = false;
  viewModel.setReload(0);
  refs.btnAim.classList.remove('pressed');
  refs.crosshair.classList.remove('ads');
}

function resetGameState() {
  state.wave = 0;
  state.waveTotal = 0;
  state.waveKilled = 0;
  state.spawnRemaining = 0;
  state.spawnTimer = 0;
  state.intermission = false;
  state.intermissionTimer = 0;
  state.score = 0;
  state.kills = 0;
  state.headshots = 0;
  state.shots = 0;
  state.hits = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.comboMultiplier = 1;
  state.gameOverTimer = 0;
  state.startedAt = performance.now();
  state.scoreAtStart = state.best;
  state.firstBlood = false;
  state.shake = 0;
  state.shakeRot = 0;
  state.lowHealthShown = false;
  refs.combo.classList.remove('show');
  refs.killfeed.innerHTML = '';
  refs.objectiveText.textContent = 'HOLD SARDINE BAY';
  refs.objectiveSub.textContent = 'Survive the mechanized mouse patrol';
  enemies.clear();
  clearEffects();
  updateHUD(true);
}

function clearEffects() {
  for (const tracer of effects.tracers) {
    scene.remove(tracer.line);
    tracer.line.geometry.dispose();
    tracer.line.material.dispose();
  }
  effects.tracers = [];
  for (const burst of effects.bursts) {
    scene.remove(burst.points);
    burst.points.geometry.dispose();
    burst.points.material.dispose();
  }
  effects.bursts = [];
  for (const decal of effects.decals) scene.remove(decal.mesh);
  effects.decals = [];
  for (const shell of effects.shells) scene.remove(shell.mesh);
  effects.shells = [];
  for (const dmg of effects.damageNumbers) dmg.el.remove();
  effects.damageNumbers = [];
}

function startGame() {
  audio.init();
  audio.ui();
  resetGameState();
  resetPlayer();
  state.mode = 'playing';
  state.started = true;
  state.menuTime = 0;
  refs.menu.classList.add('is-leaving');
  setTimeout(() => refs.menu.classList.add('hidden'), 620);
  refs.hud.classList.add('active');
  refs.hud.setAttribute('aria-hidden', 'false');
  refs.gameover.classList.add('hidden');
  refs.pause.classList.add('hidden');
  refs.briefing.classList.add('hidden');
  refs.touchUI.classList.toggle('active', isTouch);
  refs.touchUI.setAttribute('aria-hidden', String(!isTouch));
  viewModel.setVisible(true);
  refs.rotateHint.classList.toggle('visible', isTouch && innerHeight > innerWidth);
  setTimeout(() => refs.rotateHint.classList.remove('visible'), 6000);
  state.pointerLockTried = false;
  if (!isTouch) {
    setTimeout(() => {
      if (state.mode === 'playing') {
        try {
          canvas.requestPointerLock?.();
          state.pointerLockTried = true;
          state.lockGraceUntil = performance.now() + 550;
        } catch {
          /* drag-look fallback */
        }
      }
    }, 520);
  }
  beginWave();
  if (state.tiltEnabled && !state.tiltCalibrated) state.tiltCalibrated = false;
  updateSettingsUI();
}

function beginWave() {
  state.wave += 1;
  state.waveTotal = 4 + (state.wave - 1) * 2;
  state.waveKilled = 0;
  state.spawnRemaining = state.waveTotal;
  state.spawnTimer = 0.75;
  state.intermission = false;
  state.intermissionTimer = 0;
  refs.objectiveText.textContent = 'HOLD SARDINE BAY';
  refs.objectiveSub.textContent = 'Survive the mechanized mouse patrol';
  refs.waveNumber.textContent = String(state.wave).padStart(2, '0');
  updateHUD(true);
  showBanner('INCOMING', `WAVE ${String(state.wave).padStart(2, '0')}`, state.wave === 1 ? 'SARDINE BAY // NIGHT PATROL' : state.wave % 3 === 0 ? 'HEAVY HOSTILES DETECTED' : 'MORE HOSTILES INBOUND');
  audio.wave();
  if (state.wave === 2) showToast('TIP: HEADSHOTS DEAL TRIPLE DAMAGE', 2.4);
  if (state.wave === 3) showToast('BRUTE DETECTED // AIM FOR THE EYES', 2.4);
}

function spawnEnemy() {
  if (state.spawnRemaining <= 0) return;
  const index = state.waveTotal - state.spawnRemaining;
  const type = enemies.chooseType(state.wave, index);
  const candidates = world.spawnPoints
    .map((point) => ({ point, dist: point.distanceTo(player.position) }))
    .filter((entry) => entry.dist > 9)
    .sort((a, b) => a.dist - b.dist);
  const pool = candidates.length ? candidates.slice(0, Math.min(7, candidates.length)) : world.spawnPoints.map((point) => ({ point, dist: 0 }));
  const choice = pool[Math.floor(Math.random() * pool.length)];
  const point = choice.point.clone();
  point.x += (Math.random() - 0.5) * 1.4;
  point.z += (Math.random() - 0.5) * 1.4;
  world.clampToArena(point);
  const enemy = enemies.spawn(type, point);
  enemy.setVisibleHealth(true);
  state.spawnRemaining -= 1;
  state.spawnTimer = Math.max(0.38, 1.02 - state.wave * 0.06);
  audio.spawn();
  return enemy;
}

function fireShot() {
  if (state.mode !== 'playing' || player.reloading) return;
  if (state.fireCooldown > 0) return;
  if (player.ammo <= 0) {
    audio.empty();
    startReload();
    return;
  }
  state.fireCooldown = 0.108;
  player.ammo -= 1;
  state.shots += 1;
  state.muzzleFlash = 0.055;
  state.shake = Math.max(state.shake, 0.07);
  state.recoilKick += 0.012 + Math.random() * 0.007;
  state.recoilYaw += (Math.random() - 0.5) * 0.006;
  viewModel.kick(0.9 + Math.random() * 0.35);
  audio.shoot();
  if (navigator.vibrate && isTouch) navigator.vibrate(8);

  camera.getWorldDirection(temp.dir);
  const spread = player.ads ? 0.0025 : 0.011 + player.moveAmount * 0.014 + (player.sprint ? 0.013 : 0);
  temp.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
  temp.vec.set(0, 1, 0).applyQuaternion(camera.quaternion);
  temp.dir
    .addScaledVector(temp.right, (Math.random() - 0.5) * spread)
    .addScaledVector(temp.vec, (Math.random() - 0.5) * spread)
    .normalize();
  applyAimAssist(temp.dir);

  const origin = camera.position.clone();
  raycaster.set(origin, temp.dir);
  const enemyHit = enemies.raycast(raycaster);
  const worldHits = raycaster.intersectObjects(world.occluders, false);
  const wallHit = worldHits[0];
  const muzzle = viewModel.muzzle.getWorldPosition(new THREE.Vector3());
  const end = origin.clone().addScaledVector(temp.dir, 70);

  let hitEnemy = false;
  let hitPoint = null;
  if (enemyHit && (!wallHit || enemyHit.hit.distance < wallHit.distance)) {
    hitEnemy = true;
    hitPoint = enemyHit.hit.point.clone();
    const part = enemyHit.hit.object.userData;
    const headshot = Boolean(part.head);
    const damage = headshot ? 115 : 38;
    const result = enemies.damage(enemyHit.enemy, damage, headshot, hitPoint);
    state.hits += 1;
    if (result.killed) {
      onEnemyKilled(enemyHit.enemy, result, hitPoint);
    } else {
      audio.hit(headshot);
      showHitMarker(headshot);
      spawnBurst(hitPoint, headshot ? '#ffbb63' : '#8df7ff', headshot ? 14 : 8, 2.6, 0.2);
    }
    if (headshot && !result.killed) showDamageNumber(hitPoint, damage, true);
    else if (!result.killed) showDamageNumber(hitPoint, damage, false);
    spawnTracer(muzzle, hitPoint, '#ffd483');
    end.copy(hitPoint);
  } else if (wallHit) {
    hitPoint = wallHit.point.clone();
    spawnImpact(hitPoint, wallHit);
    spawnTracer(muzzle, hitPoint, '#ffd483');
    end.copy(hitPoint);
  } else {
    spawnTracer(muzzle, end, '#ffd483');
  }

  spawnShell();
  if (!hitEnemy && state.shots % 6 === 0) showToast('AIM FOR THE GLOWING EYES', 1.1);
  updateHUD();
}

function applyAimAssist(direction) {
  if (!isTouch && !player.ads) return;
  const maxAngle = isTouch ? 0.085 : 0.028;
  const origin = camera.position;
  let best = null;
  let bestScore = Infinity;
  for (const enemy of enemies.alive) {
    const target = enemy.getAimPoint();
    const to = target.clone().sub(origin);
    const distance = to.length();
    if (distance > 45) continue;
    to.normalize();
    const angle = direction.angleTo(to);
    const score = angle + (isTouch ? 0 : distance * 0.0002);
    if (angle < maxAngle && score < bestScore) {
      bestScore = score;
      best = { dir: to, distance };
    }
  }
  if (best) {
    const strength = isTouch ? 0.72 : 0.32;
    direction.lerp(best.dir, strength).normalize();
  }
}

function onEnemyKilled(enemy, result, point) {
  state.kills += 1;
  state.waveKilled += 1;
  if (result.headshot) state.headshots += 1;
  state.comboTimer = 2.35;
  state.combo += 1;
  state.comboMultiplier = Math.min(5, 1 + Math.floor(state.combo / 2) * 0.5);
  const gained = Math.round(enemy.score * (result.headshot ? 1.55 : 1) * state.comboMultiplier);
  state.score += gained;
  if (state.combo >= 2) showCombo();
  audio.hit(result.headshot);
  audio.enemyDie();
  showHitMarker(result.headshot, true);
  spawnBurst(point, result.headshot ? '#ffc566' : '#ff7b4a', 24, 4.2, 0.55);
  spawnBurst(point, '#72f4ff', 10, 3.2, 0.5);
  addKillFeed(enemy, result.headshot, gained);
  if (navigator.vibrate && isTouch) navigator.vibrate(result.headshot ? [8, 24, 12] : 12);
  if (state.score > state.best) {
    state.best = state.score;
    updateBestUI();
    persist();
  }
  state.shake = Math.max(state.shake, result.headshot ? 0.18 : 0.12);
  updateHUD();
}

function showHitMarker(headshot = false, kill = false) {
  refs.hitmarker.classList.remove('show', 'head');
  void refs.hitmarker.offsetWidth;
  if (headshot) refs.hitmarker.classList.add('head');
  refs.hitmarker.classList.add('show');
  state.hitMarkerTimer = kill ? 0.35 : 0.22;
}

function showCombo() {
  refs.combo.innerHTML = `<strong>x${state.comboMultiplier.toFixed(1).replace('.0', '')}</strong><span>${state.combo} KILL CHAIN</span>`;
  refs.combo.classList.add('show');
  state.feedTimer = 1.8;
}

function addKillFeed(enemy, headshot, gained) {
  const item = document.createElement('div');
  item.className = `feed-item${headshot ? ' head' : ''}`;
  item.innerHTML = `<span>${headshot ? 'HEADSHOT' : 'ELIMINATED'}</span><b>${enemy.def.label}</b><em>+${gained}</em>`;
  refs.killfeed.prepend(item);
  while (refs.killfeed.children.length > 4) refs.killfeed.lastElementChild.remove();
  setTimeout(() => {
    item.classList.add('out');
    setTimeout(() => item.remove(), 350);
  }, 2600);
}

function showDamageNumber(point, amount, headshot) {
  const projected = point.clone().project(camera);
  if (projected.z > 1 || projected.z < -1) return;
  const x = (projected.x * 0.5 + 0.5) * innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * innerHeight;
  const el = document.createElement('div');
  el.className = `damage-number${headshot ? ' head' : ''}`;
  el.textContent = headshot ? `CRIT ${amount}` : String(amount);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  const dmg = { el, x, y, life: 0.75, vy: -0.6 };
  effects.damageNumbers.push(dmg);
  setTimeout(() => {
    el.remove();
    const index = effects.damageNumbers.indexOf(dmg);
    if (index >= 0) effects.damageNumbers.splice(index, 1);
  }, 780);
}

function spawnTracer(from, to, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  effects.tracers.push({ line, life: 0.06 });
}

function spawnBurst(position, color, count = 10, speed = 3, size = 0.07) {
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9, Math.random() - 0.5).normalize();
    velocities.push(dir.multiplyScalar(speed * (0.35 + Math.random() * 0.9)));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    map: particleTexture,
    size: size * 1.7,
    transparent: true,
    opacity: 1,
    alphaTest: 0.01,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  effects.bursts.push({ points, velocities, life: 0.55, maxLife: 0.55 });
}

function spawnImpact(point, hit) {
  spawnBurst(point, '#ffcc7b', 12, 3.1, 0.055);
  spawnBurst(point, '#8ef6ff', 5, 2.2, 0.04);
  if (hit.face) {
    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    const mesh = new THREE.Mesh(decalGeometry, decalMaterial.clone());
    mesh.position.copy(point).addScaledVector(normal, 0.008);
    mesh.lookAt(point.clone().add(normal));
    scene.add(mesh);
    effects.decals.push({ mesh, life: 7 });
    if (effects.decals.length > 30) {
      const old = effects.decals.shift();
      scene.remove(old.mesh);
      old.mesh.material.dispose();
    }
  }
}

function spawnShell() {
  if (effects.shells.length > 9) {
    const old = effects.shells.shift();
    scene.remove(old.mesh);
  }
  const mesh = new THREE.Mesh(shellGeometry, shellMaterial);
  const muzzle = viewModel.muzzle.getWorldPosition(new THREE.Vector3());
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  mesh.position.copy(muzzle).addScaledVector(right, 0.12);
  mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  scene.add(mesh);
  effects.shells.push({
    mesh,
    velocity: new THREE.Vector3((Math.random() - 0.2) * 2.6, 1.1 + Math.random(), (Math.random() - 0.5) * 1.4),
    spin: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
    life: 1.2,
  });
}

function startReload() {
  if (player.reloading || player.ammo >= player.magSize || player.reserve <= 0 || state.mode !== 'playing') return;
  player.reloading = true;
  player.reloadTimer = 0;
  state.reloadStage = 0;
  viewModel.setReload(0);
  audio.reload('start');
  refs.ammoPanel.classList.add('reloading');
  refs.reloadHint.textContent = 'RELOADING';
  updateHUD();
}

function finishReload() {
  const needed = player.magSize - player.ammo;
  const taken = Math.min(needed, player.reserve);
  player.ammo += taken;
  player.reserve -= taken;
  player.reloading = false;
  player.reloadTimer = 0;
  viewModel.setReload(0);
  refs.ammoPanel.classList.remove('reloading');
  refs.reloadHint.innerHTML = '<kbd>R</kbd> RELOAD';
  audio.reload('end');
  updateHUD();
}

function requestJump() {
  if (state.mode !== 'playing' || !player.grounded) return;
  player.jumpVelocity = 4.3;
  player.grounded = false;
  audio.jump();
}

function applyDamage(amount, attacker) {
  if (state.mode !== 'playing') return;
  player.health = Math.max(0, player.health - amount);
  player.lastDamage = state.elapsed;
  player.damageFlashTimer = 0.5;
  state.shake = Math.max(state.shake, 0.36);
  state.recoilKick += 0.05;
  refs.damageFlash.classList.remove('flash');
  void refs.damageFlash.offsetWidth;
  refs.damageFlash.classList.add('flash');
  audio.damage();
  if (navigator.vibrate && isTouch) navigator.vibrate([18, 34, 28]);
  if (attacker) {
    const to = attacker.group.position.clone().sub(player.position);
    const angle = Math.atan2(to.x, to.z) - player.yaw;
    refs.hitDirection.style.transform = `rotate(${THREE.MathUtils.radToDeg(angle)}deg)`;
    refs.hitDirection.classList.remove('show');
    void refs.hitDirection.offsetWidth;
    refs.hitDirection.classList.add('show');
  }
  if (player.health <= 0) {
    player.health = 0;
    state.mode = 'dying';
    state.gameOverTimer = 1.15;
    audio.gameOver();
    stopFiring();
    viewModel.setVisible(false);
    releasePointerLock();
  }
  updateHUD();
}

function gameOver() {
  state.mode = 'gameover';
  state.started = false;
  refs.hud.classList.remove('active');
  refs.touchUI.classList.remove('active');
  refs.touchUI.setAttribute('aria-hidden', 'true');
  refs.gameover.classList.remove('hidden');
  refs.finalScore.textContent = fmt(state.score);
  refs.finalWave.textContent = String(state.wave).padStart(2, '0');
  refs.finalKills.textContent = fmt(state.kills, 3);
  const accuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 0;
  refs.finalAccuracy.textContent = `${accuracy}%`;
  refs.finalHeads.textContent = fmt(state.headshots, 3);
  const isNewBest = state.score > state.scoreAtStart && state.score > 0;
  refs.newBest.classList.toggle('hidden', !isNewBest);
  if (state.score > state.best) state.best = state.score;
  updateBestUI();
  persist();
  releasePointerLock();
}

function pauseGame() {
  if (state.mode !== 'playing') return;
  state.pausedFrom = state.mode;
  state.mode = 'paused';
  refs.pause.classList.remove('hidden');
  refs.pauseWave.textContent = String(state.wave).padStart(2, '0');
  refs.pauseScore.textContent = fmt(state.score);
  refs.pauseKills.textContent = fmt(state.kills, 3);
  stopFiring();
  refs.touchUI.classList.remove('active');
  releasePointerLock();
}

function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = 'playing';
  refs.pause.classList.add('hidden');
  refs.touchUI.classList.toggle('active', isTouch);
  if (!isTouch) {
    try {
      canvas.requestPointerLock?.();
      state.lockGraceUntil = performance.now() + 550;
    } catch {
      /* fallback drag */
    }
  }
  audio.init();
}

function quitToMenu() {
  state.mode = 'menu';
  state.started = false;
  refs.pause.classList.add('hidden');
  refs.gameover.classList.add('hidden');
  refs.hud.classList.remove('active');
  refs.hud.setAttribute('aria-hidden', 'true');
  refs.touchUI.classList.remove('active');
  refs.touchUI.setAttribute('aria-hidden', 'true');
  refs.menu.classList.remove('hidden', 'is-leaving');
  viewModel.setVisible(false);
  enemies.clear();
  clearEffects();
  releasePointerLock();
  resetPlayer();
  updateBestUI();
  stopFiring();
}

function releasePointerLock() {
  if (document.pointerLockElement) document.exitPointerLock?.();
}

function stopFiring() {
  state.fireHeld = false;
  refs.btnFire.classList.remove('pressed');
}

function showBriefing() {
  audio.ui();
  refs.briefing.classList.remove('hidden');
}

function closeBriefing() {
  audio.ui();
  refs.briefing.classList.add('hidden');
}

function updateHUD(force = false) {
  const hp = Math.max(0, Math.ceil(player.health));
  refs.healthValue.textContent = String(hp);
  refs.healthFill.style.width = `${clamp((hp / player.maxHealth) * 100, 0, 100)}%`;
  refs.healthPanel.classList.toggle('low', hp <= 32);
  refs.lowHealth.classList.toggle('active', hp <= 32 && state.mode === 'playing');
  let status = 'COMBAT READY';
  if (state.mode === 'dying') status = 'CRITICAL';
  else if (hp <= 32) status = 'CRITICAL // SEEK COVER';
  else if (state.elapsed - player.lastDamage < 5) status = 'REGENERATING';
  refs.healthStatus.textContent = status;
  refs.ammoValue.textContent = String(player.ammo).padStart(2, '0');
  refs.reserveValue.textContent = String(player.reserve).padStart(3, '0');
  refs.ammoPanel.classList.toggle('empty', player.ammo === 0 && !player.reloading);
  refs.scoreValue.textContent = fmt(state.score);
  refs.waveNumber.textContent = String(Math.max(1, state.wave)).padStart(2, '0');
  const remaining = state.spawnRemaining + enemies.enemies.filter((e) => !e.dead).length;
  refs.enemyCount.textContent = `${String(remaining).padStart(2, '0')} HOSTILE${remaining === 1 ? '' : 'S'}`;
  refs.waveProgress.style.width = `${state.waveTotal ? clamp((state.waveKilled / state.waveTotal) * 100, 0, 100) : 0}%`;
  if (state.intermission) {
    refs.objectiveText.textContent = 'SECTOR SECURE';
    refs.objectiveSub.textContent = 'Regroup and reload';
  } else if (state.mode === 'playing') {
    refs.objectiveText.textContent = 'HOLD SARDINE BAY';
    refs.objectiveSub.textContent = 'Survive the mechanized mouse patrol';
  }
  const reloadProgress = player.reloading ? clamp(player.reloadTimer / player.reloadDuration, 0, 1) : 0;
  refs.reloadRing.style.setProperty('--reload-p', String(reloadProgress * 100));
  if (force) updateBestUI();
}

function updateMenuCamera(dt) {
  state.menuTime += dt;
  const t = state.menuTime;
  const radius = 18.5;
  const angle = -0.7 + Math.sin(t * 0.042) * 0.24;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius + 1;
  camera.position.set(x, 5.1 + Math.sin(t * 0.15) * 0.22, z);
  camera.lookAt(0, 2.25, -2.1);
  camera.rotation.z = Math.sin(t * 0.09) * 0.004;
  camera.fov = 63;
  camera.updateProjectionMatrix();
}

function updatePlayer(dt) {
  const sprintPossible = player.grounded && !player.ads && !player.reloading;
  player.sprint = (input.keys.has('ShiftLeft') || input.keys.has('ShiftRight')) && sprintPossible && (input.move.lengthSq() > 0.2);
  const speed = player.ads ? 3.7 : player.sprint ? 7.4 : 5.15;
  let fx = 0;
  let fz = 0;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) fz += 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) fz -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) fx += 1;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) fx -= 1;
  fx += input.move.x;
  fz += -input.move.y;
  const inputLength = Math.hypot(fx, fz);
  if (inputLength > 1) {
    fx /= inputLength;
    fz /= inputLength;
  }
  player.moveAmount = Math.min(1, inputLength);
  temp.forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  temp.right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const move = temp.forward.multiplyScalar(fz).add(temp.right.multiplyScalar(fx));
  if (move.lengthSq() > 0) move.normalize();

  if (move.lengthSq() > 0.001) {
    const step = speed * dt;
    const next = player.position.clone().addScaledVector(move, step);
    resolvePlayerCollisions(next);
    player.position.copy(next);
    world.clampToArena(player.position);
    player.bob += dt * (player.sprint ? 13 : 9);
  }
  player.bobAmount += (player.moveAmount - player.bobAmount) * Math.min(1, dt * 8);

  if (!player.grounded) {
    player.jumpVelocity -= 11.5 * dt;
    player.jumpHeight += player.jumpVelocity * dt;
    if (player.jumpHeight <= 0) {
      player.jumpHeight = 0;
      player.jumpVelocity = 0;
      player.grounded = true;
    }
  }

  // Soft separation from enemies
  for (const enemy of enemies.alive) {
    const dx = player.position.x - enemy.group.position.x;
    const dz = player.position.z - enemy.group.position.z;
    const dist = Math.hypot(dx, dz);
    const min = 0.45 + enemy.radius;
    if (dist > 0.001 && dist < min) {
      const push = (min - dist) * 0.55;
      player.position.x += (dx / dist) * push;
      player.position.z += (dz / dist) * push;
    }
  }

  // Tilt aim is rate-based and optional on top of touch drag / mouse look.
  if (state.tiltEnabled && state.tiltCalibrated && state.mode === 'playing') {
    const roll = clamp((state.tiltRaw.gamma - state.tiltBase.gamma) / 24, -1, 1);
    const forwardTilt = clamp((state.tiltRaw.beta - state.tiltBase.beta) / 26, -1, 1);
    if (Math.abs(roll) > 0.08) player.yaw -= roll * 1.65 * dt;
    if (Math.abs(forwardTilt) > 0.08) player.pitch -= forwardTilt * 1.05 * dt;
    player.pitch = clamp(player.pitch, -1.34, 1.34);
  }

  state.recoilKick *= Math.exp(-dt * 9);
  state.recoilYaw *= Math.exp(-dt * 8);
  state.shake = Math.max(0, state.shake - dt * 1.8);

  if (state.fireCooldown > 0) state.fireCooldown -= dt;
  if (player.reloading) {
    player.reloadTimer += dt;
    const progress = clamp(player.reloadTimer / player.reloadDuration, 0, 1);
    viewModel.setReload(progress);
    if (state.reloadStage === 0 && progress > 0.2) {
      state.reloadStage = 1;
      audio.reload('mag');
    }
    if (progress >= 1) finishReload();
  }

  const wantAds = (state.adsHeld || state.touchAim) && state.mode === 'playing';
  player.ads = wantAds;
  refs.crosshair.classList.toggle('ads', wantAds);

  if (state.fireHeld && !player.reloading && state.fireCooldown <= 0) fireShot();

  // Health regen
  if (state.mode === 'playing' && state.elapsed - player.lastDamage > 5 && player.health < player.maxHealth) {
    player.health = Math.min(player.maxHealth, player.health + 8.5 * dt);
  }

  camera.position.set(
    player.position.x + Math.sin(player.bob) * 0.015 * player.bobAmount,
    1.64 + player.jumpHeight + Math.abs(Math.cos(player.bob)) * 0.032 * player.bobAmount,
    player.position.z + Math.cos(player.bob * 0.5) * 0.009 * player.bobAmount
  );
  const shakeX = state.shake * (Math.random() - 0.5) * 0.07;
  const shakeY = state.shake * (Math.random() - 0.5) * 0.07;
  camera.position.x += shakeX;
  camera.position.y += shakeY;
  camera.rotation.y = player.yaw + state.recoilYaw + state.shake * (Math.random() - 0.5) * 0.015;
  camera.rotation.x = player.pitch + state.recoilKick + state.shake * (Math.random() - 0.5) * 0.015;
  camera.rotation.z = (state.shakeRot = Math.sin(player.bob) * 0.0022 * player.bobAmount) + state.shake * (Math.random() - 0.5) * 0.01;
  const targetFov = player.ads ? 53 : player.sprint ? 78 : 73;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 10);
  if (Math.abs(camera.fov - targetFov) > 0.01) camera.updateProjectionMatrix();

  const spread = player.ads ? 2 : 4 + player.moveAmount * 5 + state.shake * 16;
  refs.crosshair.style.setProperty('--spread', `${spread.toFixed(1)}px`);

  viewModel.update(dt, {
    moveAmount: player.bobAmount,
    ads: player.ads,
    time: state.elapsed,
    sprint: player.sprint && player.reloading === false,
  });

  state.adsHeld = input.keys.has('ControlLeft') ? true : state.adsHeld;
}

function resolvePlayerCollisions(pos) {
  const radius = 0.38;
  for (const c of world.colliders) {
    if (pos.x + radius > c.minX && pos.x - radius < c.maxX && pos.z + radius > c.minZ && pos.z - radius < c.maxZ) {
      const overlapLeft = pos.x + radius - c.minX;
      const overlapRight = c.maxX - (pos.x - radius);
      const overlapFront = pos.z + radius - c.minZ;
      const overlapBack = c.maxZ - (pos.z - radius);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack);
      if (minOverlap === overlapLeft) pos.x = c.minX - radius;
      else if (minOverlap === overlapRight) pos.x = c.maxX + radius;
      else if (minOverlap === overlapFront) pos.z = c.minZ - radius;
      else pos.z = c.maxZ + radius;
    }
  }
}

function updateEffects(dt) {
  for (let i = effects.tracers.length - 1; i >= 0; i -= 1) {
    const tracer = effects.tracers[i];
    tracer.life -= dt;
    tracer.line.material.opacity = Math.max(0, tracer.life / 0.06) * 0.85;
    if (tracer.life <= 0) {
      scene.remove(tracer.line);
      tracer.line.geometry.dispose();
      tracer.line.material.dispose();
      effects.tracers.splice(i, 1);
    }
  }
  for (let i = effects.bursts.length - 1; i >= 0; i -= 1) {
    const burst = effects.bursts[i];
    burst.life -= dt;
    const positions = burst.points.geometry.attributes.position.array;
    for (let j = 0; j < burst.velocities.length; j += 1) {
      const vel = burst.velocities[j];
      vel.y -= 7.8 * dt;
      positions[j * 3] += vel.x * dt;
      positions[j * 3 + 1] += vel.y * dt;
      positions[j * 3 + 2] += vel.z * dt;
    }
    burst.points.geometry.attributes.position.needsUpdate = true;
    burst.points.material.opacity = Math.max(0, burst.life / burst.maxLife);
    if (burst.life <= 0) {
      scene.remove(burst.points);
      burst.points.geometry.dispose();
      burst.points.material.dispose();
      effects.bursts.splice(i, 1);
    }
  }
  for (let i = effects.decals.length - 1; i >= 0; i -= 1) {
    const decal = effects.decals[i];
    decal.life -= dt;
    if (decal.life < 1) decal.mesh.material.opacity = decal.life * 0.75;
    if (decal.life <= 0) {
      scene.remove(decal.mesh);
      decal.mesh.material.dispose();
      effects.decals.splice(i, 1);
    }
  }
  for (let i = effects.shells.length - 1; i >= 0; i -= 1) {
    const shell = effects.shells[i];
    shell.life -= dt;
    shell.velocity.y -= 8.4 * dt;
    shell.mesh.position.addScaledVector(shell.velocity, dt);
    shell.mesh.rotation.x += shell.spin.x * dt;
    shell.mesh.rotation.y += shell.spin.y * dt;
    shell.mesh.rotation.z += shell.spin.z * dt;
    if (shell.mesh.position.y < 0.02) {
      shell.mesh.position.y = 0.02;
      shell.velocity.y *= -0.25;
      shell.velocity.x *= 0.7;
      shell.velocity.z *= 0.7;
    }
    if (shell.life <= 0) {
      scene.remove(shell.mesh);
      effects.shells.splice(i, 1);
    }
  }
  for (let i = effects.damageNumbers.length - 1; i >= 0; i -= 1) {
    const dmg = effects.damageNumbers[i];
    dmg.life -= dt;
    dmg.y += dmg.vy * dt * 42;
    dmg.el.style.top = `${dmg.y}px`;
    if (dmg.life <= 0) dmg.el.style.opacity = '0';
  }
}

function updatePlaying(dt) {
  state.elapsed += dt;
  updatePlayer(dt);

  if (state.mode === 'dying') {
    state.gameOverTimer -= dt;
    if (state.gameOverTimer <= 0) gameOver();
  }

  if (state.spawnRemaining > 0) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) spawnEnemy();
  }

  const events = enemies.update(dt, player.position, camera);
  for (const event of events) {
    if (event.type === 'attack') applyDamage(event.damage, event.enemy);
  }

  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.combo = 0;
      state.comboMultiplier = 1;
      refs.combo.classList.remove('show');
    }
  }

  if (state.mode === 'playing' && state.spawnRemaining === 0 && enemies.enemies.length === 0 && !state.intermission) {
    state.intermission = true;
    state.intermissionTimer = 4.2;
    state.score += 250 + state.wave * 75;
    player.health = Math.min(player.maxHealth, player.health + 26);
    player.reserve = Math.min(240, player.reserve + 60);
    audio.waveClear();
    showBanner('SECTOR SECURE', `WAVE ${String(state.wave).padStart(2, '0')} CLEARED`, `BONUS +${250 + state.wave * 75} // VITALS RESTORED`, 3.2);
    refs.objectiveText.textContent = 'SECTOR SECURE';
    refs.objectiveSub.textContent = 'Regroup and reload';
    updateHUD();
  }

  if (state.intermission) {
    state.intermissionTimer -= dt;
    if (state.intermissionTimer <= 0) beginWave();
  }

  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) refs.toast.classList.remove('show');
  }
  if (state.hitMarkerTimer > 0) {
    state.hitMarkerTimer -= dt;
    if (state.hitMarkerTimer <= 0) refs.hitmarker.classList.remove('show', 'head');
  }
  if (state.feedTimer > 0) {
    state.feedTimer -= dt;
    if (state.feedTimer <= 0) refs.combo.classList.remove('show');
  }
  if (player.damageFlashTimer > 0) player.damageFlashTimer -= dt;
  updateHUD();
}

function updateMenu(dt) {
  updateMenuCamera(dt);
  state.elapsed += dt;
  world.update(dt, state.elapsed);
}

function animate() {
  requestAnimationFrame(animate);
  const rawDt = Math.min(0.05, clock.getDelta());
  const dt = Math.min(rawDt, 0.033);
  state.frameCount += 1;
  if (state.mode === 'menu') {
    updateMenu(dt);
  } else if (state.mode === 'playing' || state.mode === 'dying') {
    updatePlaying(dt);
    world.update(dt, state.elapsed);
    updateEffects(dt);
  } else if (state.mode === 'paused' || state.mode === 'gameover') {
    updateEffects(dt);
    world.update(dt, state.elapsed);
  }
  if (state.quality && state.bloomEnabled) composer.render();
  else renderer.render(scene, camera);
  monitorPerformance(rawDt);
}

function monitorPerformance(dt) {
  if (state.degraded || state.mode !== 'playing') return;
  state.perfTime += dt;
  if (state.perfTime < 4) return;
  const fps = state.frameCount / 4;
  state.frameCount = 0;
  state.perfTime = 0;
  if (fps < 26 && !isTouch) {
    state.degraded = true;
    renderer.setPixelRatio(1);
    bloom.strength = 0.3;
  }
}

const clock = new THREE.Clock();

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

function onKeyDown(event) {
  if (event.repeat) {
    if (['Space'].includes(event.code)) event.preventDefault();
    return;
  }
  input.keys.add(event.code);
  if (event.code === 'Escape') {
    if (state.mode === 'playing') pauseGame();
    else if (state.mode === 'paused') resumeGame();
    return;
  }
  if (state.mode !== 'playing') return;
  if (event.code === 'KeyR') startReload();
  if (event.code === 'Space') {
    requestJump();
    event.preventDefault();
  }
  if (event.code === 'KeyM') toggleSoundFromButton();
  if (event.code === 'KeyT') toggleTilt();
  if (event.code === 'KeyF') toggleFullscreen();
}

function onKeyUp(event) {
  input.keys.delete(event.code);
}

function onMouseDown(event) {
  if (state.mode !== 'playing') return;
  if (event.button === 0 && event.target === canvas) {
    if (!document.pointerLockElement) {
      state.mouseDragging = true;
      input.mouseLast.x = event.clientX;
      input.mouseLast.y = event.clientY;
      if (!isTouch) {
        try {
          canvas.requestPointerLock?.();
        } catch {
          /* fallback drag */
        }
      }
    }
    state.fireHeld = true;
    refs.btnFire.classList.add('pressed');
    audio.init();
  }
  if (event.button === 2) {
    state.adsHeld = true;
  }
}

function onMouseUp(event) {
  if (event.button === 0) {
    state.mouseDragging = false;
    stopFiring();
  }
  if (event.button === 2) state.adsHeld = false;
}

function onMouseMove(event) {
  if (state.mode !== 'playing') return;
  if (document.pointerLockElement) {
    if (performance.now() < state.lockGraceUntil) return;
    applyLookDelta(event.movementX, event.movementY, 0.0021);
  } else if (state.mouseDragging) {
    const dx = event.clientX - input.mouseLast.x;
    const dy = event.clientY - input.mouseLast.y;
    input.mouseLast.x = event.clientX;
    input.mouseLast.y = event.clientY;
    applyLookDelta(dx, dy, 0.0035);
  }
}

function applyLookDelta(dx, dy, sensitivity) {
  const adsFactor = player.ads ? 0.62 : 1;
  player.yaw -= dx * sensitivity * adsFactor;
  player.pitch -= dy * sensitivity * adsFactor;
  player.pitch = clamp(player.pitch, -1.34, 1.34);
}

function onCanvasPointerDown(event) {
  if (event.pointerType !== 'touch' || state.mode !== 'playing') return;
  if (input.lookPointer !== null) return;
  input.lookPointer = event.pointerId;
  input.lookLast.x = event.clientX;
  input.lookLast.y = event.clientY;
  canvas.setPointerCapture?.(event.pointerId);
}

function onCanvasPointerMove(event) {
  if (event.pointerType !== 'touch' || input.lookPointer !== event.pointerId || state.mode !== 'playing') return;
  const dx = event.clientX - input.lookLast.x;
  const dy = event.clientY - input.lookLast.y;
  input.lookLast.x = event.clientX;
  input.lookLast.y = event.clientY;
  applyLookDelta(dx, dy, 0.0041);
}

function onCanvasPointerUp(event) {
  if (input.lookPointer === event.pointerId) input.lookPointer = null;
}

function setupStick() {
  const zone = refs.stickZone;
  const knob = refs.stickKnob;
  const reset = () => {
    input.stickPointer = null;
    input.move.set(0, 0);
    knob.style.transform = 'translate(-50%, -50%)';
  };
  zone.addEventListener('pointerdown', (event) => {
    if (state.mode !== 'playing') return;
    event.preventDefault();
    audio.init();
    input.stickPointer = event.pointerId;
    const rect = zone.getBoundingClientRect();
    input.stickCenter.x = rect.left + rect.width / 2;
    input.stickCenter.y = rect.top + rect.height / 2;
    input.stickRadius = rect.width * 0.33;
    zone.setPointerCapture?.(event.pointerId);
  });
  zone.addEventListener('pointermove', (event) => {
    if (input.stickPointer !== event.pointerId) return;
    event.preventDefault();
    let dx = event.clientX - input.stickCenter.x;
    let dy = event.clientY - input.stickCenter.y;
    const length = Math.hypot(dx, dy);
    const max = input.stickRadius;
    if (length > max) {
      dx = (dx / length) * max;
      dy = (dy / length) * max;
    }
    input.move.set(dx / max, dy / max);
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  });
  zone.addEventListener('pointerup', reset);
  zone.addEventListener('pointercancel', reset);
  zone.addEventListener('lostpointercapture', reset);
}

function setupTouchButtons() {
  const fire = refs.btnFire;
  fire.addEventListener('pointerdown', (event) => {
    if (state.mode !== 'playing') return;
    event.preventDefault();
    event.stopPropagation();
    audio.init();
    state.fireHeld = true;
    fire.classList.add('pressed');
    fire.setPointerCapture?.(event.pointerId);
  });
  const endFire = (event) => {
    event.preventDefault();
    state.fireHeld = false;
    fire.classList.remove('pressed');
  };
  fire.addEventListener('pointerup', endFire);
  fire.addEventListener('pointercancel', endFire);
  fire.addEventListener('lostpointercapture', endFire);

  refs.btnReload.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    audio.init();
    startReload();
  });
  refs.btnJump.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    audio.init();
    requestJump();
  });
  refs.btnAim.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    audio.init();
    state.touchAim = !state.touchAim;
    refs.btnAim.classList.toggle('pressed', state.touchAim);
  });
}

function setupUI() {
  $('startBtn').addEventListener('click', () => {
    startGame();
    if (state.tiltEnabled && isTouch) state.tiltCalibrated = false;
  });
  $('briefingBtn').addEventListener('click', showBriefing);
  $('menuSoundToggle').addEventListener('click', toggleSound);
  refs.soundBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleSoundFromButton();
  });
  refs.tiltToggle.addEventListener('click', toggleTilt);
  refs.qualityToggle.addEventListener('click', () => setQuality(!state.quality));
  $('pauseBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    pauseGame();
  });
  $('resumeBtn').addEventListener('click', resumeGame);
  $('resumeTiltBtn').addEventListener('click', async () => {
    if (!state.tiltEnabled) await toggleTilt();
    else calibrateTilt();
  });
  $('quitBtn').addEventListener('click', quitToMenu);
  $('redeployBtn').addEventListener('click', startGame);
  $('menuBtn').addEventListener('click', quitToMenu);
  document.querySelectorAll('[data-close="briefing"]').forEach((el) => el.addEventListener('click', closeBriefing));
  $('briefing').addEventListener('click', (event) => {
    if (event.target === refs.briefing) closeBriefing();
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  canvas.addEventListener('pointerdown', onCanvasPointerDown);
  canvas.addEventListener('pointermove', onCanvasPointerMove);
  canvas.addEventListener('pointerup', onCanvasPointerUp);
  canvas.addEventListener('pointercancel', onCanvasPointerUp);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement) state.lockGraceUntil = performance.now() + 550;
    if (!document.pointerLockElement && state.mode === 'playing' && !isTouch) {
      state.mouseDragging = false;
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'playing') pauseGame();
  });

  setupStick();
  setupTouchButtons();
  adjustSoundButton();
  updateSettingsUI();
  updateBestUI();

  if (isTouch) {
    refs.desktopHints.style.display = 'none';
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 180));
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

function onResize() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.75 : 2));
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  refs.rotateHint.classList.toggle('visible', isTouch && h > w && state.mode === 'playing');
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function boot() {
  setupUI();
  if (softwareRenderer) {
    viewModel.setVisible(true);
    renderer.compile(scene, camera);
    viewModel.setVisible(false);
  }
  let progress = 0;
  const steps = ['CALIBRATING WHISKERS', 'LOADING FISH-47', 'WAKING THE MOUSE PATROL', 'UPLINK READY'];
  const timer = setInterval(() => {
    progress += 1;
    refs.bootBar.style.width = `${Math.min(100, progress * 28)}%`;
    refs.bootStatus.textContent = steps[Math.min(steps.length - 1, Math.floor(progress / 1.1))];
    if (progress >= 4) {
      clearInterval(timer);
      setTimeout(() => {
        refs.boot.classList.add('done');
        document.body.dataset.gameState = 'menu';
        window.__pawsReady = true;
      }, 280);
    }
  }, 150);

  animate();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  window.__pawsGame = {
    start: startGame,
    pause: pauseGame,
    resume: resumeGame,
    quit: quitToMenu,
    get state() {
      return {
        mode: state.mode,
        wave: state.wave,
        score: state.score,
        kills: state.kills,
        remaining: state.spawnRemaining + enemies.enemies.length,
        health: player.health,
        ammo: player.ammo,
        position: player.position.toArray(),
      };
    },
    setPosition(x, z) {
      player.position.x = x;
      player.position.z = z;
      world.clampToArena(player.position);
    },
    spawn(type = 'grunt', x = 0, z = -10) {
      return enemies.spawn(type, new THREE.Vector3(x, 0, z));
    },
    damagePlayer(amount = 20) {
      applyDamage(amount, enemies.alive[0] || null);
    },
    fire: fireShot,
    setQuality,
    get quality() { return state.quality; },
    get gpuName() { return gpuName; },
    enemies,
    scene,
    camera,
    renderer,
    world,
    player,
  };
}

boot();

window.addEventListener('error', (event) => {
  if (state.mode === 'menu') {
    refs.bootStatus.textContent = 'SYSTEM FAULT // RETRYING';
    console.error(event.error || event.message);
  }
  document.body.dataset.lastError = String(event.message || event.error || 'error');
});
