import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildWorld } from './world.js';
import { CatManager } from './cats.js';
import { Weapon } from './weapon.js';
import { Effects } from './effects.js';
import { Controls } from './controls.js';
import { GameAudio } from './audio.js';
import { radialTexture } from './textures.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = (n, l = 2) => String(n).padStart(l, '0');
const fmt = n => Math.round(n).toLocaleString('en-US');

const canvas = $('game');
const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || window.innerWidth < 850;

let quality = localStorage.getItem('cats-quality');
if (!quality || !['high', 'medium', 'low'].includes(quality)) quality = isTouch ? 'medium' : 'high';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.55 : 1));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc98b62, 58, 200);

const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.03, 420);
camera.rotation.order = 'YXZ';
scene.add(camera);

const audio = new GameAudio();
const world = buildWorld(scene, renderer, quality === 'low' ? 'low' : 'high');

const glInfo = (() => {
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
  } catch { return ''; }
})();
const softwareRenderer = /swiftshader|llvmpipe|software|basic render/i.test(glInfo);

if (quality !== 'low' && !softwareRenderer) {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    const envSky = world.sky.clone();
    envSky.position.set(0, 0, 0);
    envScene.add(envSky);
    const envRT = pmrem.fromScene(envScene, 0.03);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.7;
    envSky.material.dispose();
    pmrem.dispose();
  } catch (err) {
    console.warn('Environment map unavailable', err);
  }
}
const effects = new Effects(scene, quality);
const weapon = new Weapon(camera);
weapon.root.visible = false;

const player = {
  pos: new THREE.Vector3(0, 0, 21.5),
  velY: 0,
  onGround: true,
  eye: 1.68,
  radius: 0.42,
  walkSpeed: 5.9,
  sprintSpeed: 8.4,
  bob: 0,
  stepPhase: 0,
  health: 100,
  lastDamage: -100,
  shake: 0
};

const game = {
  mode: 'menu',
  time: 0,
  wave: 0,
  waveTotal: 0,
  waveKilled: 0,
  spawnRemaining: 0,
  spawnTimer: 0,
  maxConcurrent: 4,
  intermission: 0,
  score: 0,
  kills: 0,
  streak: 0,
  ammo: 30,
  magSize: 30,
  reserve: 180,
  grenades: 2,
  grenadeCooldown: 0,
  reloading: false,
  lastFire: -10,
  lastEnemyShot: 0,
  playerBullets: [],
  enemyBullets: [],
  grenadesActive: [],
  toastTimer: null
};

let menuTime = 0;
let currentFov = 76;
let composer = null;
let renderPass = null;
let bloomPass = null;
let outputPass = null;
let composerEnabled = quality !== 'low';

function makeComposer() {
  if (window.innerWidth < 10) return;
  composer = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), quality === 'high' ? 0.4 : 0.34, 0.5, 0.86);
  outputPass = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.55 : 1));
  composerEnabled = quality !== 'low';
}

function disposeComposer() {
  if (!composer) return;
  composer.passes.forEach(p => { if (p.dispose) p.dispose(); });
  composer.renderTarget1?.dispose();
  composer.renderTarget2?.dispose();
  composer = null;
}

makeComposer();

const catManager = new CatManager(scene, world, {
  onShoot(enemy, muzzlePos, dir) {
    spawnEnemyBullet(enemy, muzzlePos, dir);
    audio.enemyShot();
  },
  onKill(enemy, head, point) {
    onEnemyKilled(enemy, head, point);
  },
  onDamage(enemy, dealt, head, point) {
    showDamageNumber(point, dealt, head);
    effects.furBurst(point, enemy.typeData.furs[0] ? new THREE.Color(enemy.typeData.furs[0]).getHex() : 0xc98c4a);
    audio.hit(head);
    showHitmarker(false, head);
  },
  onSpawn(enemy) {
    effects.puff(enemy.position.clone().setY(0.5), { color: 0xe8cba6, size: 1.1, life: 0.55, opacity: 0.42, rise: 0.5 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 20), new THREE.MeshBasicMaterial({ color: 0xff9a5a, transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(enemy.position).setY(0.06);
    scene.add(ring);
    const start = performance.now();
    const anim = () => {
      const k = (performance.now() - start) / 700;
      if (k >= 1) { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); return; }
      ring.scale.setScalar(1 + k * 4);
      ring.material.opacity = 0.7 * (1 - k);
      requestAnimationFrame(anim);
    };
    anim();
  }
});

const controls = new Controls({
  canvas,
  callbacks: {
    onPause: () => togglePause(),
    canLockPointer: () => game.mode === 'playing',
    onTilt: (text, on) => {
      showToast(text);
      syncTiltUI(on);
    }
  }
});

const hud = {
  wave: $('waveNum'), enemy: $('enemyCount'), score: $('scoreNum'),
  progress: $('waveProgress'), healthFill: $('healthFill'), healthNum: $('healthNum'),
  status: $('statusText'), healthRow: document.querySelector('.health-row'),
  statusLine: document.querySelector('.status-line'),
  ammoMag: $('ammoMag'), ammoReserve: $('ammoReserve'), ammoDots: $('ammoDots'),
  reload: $('reloadState'), grenade: $('grenadeCount'), grenadePill: $('grenadePill'), grenadeRing: $('grenadeRing'),
  streak: $('streakNum'), streakBonus: $('streakBonus'), streakCard: $('streakCard'),
  killfeed: $('killfeed'), crosshair: $('crosshair'), hitmarker: $('hitmarker'),
  banner: $('waveBanner'), damageNumbers: $('damageNumbers'), toast: $('toast'),
  compassTrack: $('compassTrack'), compassDir: $('compassDir'), compassDeg: $('compassDeg'),
  minimap: $('minimap'), minimapSector: $('minimapSector'),
  damageFlash: $('damageFlash'), healGlow: $('healGlow')
};

/* ---------------- HUD plumbing ---------------- */
for (let i = 0; i < game.magSize; i++) {
  const d = document.createElement('i');
  hud.ammoDots.appendChild(d);
}
const compassLabels = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
for (let deg = -180; deg <= 540; deg += 10) {
  const t = document.createElement('div');
  const norm = ((deg % 360) + 360) % 360;
  const major = norm % 45 === 0;
  t.className = 'compass-tick' + (major ? ' major' : '');
  t.style.position = 'absolute';
  t.style.left = `${deg * 2}px`;
  if (major) {
    const span = document.createElement('span');
    span.textContent = compassLabels[norm] || '';
    t.appendChild(span);
  }
  hud.compassTrack.appendChild(t);
}

const minimapStatic = document.createElement('canvas');
minimapStatic.width = minimapStatic.height = 220;
(function drawMinimapStatic() {
  const ctx = minimapStatic.getContext('2d');
  ctx.fillStyle = '#102018';
  ctx.fillRect(0, 0, 220, 220);
  ctx.strokeStyle = 'rgba(190,215,165,.16)';
  ctx.lineWidth = 1;
  for (let i = 20; i < 220; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 220); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(220, i); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(150,175,130,.13)';
  ctx.fillRect(8, 8, 204, 204);
  ctx.strokeStyle = 'rgba(255,177,59,.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 204, 204);
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.strokeRect(30, 30, 160, 160);
  const sx = 220 / 66, sz = 220 / 66;
  ctx.fillStyle = 'rgba(160,180,145,.42)';
  for (const r of world.colliders) {
    const x = (r.minX / 66 + 0.5) * 220;
    const y = (r.minZ / 66 + 0.5) * 220;
    const w = (r.maxX - r.minX) * sx;
    const h = (r.maxZ - r.minZ) * sz;
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = 'rgba(255,107,44,.35)';
  ctx.fillRect(101, 8, 18, 8);
  ctx.fillStyle = 'rgba(255,177,59,.18)';
  ctx.fillRect(98, 195, 24, 24);
  ctx.strokeStyle = 'rgba(255,177,59,.6)';
  ctx.beginPath(); ctx.arc(110, 110, 3, 0, Math.PI * 2); ctx.stroke();
})();

function updateMinimap() {
  const ctx = hud.minimap.getContext('2d');
  ctx.clearRect(0, 0, 220, 220);
  ctx.drawImage(minimapStatic, 0, 0);
  const sx = 220 / 66, sz = 220 / 66;
  for (const e of catManager.enemies) {
    if (e.dead) continue;
    const x = (e.position.x / 66 + 0.5) * 220;
    const y = (e.position.z / 66 + 0.5) * 220;
    const pulse = 1 + Math.sin(game.time * 5 + e.bobSeed) * 0.25;
    ctx.fillStyle = e.type === 'heavy' ? 'rgba(255,80,50,.22)' : 'rgba(255,80,50,.16)';
    ctx.beginPath(); ctx.arc(x, y, 5.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6248';
    ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
  }
  const px = (player.pos.x / 66 + 0.5) * 220;
  const py = (player.pos.z / 66 + 0.5) * 220;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-controls.yaw);
  ctx.fillStyle = '#ffe2a2';
  ctx.shadowColor = '#ffb13b';
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.moveTo(0, -6.5);
  ctx.lineTo(4.6, 4.8);
  ctx.lineTo(0, 2.5);
  ctx.lineTo(-4.6, 4.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function updateCompass() {
  const heading = ((-controls.yaw * 180 / Math.PI) % 360 + 360) % 360;
  hud.compassTrack.style.transform = `translateX(${-heading * 2}px)`;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(heading / 45) % 8;
  hud.compassDir.textContent = dirs[idx];
  hud.compassDeg.textContent = pad(Math.round(heading) % 360, 3);
}

function updateHUD() {
  hud.wave.textContent = pad(game.wave);
  const remaining = catManager.aliveCount + game.spawnRemaining;
  hud.enemy.textContent = pad(remaining);
  hud.score.textContent = fmt(game.score);
  const progress = game.waveTotal ? game.waveKilled / game.waveTotal : 0;
  hud.progress.style.width = `${clamp(progress * 100, 0, 100)}%`;

  const hp = clamp(player.health, 0, 100);
  hud.healthFill.style.width = `${hp}%`;
  hud.healthNum.textContent = Math.round(hp);
  hud.healthRow.classList.toggle('low', hp < 34);
  hud.statusLine.classList.toggle('hurt', hp < 60 || game.time - player.lastDamage < 4);
  hud.status.textContent = hp > 99 ? 'NINE LIVES INTACT' : hp > 60 ? 'MINOR SCRATCHES' : hp > 30 ? 'WHISKERS BRUISED' : hp > 0 ? 'CRITICAL — FIND COVER' : 'OUT OF LIVES';

  hud.ammoMag.textContent = pad(game.ammo);
  hud.ammoMag.classList.toggle('low', game.ammo <= 7);
  hud.ammoReserve.textContent = game.reserve;
  const dots = hud.ammoDots.children;
  for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('spent', i >= game.ammo);
  hud.grenade.textContent = game.grenades;
  hud.grenadePill.style.opacity = game.grenades > 0 ? '1' : '.45';
  hud.reload.textContent = game.reloading ? 'RELOADING' : game.ammo === 0 ? 'EMPTY' : 'READY';
  hud.reload.classList.toggle('active', game.reloading);
  hud.streak.textContent = game.streak;
  const mult = 1 + Math.min(4, Math.floor(game.streak / 3)) * 0.5;
  hud.streakBonus.textContent = game.streak >= 3 ? `×${mult.toFixed(1)} PAW BONUS` : 'NO BONUS';
  hud.streakCard.classList.toggle('hot', game.streak >= 6);
  const cooldownPct = game.grenadeCooldown > 0 ? (1 - game.grenadeCooldown / 7.5) * 100 : 100;
  hud.grenadeRing.style.setProperty('--cd', `${cooldownPct}%`);
  const firing = game.time - game.lastFire < 0.09;
  hud.crosshair.classList.toggle('firing', firing);
  hud.crosshair.classList.toggle('aiming', controls.aiming);
  hud.minimapSector.textContent = game.wave >= 5 ? 'SECTOR D-9 / HOT' : 'SECTOR D-9';
}

function showHitmarker(kill, head = false) {
  const hm = hud.hitmarker;
  hm.classList.remove('show', 'kill');
  void hm.offsetWidth;
  hm.classList.add('show');
  if (kill) hm.classList.add('kill');
}

function showDamageNumber(point, dealt, head) {
  if (!point) return;
  const p = point.clone().project(camera);
  if (p.z > 1) return;
  const x = (p.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-p.y * 0.5 + 0.5) * window.innerHeight;
  const el = document.createElement('div');
  el.className = 'dmg-num' + (head ? ' head' : '');
  el.textContent = dealt;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  hud.damageNumbers.appendChild(el);
  setTimeout(() => el.remove(), 760);
}

function showKillfeed(enemy, head) {
  const names = ['MITTENS', 'SIR POUNCE', 'TUNA THIEF', 'BEANS', 'MOCHI', 'CLAW', 'PICKLES', 'NIBBLES', 'FANG', 'SARDINE'];
  const name = names[(Math.random() * names.length) | 0];
  const type = enemy.type === 'heavy' ? 'HEAVY CLAW' : enemy.type === 'scout' ? 'SCOUT KITTY' : 'FELINE GRUNT';
  const entry = document.createElement('div');
  entry.className = 'kill-entry';
  entry.innerHTML = `<span class="kf-you">CAPT. WHISKERS</span><span class="kf-icon">▸</span><span>${name}</span><span class="kf-kitty">${type}</span>${head ? '<span class="kf-hs">HEADSHOT</span>' : ''}`;
  hud.killfeed.prepend(entry);
  while (hud.killfeed.children.length > 4) hud.killfeed.lastChild.remove();
  setTimeout(() => entry.remove(), 3900);
}

function showBanner(kicker, title, sub, ms = 2200) {
  hud.banner.querySelector('.wave-kicker').textContent = kicker;
  hud.banner.querySelector('.wave-title').textContent = title;
  hud.banner.querySelector('.wave-sub').textContent = sub;
  hud.banner.classList.add('show');
  clearTimeout(showBanner._t);
  showBanner._t = setTimeout(() => hud.banner.classList.remove('show'), ms);
}

function showToast(text, ms = 2100) {
  hud.toast.textContent = text;
  hud.toast.classList.add('show');
  clearTimeout(game.toastTimer);
  game.toastTimer = setTimeout(() => hud.toast.classList.remove('show'), ms);
}

function syncTiltUI(on) {
  controls.setTiltButton(on);
  const toggle = $('tiltToggle');
  if (toggle) toggle.setAttribute('aria-checked', on ? 'true' : 'false');
  const hint = $('tiltHint');
  if (hint) hint.textContent = on ? 'Gyro aim is live. Tilt to look. Drag to recalibrate.' : 'Optional accelerometer tilt. iOS asks permission.';
}

/* ---------------- combat ---------------- */
function muzzlePosition() {
  return weapon.muzzlePosition(new THREE.Vector3());
}

function RayHitAABB(origin, dir, box, maxT = 160) {
  let tmin = 0, tmax = maxT;
  for (let axis = 0; axis < 3; axis++) {
    const o = axis === 0 ? origin.x : axis === 1 ? origin.y : origin.z;
    const d = axis === 0 ? dir.x : axis === 1 ? dir.y : dir.z;
    const lo = axis === 0 ? box.minX : axis === 1 ? 0 : box.minZ;
    const hi = axis === 0 ? box.maxX : axis === 1 ? 3.4 : box.maxZ;
    if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) return null; continue; }
    let t1 = (lo - o) / d, t2 = (hi - o) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return null;
  }
  return tmin;
}

function shoot() {
  if (game.mode !== 'playing' || game.reloading) return;
  if (game.ammo <= 0) {
    audio.empty();
    startReload();
    return;
  }
  game.ammo--;
  game.lastFire = game.time;
  weapon.fire(game.time);
  audio.shot();
  hud.crosshair.classList.add('firing');

  const origin = camera.position.clone();
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  const moveSpread = controls.moving ? 0.012 : 0.004;
  const spread = controls.aiming ? 0.0018 : moveSpread;
  const dir = forward.clone()
    .addScaledVector(right, (Math.random() - 0.5) * spread)
    .addScaledVector(up, (Math.random() - 0.5) * spread)
    .normalize();

  camera.updateMatrixWorld(true);
  scene.updateMatrixWorld(true);

  const raycaster = new THREE.Raycaster(origin, dir, 0.2, 150);
  const hits = raycaster.intersectObjects(catManager.hitMeshes, false);
  let hit = hits.find(h => h.object.userData.enemy && !h.object.userData.enemy.dead);
  let hitPoint = null;
  let hitEnemy = null;
  let hitPart = 'body';

  if (hit) {
    hitEnemy = hit.object.userData.enemy;
    hitPart = hit.object.userData.part;
    hitPoint = hit.point.clone();
  } else if (controls.isTouch || controls.aiming) {
    let best = null, bestAngle = controls.isTouch ? 0.085 : 0.045;
    const to = new THREE.Vector3();
    for (const e of catManager.enemies) {
      if (e.dead) continue;
      to.copy(e.root.position).setY(e.root.position.y + 1.1);
      const dist = to.distanceTo(origin);
      if (dist > 60) continue;
      to.sub(origin).normalize();
      const ang = forward.angleTo(to);
      if (ang < bestAngle) {
        // cheap line-of-sight check against the 2D cover boxes
        const blocked = world.colliders.some(r => {
          const steps = 8;
          for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const x = origin.x + (e.position.x - origin.x) * t;
            const z = origin.z + (e.position.z - origin.z) * t;
            if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return true;
          }
          return false;
        });
        if (blocked) continue;
        bestAngle = ang;
        best = e;
      }
    }
    if (best) {
      hitEnemy = best;
      hitPart = 'body';
      hitPoint = best.root.position.clone().setY(best.root.position.y + 1.15);
    }
  }

  if (hitEnemy) {
    const result = catManager.damage(hitEnemy, 34, hitPart, hitPoint, dir);
    if (result && !result.killed) {
      showHitmarker(false, hitPart === 'head');
    }
    hitPoint = hitPoint || hitEnemy.root.position.clone();
  } else {
    let tBest = 150;
    for (const r of world.colliders) {
      const t = RayHitAABB(origin, dir, r);
      if (t !== null && t < tBest) tBest = t;
    }
    if (dir.y < -0.02) {
      const t = -origin.y / dir.y;
      if (t > 0 && t < tBest) tBest = t;
    }
    hitPoint = origin.clone().addScaledVector(dir, Math.min(tBest, 150));
    const n = new THREE.Vector3(0, 1, 0);
    if (tBest < 100) {
      if (Math.abs(dir.y) > 0.7) n.set(0, 1, 0);
      else n.set(-dir.x, 0, -dir.z).normalize();
      effects.impact(hitPoint, n, 0xffc06a);
    }
  }

  const muzzle = muzzlePosition();
  effects.tracer(muzzle, hitPoint, 0xffd087);

  const rightShell = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  effects.shell(origin.clone().addScaledVector(rightShell, 0.27).addScaledVector(up, -0.12).addScaledVector(forward, 0.45), rightShell);

  player.shake = Math.max(player.shake, 0.55);
  controls.pitch += 0.0042 + Math.random() * 0.002;
  controls.yaw += (Math.random() - 0.5) * 0.0022;
  weapon.addLook(0, 0);
  updateHUD();
}

function startReload() {
  if (game.reloading || game.ammo >= game.magSize || game.reserve <= 0) return;
  game.reloading = true;
  audio.reload();
  weapon.startReload();
  updateHUD();
}

weapon.onReloadDone = () => {
  if (!game.reloading) return;
  const need = game.magSize - game.ammo;
  const take = Math.min(need, game.reserve);
  game.ammo += take;
  game.reserve -= take;
  game.reloading = false;
  updateHUD();
};

function throwGrenade() {
  if (game.mode !== 'playing' || game.grenades <= 0 || game.grenadeCooldown > 0) return;
  game.grenades--;
  game.grenadeCooldown = 7.5;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const pos = camera.position.clone().addScaledVector(forward, 0.55);
  pos.y -= 0.15;
  const g = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshStandardMaterial({ color: 0xe9a1b8, roughness: 0.9 }));
  ball.castShadow = true;
  g.add(ball);
  for (let i = 0; i < 3; i++) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.014, 5, 18), new THREE.MeshStandardMaterial({ color: 0xf6c3d2, roughness: 0.9 }));
    wrap.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    g.add(wrap);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,240,200,.55)', 'rgba(255,140,60,.2)', 'rgba(255,90,10,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(0.9, 0.9, 1);
  g.add(glow);
  g.position.copy(pos);
  scene.add(g);
  const vel = forward.clone().multiplyScalar(17);
  vel.y += 5.2;
  game.grenadesActive.push({ mesh: g, vel, fuse: 1.55, spin: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8), trail: 0 });
  showToast('YARN BOMB AWAY', 900);
  updateHUD();
}

function explodeGrenade(g) {
  const p = g.mesh.position.clone();
  scene.remove(g.mesh);
  g.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  effects.explosion(p, 0xffa04a);
  audio.explosion();
  player.shake = 1.35;
  const distPlayer = p.distanceTo(player.pos);
  if (distPlayer < 7) {
    controls.pitch += (Math.random() - 0.5) * 0.02;
  }
  for (const e of catManager.enemies) {
    if (e.dead) continue;
    const d = e.position.distanceTo(p);
    if (d < 6.8) {
      const dmg = Math.round(260 * (1 - d / 7.4));
      const dir = e.position.clone().sub(p).setY(0.15).normalize();
      catManager.damage(e, dmg, 'body', e.root.position.clone().setY(1), dir);
    }
  }
}

function spawnEnemyBullet(enemy, pos, dir) {
  const color = enemy.type === 'heavy' ? 0xff5b3c : enemy.type === 'scout' ? 0x5ffee0 : 0xffb45a;
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3cf }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,255,255,.85)', 'rgba(255,180,90,.45)', 'rgba(255,120,20,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color }));
  glow.scale.set(0.75, 0.75, 1);
  g.add(core, glow);
  g.position.copy(pos);
  scene.add(g);
  game.enemyBullets.push({
    mesh: g, vel: dir.clone().multiplyScalar(enemy.type === 'scout' ? 34 : 27),
    life: 3.2, damage: enemy.damage, color, trail: 0, owner: enemy
  });
}

function damagePlayer(amount, sourcePos) {
  if (game.mode !== 'playing') return;
  player.health -= amount;
  player.lastDamage = game.time;
  player.shake = Math.max(player.shake, 0.9);
  audio.hurt();
  hud.damageFlash.classList.add('hit');
  clearTimeout(damagePlayer._fg);
  damagePlayer._fg = setTimeout(() => hud.damageFlash.classList.remove('hit'), 130);
  if (sourcePos) {
    const dir = sourcePos.clone().sub(player.pos);
    controls.yaw += clamp((Math.random() - 0.5) * 0.03, -0.02, 0.02);
  }
  if (player.health <= 0) {
    player.health = 0;
    gameOver();
  }
  updateHUD();
}

function onEnemyKilled(enemy, head, point) {
  game.kills++;
  game.streak++;
  const mult = 1 + Math.min(4, Math.floor(game.streak / 3)) * 0.5;
  game.score += Math.round(enemy.score * mult) + (head ? 75 : 0);
  game.waveKilled++;
  game.reserve = Math.min(300, game.reserve + 4);
  showKillfeed(enemy, head);
  showHitmarker(true, head);
  audio.kill();
  if (head) showToast('HEADSHOT +75', 900);
  if (game.streak > 0 && game.streak % 5 === 0) {
    game.grenades = Math.min(4, game.grenades + 1);
    showToast(`${game.streak} STREAK — YARN BOMB RESUPPLIED`, 1500);
  }
  updateHUD();
}

/* ---------------- waves ---------------- */
function safeSpawn(base) {
  const p = base.clone();
  p.y = 0;
  const blocked = (x, z) => {
    if (Math.abs(x) > world.bounds - 1 || Math.abs(z) > world.bounds - 1) return true;
    for (const r of world.colliders) {
      if (x > r.minX - 0.9 && x < r.maxX + 0.9 && z > r.minZ - 0.9 && z < r.maxZ + 0.9) return true;
    }
    return false;
  };
  if (!blocked(p.x, p.z)) return p;
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 5;
    const x = p.x + Math.cos(a) * r;
    const z = p.z + Math.sin(a) * r;
    if (!blocked(x, z)) return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(0, 0, -16);
}

function spawnNextEnemy() {
  if (game.spawnRemaining <= 0) return;
  const pool = world.spawnPoints;
  const base = pool[(Math.random() * pool.length) | 0];
  const pos = safeSpawn(base);
  let type = 'grunt';
  if (game.wave >= 2 && Math.random() < 0.22) type = 'scout';
  if (game.wave >= 3 && Math.random() < Math.min(0.36, 0.12 + game.wave * 0.025)) type = 'heavy';
  const facing = Math.atan2(player.pos.x - pos.x, player.pos.z - pos.z);
  catManager.spawn(type, pos, facing);
  game.spawnRemaining--;
}

function startWave(n) {
  game.wave = n;
  game.waveTotal = Math.min(34, 3 + n * 2);
  game.waveKilled = 0;
  game.spawnRemaining = game.waveTotal;
  game.spawnTimer = 0.35;
  game.maxConcurrent = Math.min(8, 3 + Math.floor(n / 2));
  game.intermission = 0;
  game.score += n === 1 ? 0 : 250 * (n - 1);
  game.grenades = Math.min(4, game.grenades + 1);
  game.reserve = Math.min(300, game.reserve + 30);
  audio.wave();
  showBanner(n === 1 ? 'INCOMING' : `WAVE ${pad(n)}`, `WAVE ${n}`, n === 1 ? 'THE CLAWS ARE COMING' : n % 5 === 0 ? 'HEAVY PAWS INBOUND' : 'THE CLOWDER GROWS', 2400);
  if (n === 1) {
    const opening = [
      new THREE.Vector3(-4.2, 0, 11.5),
      new THREE.Vector3(6.4, 0, 7.2),
      new THREE.Vector3(-8.6, 0, 3.4)
    ];
    opening.slice(0, game.spawnRemaining).forEach((p, i) => {
      setTimeout(() => {
        if (game.mode === 'playing' && game.spawnRemaining > 0) {
          const facing = Math.atan2(player.pos.x - p.x, player.pos.z - p.z);
          catManager.spawn('grunt', safeSpawn(p), facing);
          game.spawnRemaining--;
        }
      }, i * 180);
    });
  } else {
    for (let i = 0; i < Math.min(3, game.spawnRemaining); i++) {
      const delay = i * 260;
      setTimeout(() => { if (game.mode === 'playing' && game.spawnRemaining > 0) spawnNextEnemy(); }, delay);
    }
  }
  updateHUD();
}

function updateWaves(dt) {
  if (game.mode !== 'playing') return;
  if (game.intermission > 0) {
    game.intermission -= dt;
    if (game.intermission <= 0) startWave(game.wave + 1);
    return;
  }
  if (game.spawnRemaining > 0) {
    game.spawnTimer -= dt;
    if (game.spawnTimer <= 0 && catManager.aliveCount < game.maxConcurrent) {
      spawnNextEnemy();
      game.spawnTimer = 1.0 + Math.random() * 0.85;
    }
  } else if (catManager.aliveCount === 0 && game.waveTotal > 0) {
    game.intermission = 4.2;
    game.score += game.wave * 500;
    player.health = Math.min(100, player.health + 25);
    game.reserve = Math.min(300, game.reserve + 60);
    showBanner('AREA SECURED', 'WAVE CLEARED', `+${game.wave * 500} SCORE · NEXT WAVE IN 4`, 3000);
    audio.victory();
    updateHUD();
  }
}

/* ---------------- player update ---------------- */
function collidePlayer(x, z) {
  const r = player.radius;
  for (const b of world.colliders) {
    if (x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r) return true;
  }
  return false;
}

function updatePlayer(dt) {
  const { moveX, moveZ } = controls;
  const yaw = controls.yaw;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const wish = forward.multiplyScalar(moveZ).addScaledVector(right, moveX);
  const wishLen = wish.length();
  if (wishLen > 0.001) wish.normalize();
  const sprinting = controls.sprint && wishLen > 0.1;
  let speed = sprinting ? player.sprintSpeed : player.walkSpeed;
  if (controls.aiming) speed *= 0.66;
  if (!player.onGround) speed *= 0.86;
  const targetVX = wish.x * speed * Math.min(1, wishLen);
  const targetVZ = wish.z * speed * Math.min(1, wishLen);
  player.vx = (player.vx || 0) + (targetVX - (player.vx || 0)) * Math.min(1, dt * 11);
  player.vz = (player.vz || 0) + (targetVZ - (player.vz || 0)) * Math.min(1, dt * 11);

  let nx = player.pos.x + player.vx * dt;
  let nz = player.pos.z + player.vz * dt;
  const bound = world.bounds;
  nx = clamp(nx, -bound, bound);
  nz = clamp(nz, -bound, bound);
  if (!collidePlayer(nx, player.pos.z)) player.pos.x = nx; else player.vx = 0;
  if (!collidePlayer(player.pos.x, nz)) player.pos.z = nz; else player.vz = 0;

  const actions = controls.consumeActions();
  if (actions.jump && player.onGround) {
    player.velY = 5.5;
    player.onGround = false;
    showToast('JUMP', 500);
  }
  if (actions.reload) startReload();
  if (actions.grenade) throwGrenade();

  player.velY -= 15.5 * dt;
  player.pos.y += player.velY * dt;
  if (player.pos.y <= 0) {
    if (!player.onGround && player.velY < -4) {
      player.shake = Math.max(player.shake, 0.36);
      audio.step();
    }
    player.pos.y = 0;
    player.velY = 0;
    player.onGround = true;
  }

  const actualSpeed = Math.hypot(player.vx || 0, player.vz || 0);
  if (player.onGround && actualSpeed > 0.3) {
    player.stepPhase += dt * (sprinting ? 12 : 9);
    player.bob = Math.sin(player.stepPhase) * (sprinting ? 0.055 : 0.035) * Math.min(1, actualSpeed / 5);
    if (Math.sin(player.stepPhase) > 0.98) audio.step();
  } else {
    player.bob += (0 - player.bob) * Math.min(1, dt * 8);
  }

  const targetFov = controls.aiming ? 54 : sprinting ? 80 : 76;
  currentFov += (targetFov - currentFov) * Math.min(1, dt * 9);
  camera.fov = currentFov;
  camera.updateProjectionMatrix();

  if (player.health < 100 && game.time - player.lastDamage > 5.2) {
    player.health = Math.min(100, player.health + 11 * dt);
    hud.healGlow.classList.add('on');
    clearTimeout(updatePlayer._heal);
    updatePlayer._heal = setTimeout(() => hud.healGlow.classList.remove('on'), 260);
  }

  if (controls.firing) {
    if (game.time - game.lastFire > 0.102) shoot();
  }

  player.shake = Math.max(0, player.shake - dt * 2.4);
  const shake = player.shake;
  const strafe = moveX;
  camera.position.set(
    player.pos.x,
    player.pos.y + player.eye + player.bob,
    player.pos.z
  );
  camera.rotation.y = controls.yaw + (Math.random() - 0.5) * shake * 0.006;
  camera.rotation.x = controls.pitch + (Math.random() - 0.5) * shake * 0.007;
  camera.rotation.z = -strafe * 0.014 + (Math.random() - 0.5) * shake * 0.008;
  camera.updateMatrixWorld();
}

function updateEnemyBullets(dt) {
  for (let i = game.enemyBullets.length - 1; i >= 0; i--) {
    const b = game.enemyBullets[i];
    b.life -= dt;
    b.mesh.position.addScaledVector(b.vel, dt);
    b.vel.y -= 1.1 * dt;
    const p = b.mesh.position;
    b.trail -= dt;
    if (b.trail <= 0) {
      b.trail = 0.08;
      effects.puff(p, { color: b.color, size: 0.2, life: 0.22, opacity: 0.4, rise: 0, additive: true });
    }
    let remove = b.life <= 0 || p.y < 0 || Math.abs(p.x) > world.bounds || Math.abs(p.z) > world.bounds;
    if (!remove) {
      for (const r of world.colliders) {
        if (p.x > r.minX && p.x < r.maxX && p.z > r.minZ && p.z < r.maxZ && p.y < 3.2) {
          remove = true;
          effects.impact(p.clone(), new THREE.Vector3(-b.vel.x, 0, -b.vel.z).normalize(), b.color);
          break;
        }
      }
    }
    if (!remove) {
      const chest = new THREE.Vector3(player.pos.x, player.pos.y + 1.1, player.pos.z);
      if (p.distanceTo(chest) < 0.68) {
        damagePlayer(b.damage, p.clone());
        effects.burst(p, { count: 6, color: b.color, speed: 2.5, life: 0.3, gravity: 3 });
        remove = true;
      }
    }
    if (remove) {
      scene.remove(b.mesh);
      b.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      game.enemyBullets.splice(i, 1);
    }
  }
}

function updateGrenades(dt) {
  for (let i = game.grenadesActive.length - 1; i >= 0; i--) {
    const g = game.grenadesActive[i];
    g.fuse -= dt;
    g.trail -= dt;
    g.vel.y -= 14 * dt;
    g.mesh.position.addScaledVector(g.vel, dt);
    g.mesh.rotation.x += g.spin.x * dt;
    g.mesh.rotation.y += g.spin.y * dt;
    g.mesh.rotation.z += g.spin.z * dt;
    if (g.mesh.position.y < 0.14) {
      g.mesh.position.y = 0.14;
      g.vel.y = Math.abs(g.vel.y) * 0.45;
      g.vel.x *= 0.72;
      g.vel.z *= 0.72;
      g.spin.multiplyScalar(0.65);
    }
    if (g.trail <= 0) {
      g.trail = 0.07;
      effects.puff(g.mesh.position, { color: 0xffc46a, size: 0.3, life: 0.3, opacity: 0.5, rise: 0.15, additive: true });
    }
    if (g.fuse <= 0) {
      explodeGrenade(g);
      game.grenadesActive.splice(i, 1);
    }
  }
}

function updateGame(dt) {
  game.time += dt;
  controls.update();
  const look = controls.consumeLook();
  weapon.addLook(look.dx, look.dy);
  updatePlayer(dt);
  catManager.update(dt, game.time, player.pos);
  updateEnemyBullets(dt);
  updateGrenades(dt);
  updateWaves(dt);
  if (game.grenadeCooldown > 0) game.grenadeCooldown = Math.max(0, game.grenadeCooldown - dt);
  weapon.update(dt, {
    aiming: controls.aiming,
    moveSpeed: Math.hypot(player.vx || 0, player.vz || 0) / player.walkSpeed,
    reloading: game.reloading
  });
  updateHUD();
  updateCompass();
  updateMinimap();
  syncTiltUI(controls.tiltEnabled);
}

/* ---------------- lifecycle ---------------- */
function resetGameState() {
  catManager.clear();
  for (const b of game.enemyBullets) {
    scene.remove(b.mesh);
    b.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  game.enemyBullets.length = 0;
  for (const g of game.grenadesActive) {
    scene.remove(g.mesh);
    g.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  game.grenadesActive.length = 0;
  effects.reset();
  player.pos.set(0, 0, 21.5);
  player.velY = 0;
  player.vx = 0;
  player.vz = 0;
  player.onGround = true;
  player.health = 100;
  player.lastDamage = -100;
  player.shake = 0;
  player.bob = 0;
  game.wave = 0;
  game.waveTotal = 0;
  game.waveKilled = 0;
  game.spawnRemaining = 0;
  game.intermission = 0;
  game.score = 0;
  game.kills = 0;
  game.streak = 0;
  game.ammo = 30;
  game.reserve = 180;
  game.grenades = 2;
  game.grenadeCooldown = 0;
  game.reloading = false;
  game.lastFire = -10;
  game.time = 0;
  weapon.reloading = false;
  weapon.reloadTimer = 0;
  weapon.mag.position.y = -0.11;
  controls.reset();
  currentFov = 76;
  camera.fov = 76;
  camera.updateProjectionMatrix();
  hud.killfeed.innerHTML = '';
  hud.damageNumbers.innerHTML = '';
  hud.damageFlash.classList.remove('hit');
  hud.healGlow.classList.remove('on');
}

function startGame() {
  if (game.mode === 'playing') return;
  audio.init();
  audio.startAmbient();
  audio.deploy();
  clearTimeout(startGame._deploy);
  resetGameState();
  game.mode = 'playing';
  document.body.classList.add('playing');
  $('menu').classList.add('hidden');
  $('pause').classList.add('hidden');
  $('gameover').classList.add('hidden');
  $('hud').classList.add('active');
  weapon.root.visible = true;
  weapon.root.position.set(0.36, -0.32, -0.66);
  controls.pitch = -0.015;
  controls.yaw = 0;
  camera.position.set(player.pos.x, player.pos.y + player.eye, player.pos.z);
  camera.rotation.set(controls.pitch, controls.yaw, 0);
  startWave(1);
  updateHUD();
  if (!controls.isTouch) {
    setTimeout(() => controls.requestPointerLock(), 150);
  }
}

function togglePause(force) {
  if (game.mode === 'playing' || force === true) {
    if (game.mode !== 'playing') return;
    game.mode = 'paused';
    $('pause').classList.remove('hidden');
    $('pauseWave').textContent = pad(game.wave);
    $('pauseScore').textContent = fmt(game.score);
    $('pauseKills').textContent = game.kills;
    controls.firing = false;
    controls.aiming = false;
    controls.releasePointer();
    document.body.classList.remove('playing');
  } else if (game.mode === 'paused') {
    game.mode = 'playing';
    $('pause').classList.add('hidden');
    document.body.classList.add('playing');
    audio.ui();
    if (!controls.isTouch) setTimeout(() => controls.requestPointerLock(), 100);
    controls.update();
  }
}

function gameOver() {
  if (game.mode === 'over') return;
  game.mode = 'over';
  controls.firing = false;
  controls.aiming = false;
  controls.releasePointer();
  document.body.classList.remove('playing');
  $('goScore').textContent = fmt(game.score);
  $('goWave').textContent = game.wave;
  $('goKills').textContent = game.kills;
  const ranks = [
    [0, 'KITTEN CADET'], [2500, 'PAW PRIVATE'], [6000, 'WHISKER SERGEANT'],
    [12000, 'CLAW LIEUTENANT'], [22000, 'NINE-LIVES COMMANDER'], [40000, 'LEGEND OF THE LITTER']
  ];
  let rank = ranks[0][1];
  for (const [min, name] of ranks) if (game.score >= min) rank = name;
  $('goRank').textContent = rank;
  $('gameover').classList.remove('hidden');
  audio.gameOver();
}

function restartGame() {
  $('gameover').classList.add('hidden');
  $('pause').classList.add('hidden');
  game.mode = 'menu';
  startGame();
}

/* ---------------- UI events ---------------- */
$('startBtn').addEventListener('click', startGame);
$('pauseBtn').addEventListener('click', () => togglePause());
$('resumeBtn').addEventListener('click', () => togglePause());
$('restartBtn').addEventListener('click', restartGame);
$('pauseRestartBtn').addEventListener('click', restartGame);
$('pauseSoundBtn').addEventListener('click', () => {
  audio.setEnabled(!audio.enabled);
  $('pauseSoundBtn').textContent = `SOUND: ${audio.enabled ? 'ON' : 'OFF'}`;
  audio.ui();
});
function cycleQuality() {
  const order = ['high', 'medium', 'low'];
  quality = order[(order.indexOf(quality) + 1) % order.length];
  localStorage.setItem('cats-quality', quality);
  $('pauseQualityBtn').textContent = `QUALITY: ${quality.toUpperCase()}`;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.55 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = quality !== 'low';
  disposeComposer();
  if (quality !== 'low') {
    makeComposer();
  } else {
    composerEnabled = false;
  }
  showToast(`QUALITY SET TO ${quality.toUpperCase()}`, 1500);
}
$('pauseQualityBtn').textContent = `QUALITY: ${quality.toUpperCase()}`;
$('pauseQualityBtn').addEventListener('click', cycleQuality);

const tiltToggle = $('tiltToggle');
tiltToggle.addEventListener('click', async () => {
  audio.init();
  const on = await controls.toggleTilt();
  syncTiltUI(controls.tiltEnabled);
  audio.ui();
});
const tiltBtn = $('tiltBtn');
tiltBtn.addEventListener('click', () => {
  // pointerdown on the button already toggles; this prevents synthetic click double-toggle
  if (tiltBtn._handled) { tiltBtn._handled = false; }
});

// prevent double toggle from click after pointerdown on touch
tiltBtn.addEventListener('pointerdown', () => { tiltBtn._handled = true; });

/* ---------------- resize ---------------- */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.55 : 1));
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  weapon.setAspect(w / h);
  if (composer) {
    composer.setSize(w, h);
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.55 : 1));
    if (bloomPass) bloomPass.setSize(w, h);
  }
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 200));

/* ---------------- menu camera ---------------- */
function updateMenuCamera(t) {
  const a = 0.85 + Math.sin(t * 0.055) * 0.16;
  camera.position.set(Math.sin(a) * 27 + 3, 8.2 + Math.sin(t * 0.21) * 0.45, Math.cos(a) * 26 + 8);
  camera.lookAt(0, 2.2, -7);
  camera.fov = 64;
  camera.updateProjectionMatrix();
}

/* ---------------- loop ---------------- */
const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (game.mode === 'menu') {
    menuTime += dt;
    updateMenuCamera(menuTime);
    world.update(elapsed, dt);
  } else if (game.mode === 'playing') {
    updateGame(dt);
    world.update(elapsed, dt);
    effects.update(dt);
  } else {
    world.update(elapsed, dt * 0.2);
    effects.update(dt * 0.35);
  }

  if (composer && composerEnabled) composer.render();
  else renderer.render(scene, camera);
}

/* ---------------- debug hook ---------------- */
window.__CATS__ = { game, player, catManager, controls, camera, scene, world, effects, weapon, startGame };

/* ---------------- boot ---------------- */
syncTiltUI(controls.tiltEnabled);
if (window.innerWidth <= 900) document.body.classList.add('touch');
$('pauseSoundBtn').textContent = 'SOUND: ON';
if (controls.tiltNeedsPermission) {
  $('tiltHint').textContent = 'iOS requires a tap to allow motion. Tap the switch to enable.';
}
$('hud').classList.remove('active');
document.body.classList.add('menu-open');

function boot() {
  // Render one frame before revealing the menu.
  updateMenuCamera(0);
  world.update(0, 0);
  if (composer && composerEnabled) composer.render();
  else renderer.render(scene, camera);
  requestAnimationFrame(() => {
    $('loading').classList.add('done');
    setTimeout(() => { $('loading').style.display = 'none'; }, 650);
  });
  animate();
}

document.fonts.ready.then(boot).catch(boot);
window.addEventListener('error', e => {
  console.error('GAME ERROR', e.error || e.message);
});
