import * as THREE from "../vendor/three.module.min.js";
import { createWorld, worldLayout } from "./world.js";
import { createCat } from "./cats.js";
import { Soundscape } from "./audio.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const wrapAngle = (angle) => {
  let result = angle % (Math.PI * 2);
  if (result > Math.PI) result -= Math.PI * 2;
  if (result < -Math.PI) result += Math.PI * 2;
  return result;
};
const normalizeDegrees = (value) => ((value % 360) + 360) % 360;
const signedDegrees = (value) => {
  let result = value % 360;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
};
const dampAngle = (current, target, lambda, dt) => current + wrapAngle(target - current) * (1 - Math.exp(-lambda * dt));

const SAVE_KEY = "frostpaw-save-v1";
const SETTINGS_KEY = "frostpaw-settings-v1";

const FURS = {
  snow: { color: "#d9d5ca", numeric: 0xd9d5ca, label: "Snow wanderer" },
  ember: { color: "#c98247", numeric: 0xc98247, label: "Ember wanderer" },
  shadow: { color: "#46424c", numeric: 0x46424c, label: "Shadow wanderer" },
  ginger: { color: "#dfa164", numeric: 0xdfa164, label: "Ginger wanderer" },
  moon: { color: "#a9b8c8", numeric: 0xa9b8c8, label: "Moon wanderer" },
};

const CLASSES = {
  warrior: {
    label: "Clawblade", maxHealth: 120, maxMagicka: 65, maxStamina: 105, speed: 6.05,
    damage: 28, spellCost: 19, magickaRegen: 7.2, potions: 3, weapon: "sword", armor: true,
    cloak: 0x3d514f, intro: "A steady paw and a heavy blade.",
  },
  mage: {
    label: "Moonwhisker", maxHealth: 96, maxMagicka: 112, maxStamina: 100, speed: 6.0,
    damage: 22, spellCost: 12, magickaRegen: 12.4, potions: 3, weapon: "staff", armor: false,
    cloak: 0x34445f, intro: "Moonfire answers the gentle paw.",
  },
  rogue: {
    label: "Nightstep", maxHealth: 101, maxMagicka: 82, maxStamina: 112, speed: 6.85,
    damage: 23, spellCost: 17, magickaRegen: 8.6, potions: 4, weapon: "dagger", armor: false,
    cloak: 0x343944, intro: "Quick paws. Sharp edges. No wasted motion.",
  },
};

const dom = {
  app: $("#app"), canvas: $("#game-canvas"), fader: $("#screen-fader"),
  title: $("#title-screen"), titleHint: $("#title-hint"), titleBrand: $("#title-brand"),
  loading: $("#loading-screen"), loadingText: $("#loading-text"),
  creator: $("#creator"), creatorPortrait: $("#creator-portrait"), creatorName: $("#creator-name-preview"),
  creatorFur: $("#creator-fur-preview"), catName: $("#cat-name"),
  btnNew: $("#btn-new"), btnContinue: $("#btn-continue"), btnCreatorClose: $("#btn-creator-close"),
  btnEnter: $("#btn-enter"), hud: $("#hud"), pause: $("#pause"), dialogueLayer: $("#dialogue-layer"),
  dialogueName: $("#dialogue-name"), dialogueText: $("#dialogue-text"), dialoguePortrait: $("#dialogue-portrait"),
  death: $("#death-layer"), victory: $("#victory-layer"), damageVignette: $("#damage-vignette"),
  hudPortrait: $("#hud-portrait"), hudName: $("#hud-name"), hudLevel: $("#hud-level"),
  barHealth: $("#bar-health"), barMagicka: $("#bar-magicka"), barStamina: $("#bar-stamina"),
  textHealth: $("#text-health"), textMagicka: $("#text-magicka"), textStamina: $("#text-stamina"),
  compass: $("#compass"), compassTrack: $("#compass-track"), compassQuest: $("#compass-quest"),
  questCard: $("#quest-card"), questTitle: $("#quest-title"), questObjective: $("#quest-objective"),
  questDistance: $("#quest-distance"), timeText: $("#time-text"),
  bossWrap: $("#boss-wrap"), bossFill: $("#boss-fill"), bossHp: $("#boss-hp-text"),
  toastStack: $("#toast-stack"), subtitle: $("#subtitle-chip"), interactWrap: $("#interact-wrap"),
  interactLabel: $("#interact-label"), tutorial: $("#tutorial-card"), lookCue: $("#look-cue"),
  joystickZone: $("#joystick-zone"), joystickKnob: $("#joystick-knob"),
  btnAttack: $("#btn-attack"), btnSpell: $("#btn-spell"), btnJump: $("#btn-jump"), btnPotion: $("#btn-potion"),
  potionCount: $("#potion-count"), attackCd: $("#attack-cd"), spellCd: $("#spell-cd"),
  btnPause: $("#btn-pause"), btnResume: $("#btn-resume"), btnTitle: $("#btn-title"),
  btnTiltTitle: $("#btn-tilt-title"), btnSoundTitle: $("#btn-sound-title"), btnFullTitle: $("#btn-full-title"),
  btnTiltPause: $("#btn-tilt-pause"), btnSoundPause: $("#btn-sound-pause"), btnFullPause: $("#btn-full-pause"),
  toggleTiltPause: $("#toggle-tilt-pause"), toggleSoundPause: $("#toggle-sound-pause"), toggleFullPause: $("#toggle-full-pause"),
  tiltStatusPause: $("#tilt-status-pause"), soundStatusPause: $("#sound-status-pause"), pauseHint: $("#pause-hint"),
  tiltIndicator: $("#tilt-indicator"), btnInteract: $("#btn-interact"), btnDialogueNext: $("#btn-dialogue-next"),
  btnRespawn: $("#btn-respawn"), deathContent: $(".death-content"),
  victoryTime: $("#victory-time"), victoryFoes: $("#victory-foes"), victoryGold: $("#victory-gold"),
  btnKeepPlaying: $("#btn-keep-playing"), btnVictoryTitle: $("#btn-victory-title"),
  btnTutorialClose: $("#btn-tutorial-close"), rotateHint: $("#rotate-hint"),
};

function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

const settings = {
  muted: false,
  tilt: false,
  ...readJSON(SETTINGS_KEY, {}),
};
const savedGame = readJSON(SAVE_KEY, null);

const sound = new Soundscape();
sound.muted = Boolean(settings.muted);

const state = {
  mode: "loading",
  ready: false,
  options: { name: "Mist", furKey: "snow", classKey: "warrior" },
  player: {
    x: worldLayout.spawn.x, z: worldLayout.spawn.z, y: 0, facing: Math.PI,
    health: 100, maxHealth: 100, magicka: 80, maxMagicka: 80, stamina: 100, maxStamina: 100,
    potions: 3, level: 1, invuln: 0, attackCooldown: 0, spellCooldown: 0,
    attackTimer: 0, attackHitPending: false, jumpOffset: 0, jumpVelocity: 0, grounded: true,
    sprinting: false, lastDamageAt: -20, moving: false,
  },
  stage: 0, kills: 0, gold: 0, playTime: 0, elapsed: 0, lastSaveAt: 0,
  cameraYaw: 0, cameraPitch: 0.21, cameraDistance: 6.45, cameraFov: 58,
  joystick: { active: false, pointerId: null, x: 0, y: 0 },
  lookPointer: null, lookLastX: 0, lookLastY: 0,
  keys: new Set(), tiltEnabled: false, tiltCalibration: null, tiltTarget: 0, tiltSmoothed: 0,
  interactTarget: null, dialogue: null, effects: [], projectiles: [], floaters: [], enemies: [], npcs: [],
  boss: null, bossActive: false, bossDefeated: false,
  tutorialDismissed: false, tutorialTimer: 0, rotateHintShown: false,
  deathTimer: 0, deathCameraYaw: 0, saveDirty: false, introShown: false,
  compassLabels: [], activeSpellTarget: null,
};

let renderer, scene, camera, world, playerCat;
let glowTexture;
let lastFrame = performance.now();
let hudClock = 0;
let timeClock = 0;
let toastSerial = 0;
let subtitleTimeout = null;
let currentTarget = null;
let saveTimer = 0;
let autoPauseAt = 0;
let titleOrbit = 0.22;
let respawnBusy = false;
let groundPlatformY = 0;

function groundAt(x, z) {
  if (!world) return 0;
  let height = world.heightAt(x, z);
  const shrineDistance = Math.hypot(x - worldLayout.shrine.x, z - worldLayout.shrine.z);
  if (shrineDistance < 5.35) {
    height += shrineDistance < 3.72 ? 0.59 : 0.4;
  }
  return height;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,.9)");
  gradient.addColorStop(0.45, "rgba(255,255,255,.28)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRenderer() {
  const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 900;
  renderer = new THREE.WebGLRenderer({
    canvas: dom.canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.55 : 1.9));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x06101b, 1);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a1722, 0.0122);
  camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 440);
  camera.position.set(worldLayout.spawn.x - 7, 8, worldLayout.spawn.z + 11);
  camera.lookAt(worldLayout.spawn.x, 1, worldLayout.spawn.z);
  glowTexture = makeGlowTexture();
}

function playerClass() {
  return CLASSES[state.options.classKey] || CLASSES.warrior;
}
function furInfo() {
  return FURS[state.options.furKey] || FURS.snow;
}

function makePlayerCat() {
  if (playerCat) {
    scene.remove(playerCat.root);
    playerCat = null;
  }
  const cls = playerClass();
  const fur = furInfo();
  playerCat = createCat({
    fur: fur.numeric,
    cloak: cls.cloak,
    eyeColor: state.options.classKey === "mage" ? 0xa5f5ee : 0xb7f2d2,
    scale: 1,
    weapon: cls.weapon,
    armor: cls.armor,
    name: state.options.name,
  });
  playerCat.root.position.set(state.player.x, state.player.y, state.player.z);
  playerCat.root.rotation.y = state.player.facing;
  scene.add(playerCat.root);
}

function addNpc(config) {
  const {
    name, x, z, fur = 0xaa8e72, cloak = 0x364e56, eyeColor = 0x9fe7d8, scale = 0.94,
    robe = false, weapon = "none", armor = false, yaw = Math.PI, lines = [], quest = false,
  } = config;
  const cat = createCat({ fur, cloak, eyeColor, scale, robe, weapon, armor, name });
  const y = groundAt(x, z);
  cat.root.position.set(x, y, z);
  cat.root.rotation.y = yaw;
  scene.add(cat.root);
  const npc = { name, x, z, y, fur, cat, lines, quest, baseYaw: yaw, phase: Math.random() * 10, radius: 3.4 };
  state.npcs.push(npc);
  return npc;
}

function createNpcs() {
  addNpc({
    name: "Elder Mew", x: worldLayout.elder.x, z: worldLayout.elder.z + 0.5,
    fur: 0x8f7a61, cloak: 0x36514f, eyeColor: 0xaaf5e7, scale: 0.96, robe: true, weapon: "staff",
    yaw: Math.PI, quest: true,
    lines: [
      "You came. Even the snow seemed to hold its breath.",
      "The Sunstone — our warmth, our dawn — was taken from the shrine and buried in Frostfang Barrow.",
      "The Hollow King wears a cat's shape now, but there is no moon left in him. Bring our light home, little wanderer.",
    ],
  });
  addNpc({
    name: "Pip", x: -3.3, z: 6.2, fur: 0xe0d8c6, cloak: 0x7b5940, eyeColor: 0xd5ff9d,
    scale: 0.53, yaw: Math.PI + 0.7,
    lines: [
      "I caught a snowflake once. It turned into a puddle.",
      "I named the puddle Sir Puddle. He is very brave.",
      "If you find the Sunstone, can I keep it for one whole night?",
    ],
  });
  addNpc({
    name: "Marrow", x: 7.6, z: 15.2, fur: 0xc98349, cloak: 0x50382d, eyeColor: 0xe9ffc1,
    scale: 0.97, yaw: Math.PI - 0.5,
    lines: [
      "Furs, fish, and moon-charms. No refunds on curses.",
      "The barrow has been restless since the stone went missing. Even the crows left.",
      "If you see a shade out there, aim for the eyes. Or run. Running is free.",
    ],
  });
  addNpc({
    name: "Bramble", x: -2.3, z: 23.2, fur: 0x6a625d, cloak: 0x334347, eyeColor: 0x9ed9ff,
    scale: 1.02, armor: true, weapon: "sword", yaw: Math.PI + 0.32,
    lines: [
      "Keep to the lantern road. The pines swallow careless paws.",
      "Something old is awake in Frostfang. I would go myself, but someone must guard the stew.",
    ],
  });
}

function makeEnemyBar() {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 28;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture, transparent: true, depthWrite: false, depthTest: false, opacity: 0,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.48, 0.22, 1);
  sprite.renderOrder = 20;
  const draw = (ratio) => {
    ctx.clearRect(0, 0, 192, 28);
    ctx.fillStyle = "rgba(3,7,12,.82)";
    ctx.fillRect(2, 6, 188, 15);
    ctx.strokeStyle = "rgba(223,239,243,.42)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 6, 188, 15);
    const width = Math.max(0, ratio * 184);
    const grad = ctx.createLinearGradient(4, 0, 188, 0);
    grad.addColorStop(0, "#7f2938");
    grad.addColorStop(0.7, "#c04f61");
    grad.addColorStop(1, "#e08c98");
    ctx.fillStyle = grad;
    ctx.fillRect(4, 8, width, 11);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.fillRect(5, 8, Math.max(0, width - 2), 2);
    texture.needsUpdate = true;
  };
  draw(1);
  return { sprite, draw, lastRatio: -1 };
}

function addEnemy(config) {
  const {
    name, x, z, scale = 1, boss = false, fur = 0x302837, cloak = 0x241d2d,
    maxHealth = 55, speed = 3.15, damage = 9, aggro = 15, weapon = "sword",
  } = config;
  const cat = createCat({
    fur, cloak, eyeColor: boss ? 0xff5f78 : 0xff6c7f, scale, enemy: true, boss, weapon,
  });
  const y = groundAt(x, z);
  cat.root.position.set(x, y, z);
  cat.root.rotation.y = Math.random() * Math.PI * 2;
  scene.add(cat.root);
  const bar = boss ? null : makeEnemyBar();
  if (bar) {
    bar.sprite.position.set(0, 2.08 * scale, 0);
    cat.root.add(bar.sprite);
  }
  const enemy = {
    name, cat, x, z, y, spawnX: x, spawnZ: z, boss, maxHealth, health: maxHealth,
    speed, damage, aggro, radius: boss ? 4.2 : 2.6, attackRange: boss ? 3.5 : 2.3,
    attackCooldown: 0, windup: 0, windupActive: false, specialCooldown: 5.5,
    alive: true, active: !boss, aggroActive: false, bar, deathTimer: 0, idlePhase: Math.random() * 9,
    lastHitAt: -20,
  };
  if (boss) {
    cat.root.visible = false;
    state.boss = enemy;
  }
  state.enemies.push(enemy);
  return enemy;
}

function createEnemies() {
  addEnemy({ name: "Pale Shade", x: 23.5, z: -37, scale: 1.0, maxHealth: 48, speed: 3.3, damage: 8 });
  addEnemy({ name: "Pale Shade", x: 38.5, z: -56, scale: 1.03, maxHealth: 52, speed: 3.25, damage: 9 });
  addEnemy({ name: "Pale Shade", x: 25.2, z: -61.5, scale: 0.97, maxHealth: 46, speed: 3.4, damage: 8 });
  addEnemy({
    name: "Frostfang", x: 32.4, z: -62.4, scale: 1.62, boss: true, fur: 0x29202f,
    cloak: 0x1c1422, maxHealth: 245, speed: 3.75, damage: 17, aggro: 23, weapon: "sword",
  });
}

function buildCompass() {
  const labels = [
    { text: "N", bearing: 0, cardinal: true }, { text: "NE", bearing: 45 },
    { text: "E", bearing: 90, cardinal: true }, { text: "SE", bearing: 135 },
    { text: "S", bearing: 180, cardinal: true }, { text: "SW", bearing: 225 },
    { text: "W", bearing: 270, cardinal: true }, { text: "NW", bearing: 315 },
  ];
  state.compassLabels = labels.map((item) => {
    const el = document.createElement("span");
    el.className = `compass-label${item.cardinal ? " cardinal" : " minor"}`;
    el.textContent = item.text;
    dom.compassTrack.appendChild(el);
    return { ...item, el };
  });
  for (let bearing = 15; bearing < 360; bearing += 30) {
    if (bearing % 45 === 0) continue;
    const el = document.createElement("i");
    el.className = "compass-label minor";
    el.style.width = "1px";
    el.style.height = "4px";
    el.style.background = "rgba(219,239,244,.35)";
    dom.compassTrack.appendChild(el);
    state.compassLabels.push({ bearing, el, tick: true });
  }
}

function updateSoundUI() {
  const muted = Boolean(settings.muted);
  dom.btnSoundTitle.classList.toggle("muted", muted);
  dom.btnSoundTitle.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  dom.btnSoundPause.classList.toggle("muted", muted);
  dom.toggleSoundPause.classList.toggle("on", !muted);
  dom.soundStatusPause.textContent = muted ? "Sound muted" : "Wind & music on";
}

function updateTiltUI() {
  const enabled = state.tiltEnabled;
  dom.btnTiltTitle.classList.toggle("active", enabled);
  dom.toggleTiltPause.classList.toggle("on", enabled);
  dom.tiltStatusPause.textContent = enabled ? "Active · lean to look" : "Optional · off";
  dom.tiltIndicator.classList.toggle("hidden", !(enabled && state.mode === "playing"));
  dom.btnTiltTitle.setAttribute("aria-pressed", String(enabled));
}

function updateFullscreenUI() {
  const active = Boolean(document.fullscreenElement);
  dom.toggleFullPause.classList.toggle("on", active);
}

function setSoundMuted(muted) {
  settings.muted = muted;
  sound.muted = muted;
  if (!muted) sound.init();
  sound.setMuted(muted);
  writeJSON(SETTINGS_KEY, settings);
  updateSoundUI();
}

function notifyTitle(message) {
  dom.titleHint.textContent = message;
  dom.titleHint.classList.remove("flash");
  void dom.titleHint.offsetWidth;
  dom.titleHint.classList.add("flash");
}

function showToast(message, duration = 2900) {
  if (!state.ready || state.mode === "title" || state.mode === "creator" || state.mode === "loading") {
    notifyTitle(message);
    return;
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  el.dataset.serial = String(toastSerial += 1);
  dom.toastStack.appendChild(el);
  while (dom.toastStack.children.length > 3) dom.toastStack.firstElementChild.remove();
  window.setTimeout(() => {
    el.classList.add("out");
    window.setTimeout(() => el.remove(), 500);
  }, duration);
}

function showSubtitle(message, duration = 3800) {
  dom.subtitle.textContent = message;
  dom.subtitle.classList.add("show");
  clearTimeout(subtitleTimeout);
  subtitleTimeout = window.setTimeout(() => dom.subtitle.classList.remove("show"), duration);
}

function dismissTutorial() {
  if (state.tutorialDismissed) return;
  state.tutorialDismissed = true;
  dom.tutorial.classList.add("dismissed");
  window.setTimeout(() => dom.tutorial.classList.add("hidden"), 450);
}

function showTutorial() {
  state.tutorialDismissed = false;
  state.tutorialTimer = 0;
  dom.tutorial.classList.remove("hidden", "dismissed");
}

function hideLookCue() {
  dom.lookCue.classList.add("hidden-cue");
}

function setStatBar(el, value, max) {
  const ratio = clamp(max > 0 ? value / max : 0, 0, 1);
  el.style.width = `${ratio * 100}%`;
}

function saveGame(force = false) {
  if (!state.ready || !state.player || !state.options.name) return;
  const payload = {
    version: 1,
    options: { ...state.options },
    stage: state.stage,
    kills: state.kills,
    gold: state.gold,
    playTime: state.playTime,
    potions: state.player.potions,
    health: Math.round(state.player.health),
    position: { x: state.player.x, z: state.player.z },
    bossDefeated: state.bossDefeated,
    savedAt: Date.now(),
  };
  writeJSON(SAVE_KEY, payload);
  dom.btnContinue.disabled = false;
  state.saveDirty = false;
  if (force) state.lastSaveAt = state.playTime;
}

function hasSave() {
  return Boolean(readJSON(SAVE_KEY, null));
}

function setMode(mode) {
  state.mode = mode;
  updateTiltUI();
}

function resetJoystick() {
  state.joystick.active = false;
  state.joystick.pointerId = null;
  state.joystick.x = 0;
  state.joystick.y = 0;
  dom.joystickKnob.style.transform = "";
  dom.joystickZone.classList.remove("active");
}

function updateJoystickFromPointer(clientX, clientY) {
  const rect = dom.joystickZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const max = rect.width * 0.33;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const length = Math.hypot(dx, dy);
  if (length > max) {
    dx = (dx / length) * max;
    dy = (dy / length) * max;
  }
  dom.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  state.joystick.x = clamp(dx / max, -1, 1);
  state.joystick.y = clamp(dy / max, -1, 1);
}

function bindInput() {
  dom.joystickZone.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing") return;
    event.preventDefault();
    state.joystick.active = true;
    state.joystick.pointerId = event.pointerId;
    dom.joystickZone.classList.add("active");
    dom.joystickZone.setPointerCapture(event.pointerId);
    updateJoystickFromPointer(event.clientX, event.clientY);
    dismissTutorial();
  });
  dom.joystickZone.addEventListener("pointermove", (event) => {
    if (!state.joystick.active || event.pointerId !== state.joystick.pointerId) return;
    event.preventDefault();
    updateJoystickFromPointer(event.clientX, event.clientY);
  });
  const endJoystick = (event) => {
    if (event.pointerId !== state.joystick.pointerId) return;
    resetJoystick();
  };
  dom.joystickZone.addEventListener("pointerup", endJoystick);
  dom.joystickZone.addEventListener("pointercancel", endJoystick);
  dom.joystickZone.addEventListener("lostpointercapture", resetJoystick);

  dom.canvas.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing") return;
    if (event.pointerType !== "mouse" && event.clientX < innerWidth * 0.33) return;
    event.preventDefault();
    state.lookPointer = event.pointerId;
    state.lookLastX = event.clientX;
    state.lookLastY = event.clientY;
    dom.canvas.setPointerCapture(event.pointerId);
    dismissTutorial();
  });
  dom.canvas.addEventListener("pointermove", (event) => {
    if (state.mode !== "playing" || event.pointerId !== state.lookPointer) return;
    event.preventDefault();
    const dx = event.clientX - state.lookLastX;
    const dy = event.clientY - state.lookLastY;
    state.lookLastX = event.clientX;
    state.lookLastY = event.clientY;
    state.cameraYaw -= dx * 0.0058;
    state.cameraPitch = clamp(state.cameraPitch + dy * 0.0043, -0.16, 0.82);
    hideLookCue();
  });
  const endLook = (event) => {
    if (event.pointerId !== state.lookPointer) return;
    state.lookPointer = null;
  };
  dom.canvas.addEventListener("pointerup", endLook);
  dom.canvas.addEventListener("pointercancel", endLook);
  dom.canvas.addEventListener("lostpointercapture", () => { state.lookPointer = null; });
  dom.canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  window.addEventListener("keydown", (event) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(event.code) && state.mode !== "creator") {
      event.preventDefault();
    }
    state.keys.add(event.code);
    if (state.mode === "playing") {
      if (event.code === "Space") attack();
      if (event.code === "KeyQ") castSpell();
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") jump();
      if (event.code === "KeyE") interact();
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) dismissTutorial();
    }
    if (event.code === "Escape") {
      if (state.mode === "playing") pauseGame();
      else if (state.mode === "paused") resumeGame();
      else if (state.mode === "dialogue") advanceDialogue();
    }
  });
  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  window.addEventListener("blur", () => {
    state.keys.clear();
    resetJoystick();
  });
}

function handleOrientation(event) {
  if (!state.tiltEnabled) return;
  const angle = normalizeDegrees((screen.orientation && screen.orientation.angle) || window.orientation || 0);
  let raw;
  if (angle === 90 || angle === 270) {
    raw = event.beta;
    if (angle === 270) raw = raw == null ? raw : -raw;
  } else {
    raw = event.gamma;
    if (angle === 180) raw = raw == null ? raw : -raw;
  }
  if (raw == null || Number.isNaN(raw)) return;
  if (state.tiltCalibration == null) {
    state.tiltCalibration = raw;
    return;
  }
  let delta = raw - state.tiltCalibration;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  state.tiltTarget = clamp(delta / 26, -1, 1);
}

async function setTiltEnabled(enabled) {
  if (enabled) {
    if (typeof DeviceOrientationEvent === "undefined") {
      showToast("Motion sensors are not available on this device.");
      return;
    }
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") {
          showToast("Motion access was not granted.");
          if (state.mode === "paused") dom.pauseHint.textContent = "Motion access was denied. Touch controls still work.";
          return;
        }
      } catch {
        showToast("Motion permission needs a direct tap. Try again.");
        return;
      }
    }
    window.addEventListener("deviceorientation", handleOrientation, true);
    state.tiltEnabled = true;
    state.tiltCalibration = null;
    state.tiltTarget = 0;
    state.tiltSmoothed = 0;
    settings.tilt = true;
    writeJSON(SETTINGS_KEY, settings);
    showToast("Tilt steering on · hold naturally, then lean to look.");
    if (state.mode === "paused") dom.pauseHint.textContent = "Tilt is active. Lean left or right to turn your view.";
  } else {
    window.removeEventListener("deviceorientation", handleOrientation, true);
    state.tiltEnabled = false;
    state.tiltTarget = 0;
    state.tiltSmoothed = 0;
    state.tiltCalibration = null;
    settings.tilt = false;
    writeJSON(SETTINGS_KEY, settings);
    if (state.mode === "paused") dom.pauseHint.textContent = "Tilt is optional. Touch controls always work.";
  }
  updateTiltUI();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (!document.documentElement.requestFullscreen) throw new Error("unsupported");
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    showToast("Fullscreen is not available in this browser.");
  }
  updateFullscreenUI();
}

function bindGlobalEvents() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "playing") pauseGame();
  });
  document.addEventListener("fullscreenchange", updateFullscreenUI);
  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", () => window.setTimeout(handleResize, 240));
  setInterval(updateClockText, 1000);
}

function handleResize() {
  if (!renderer || !camera) return;
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  const portrait = camera.aspect < 0.82;
  const baseFov = portrait ? 66 : camera.aspect < 1.25 ? 62 : 58;
  state.cameraFov = baseFov;
  camera.fov = baseFov;
  camera.updateProjectionMatrix();
  if (state.mode === "playing" && portrait && !state.rotateHintShown) showRotateHint();
}

function showRotateHint() {
  state.rotateHintShown = true;
  dom.rotateHint.classList.remove("hidden");
  window.setTimeout(() => dom.rotateHint.classList.add("hidden"), 5200);
}

function hexColor(value) {
  return `#${value.toString(16).padStart(6, "0")}`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60).toString().padStart(2, "0");
  const secs = (total % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function questData() {
  switch (state.stage) {
    case 0: return { title: "Speak with Elder Mew", objective: "At the moon shrine", target: { x: worldLayout.elder.x, z: worldLayout.elder.z } };
    case 1: return { title: "Recover the Sunstone", objective: "Frostfang Barrow · north-east", target: { x: worldLayout.barrow.x, z: worldLayout.barrow.z } };
    case 2: return { title: "Defeat Frostfang", objective: "The Hollow King guards the Sunstone", target: { x: worldLayout.barrow.x, z: worldLayout.barrow.z } };
    case 3: return { title: "Claim the Sunstone", objective: "At the barrow's heart", target: { x: worldLayout.sunstone.x, z: worldLayout.sunstone.z } };
    case 4: return { title: "Return to Elder Mew", objective: "Whiskerhold · moon shrine", target: { x: worldLayout.elder.x, z: worldLayout.elder.z } };
    default: return { title: "The dawn returns", objective: "Whiskerhold is safe", target: null };
  }
}

function updateQuestCard() {
  const quest = questData();
  if (state.stage >= 5) {
    dom.questCard.classList.add("hidden");
    dom.compassQuest.style.opacity = "0";
    return;
  }
  dom.questCard.classList.remove("hidden");
  dom.compassQuest.style.opacity = "";
  dom.questTitle.textContent = quest.title;
  dom.questObjective.textContent = quest.objective;
}

function setStage(stage, options = {}) {
  const next = clamp(stage, 0, 5);
  if (next === state.stage && !options.force) return;
  state.stage = next;
  if (next >= 3) {
    state.bossDefeated = true;
    state.bossActive = false;
    dom.bossWrap.classList.add("hidden");
    if (state.boss) {
      state.boss.alive = false;
      state.boss.active = false;
    }
  }
  if (next >= 4) {
    if (world?.sunstone) world.sunstone.visible = false;
  } else if (world?.sunstone) {
    world.sunstone.visible = true;
  }
  if (next === 5) world?.setAurora(1.55);
  else world?.setAurora(1);
  updateQuestCard();
  if (state.mode === "playing") {
    saveGame(true);
    if (!options.silent) showToast(next === 1 ? "Quest started · The Last Moonstone" : next === 3 ? "Quest updated · Claim the Sunstone" : next === 4 ? "Quest updated · Return to Elder Mew" : "The north remembers");
  }
  if (next === 1) showSubtitle("The Last Moonstone", 4200);
  if (next === 3) showSubtitle("The Hollow King falls. The Sunstone is free.", 4600);
  if (next === 4) showSubtitle("The Sunstone is warm again.", 4200);
}

function getObjectivePosition() {
  const data = questData();
  return data.target;
}

function openDialogue(name, fur, lines, onDone) {
  if (!lines || !lines.length) return;
  state.dialogue = {
    name, fur, lines: [...lines], index: 0, chars: 0, timer: 0, typing: true, onDone,
  };
  resetJoystick();
  state.lookPointer = null;
  dom.dialogueLayer.classList.remove("hidden");
  dom.dialogueName.textContent = name;
  dom.dialoguePortrait.style.setProperty("--fur", fur);
  dom.dialogueText.textContent = "";
  setMode("dialogue");
  sound.meow();
  updateTiltUI();
  dismissTutorial();
}

function openNpcDialogue(npc) {
  openDialogue(npc.name, hexColor(npc.fur), npc.lines, null);
}

function openElderDialogue() {
  const elder = state.npcs.find((npc) => npc.quest);
  const fur = hexColor(elder ? elder.fur : 0x8f7a61);
  if (state.stage === 0) {
    openDialogue("Elder Mew", fur, [
      "You came. Even the snow seemed to hold its breath.",
      "The Sunstone — our warmth, our dawn — was taken from the shrine and buried in Frostfang Barrow.",
      "The Hollow King wears a cat's shape now, but there is no moon left in him. Bring our light home, little wanderer.",
    ], () => {
      setStage(1);
      sound.quest();
      showToast("Follow the lantern road north-east");
    });
  } else if (state.stage === 1 || state.stage === 2) {
    openDialogue("Elder Mew", fur, state.stage === 2 ? [
      "I felt the old bell turn over in its sleep. Frostfang is awake.",
      "Do not meet him with fear. Meet him with the moon's own light.",
    ] : [
      "The barrow lies north-east, beyond the pines and the frozen lake.",
      "Take the lantern road. And if the shades find you, remember: you have eight lives left.",
    ], null);
  } else if (state.stage === 4) {
    openDialogue("Elder Mew", fur, [
      "You carry the dawn in your paws. I knew the north had not forgotten us.",
      "Set it here, gently. Let the old stone remember what morning feels like.",
    ], () => {
      completeQuest();
    });
  } else if (state.stage === 5) {
    openDialogue("Elder Mew", fur, [
      "Listen. The pines are dripping again.",
      "There will be other roads, little wanderer. There always are.",
    ], null);
  } else {
    openDialogue("Elder Mew", fur, [
      "The Sunstone repels the hollow ones. Bring it to the shrine when your paws are ready.",
    ], null);
  }
}

function completeQuest() {
  if (state.stage >= 5) return;
  state.bossDefeated = true;
  setStage(5, { silent: true });
  dom.hud.classList.add("hidden");
  dom.victoryTime.textContent = formatDuration(state.playTime);
  dom.victoryFoes.textContent = String(state.kills);
  dom.victoryGold.textContent = String(state.gold);
  dom.victory.classList.remove("hidden");
  setMode("victory");
  sound.victory();
  world.setAurora(1.8);
  world.pulseShrine(2.4);
  saveGame(true);
}

function claimSunstone() {
  if (state.mode !== "playing") return;
  if (state.stage !== 3) {
    if (state.bossActive) showToast("The Hollow King's ward still holds.");
    return;
  }
  world.sunstone.visible = false;
  state.player.potions = Math.min(9, state.player.potions + 1);
  state.gold += 30;
  state.player.health = Math.min(state.player.maxHealth, state.player.health + 35);
  sound.quest();
  world.pulseShrine(1.5);
  showToast("Sunstone claimed · +30 gold · potion found");
  setStage(4);
}

function updateDialogue(dt) {
  const dialogue = state.dialogue;
  if (!dialogue) return;
  if (!dialogue.typing) return;
  const line = dialogue.lines[dialogue.index] || "";
  dialogue.timer += dt;
  const targetChars = Math.min(line.length, Math.floor(dialogue.timer * 47));
  if (targetChars !== dialogue.chars) {
    dialogue.chars = targetChars;
    dom.dialogueText.textContent = line.slice(0, dialogue.chars);
  }
  if (dialogue.chars >= line.length) {
    dialogue.typing = false;
    dom.dialogueText.textContent = line;
  }
}

function advanceDialogue() {
  const dialogue = state.dialogue;
  if (!dialogue) return;
  const line = dialogue.lines[dialogue.index] || "";
  if (dialogue.typing || dialogue.chars < line.length) {
    dialogue.typing = false;
    dialogue.chars = line.length;
    dom.dialogueText.textContent = line;
    return;
  }
  if (dialogue.index < dialogue.lines.length - 1) {
    dialogue.index += 1;
    dialogue.chars = 0;
    dialogue.timer = 0;
    dialogue.typing = true;
    dom.dialogueText.textContent = "";
    return;
  }
  const onDone = dialogue.onDone;
  state.dialogue = null;
  dom.dialogueLayer.classList.add("hidden");
  setMode("playing");
  sound.ui();
  if (typeof onDone === "function") onDone();
}

function nearestNpc() {
  let best = null;
  let bestDistance = Infinity;
  for (const npc of state.npcs) {
    const distance = Math.hypot(state.player.x - npc.x, state.player.z - npc.z);
    if (distance < 3.5 && distance < bestDistance) {
      best = npc;
      bestDistance = distance;
    }
  }
  return best;
}

function findInteractTarget() {
  const elder = state.npcs.find((npc) => npc.quest);
  if (elder) {
    const distance = Math.hypot(state.player.x - elder.x, state.player.z - elder.z);
    if (distance < 4.2 && (state.stage <= 1 || state.stage === 4 || state.stage === 5)) {
      return { kind: "elder", label: "Speak with Elder Mew", npc: elder };
    }
  }
  if (state.stage === 3) {
    const distance = Math.hypot(state.player.x - worldLayout.sunstone.x, state.player.z - worldLayout.sunstone.z);
    if (distance < 4.3) return { kind: "sunstone", label: "Claim the Sunstone" };
  }
  const npc = nearestNpc();
  if (npc) return { kind: "npc", label: `Speak with ${npc.name}`, npc };
  return null;
}

function updateInteractPrompt() {
  if (state.mode !== "playing") {
    dom.interactWrap.classList.add("hidden");
    state.interactTarget = null;
    return;
  }
  const target = findInteractTarget();
  state.interactTarget = target;
  if (target) {
    dom.interactLabel.textContent = target.label;
    dom.interactWrap.classList.remove("hidden");
  } else {
    dom.interactWrap.classList.add("hidden");
  }
}

function interact() {
  if (state.mode !== "playing") return;
  const target = state.interactTarget || findInteractTarget();
  if (!target) return;
  sound.ui();
  if (target.kind === "elder") openElderDialogue();
  else if (target.kind === "sunstone") claimSunstone();
  else if (target.kind === "npc") openNpcDialogue(target.npc);
}

function addFloater(position, text, type = "damage") {
  const el = document.createElement("div");
  el.className = `float-text ${type}`;
  el.textContent = text;
  dom.app.appendChild(el);
  state.floaters.push({ el, position: position.clone(), life: 0.95, maxLife: 0.95, drift: Math.random() * 0.4 - 0.2 });
}

function updateFloaters(dt) {
  const width = innerWidth;
  const height = innerHeight;
  for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
    const floater = state.floaters[i];
    floater.life -= dt;
    if (floater.life <= 0) {
      floater.el.remove();
      state.floaters.splice(i, 1);
      continue;
    }
    const projected = floater.position.clone().project(camera);
    if (projected.z > 1 || projected.z < -1) {
      floater.el.style.opacity = "0";
      continue;
    }
    const x = (projected.x * 0.5 + 0.5) * width + floater.drift * 40;
    const y = (-projected.y * 0.5 + 0.5) * height - (1 - floater.life / floater.maxLife) * 34;
    if (x < -28 || x > width + 28 || y < -28 || y > height + 28) {
      floater.el.style.opacity = "0";
      continue;
    }
    floater.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    floater.el.style.opacity = String(clamp(floater.life / 0.34, 0, 1));
  }
}

function spawnBurst(position, color = 0x9ef7ef, count = 14, power = 4, size = 0.17) {
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(1 - Math.random() * 1.2);
    const speed = power * (0.35 + Math.random() * 0.95);
    velocities.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.cos(phi) * speed * 0.9 + 0.8,
      Math.sin(phi) * Math.sin(theta) * speed,
    ));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color, size, map: glowTexture, transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.position.copy(position);
  scene.add(points);
  let life = 0.6;
  const effect = {
    update(dt) {
      life -= dt;
      const attr = geometry.attributes.position;
      for (let i = 0; i < count; i += 1) {
        const velocity = velocities[i];
        velocity.y -= 9 * dt;
        attr.setXYZ(i, attr.getX(i) + velocity.x * dt, attr.getY(i) + velocity.y * dt, attr.getZ(i) + velocity.z * dt);
      }
      attr.needsUpdate = true;
      material.opacity = clamp(life / 0.6, 0, 1);
      if (life <= 0) {
        scene.remove(points);
        geometry.dispose();
        material.dispose();
        return true;
      }
      return false;
    },
  };
  state.effects.push(effect);
}

function spawnRing(position, color = 0x8ff8f1, maxScale = 6, duration = 0.65) {
  const geometry = new THREE.RingGeometry(0.36, 0.58, 36);
  const material = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(position);
  mesh.position.y += 0.08;
  scene.add(mesh);
  let life = duration;
  state.effects.push({
    update(dt) {
      life -= dt;
      const progress = 1 - clamp(life / duration, 0, 1);
      mesh.scale.setScalar(1 + progress * maxScale);
      material.opacity = (1 - progress) * 0.72;
      if (life <= 0) {
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        return true;
      }
      return false;
    },
  });
}

function spawnSlash() {
  const geometry = new THREE.RingGeometry(0.72, 1.24, 28, 1, -0.85, 1.7);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffe2a3, transparent: true, opacity: 0.68, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const forwardX = -Math.sin(state.player.facing);
  const forwardZ = -Math.cos(state.player.facing);
  mesh.position.set(
    state.player.x + forwardX * 0.95,
    state.player.y + 0.85,
    state.player.z + forwardZ * 0.95,
  );
  mesh.rotation.set(-Math.PI / 2, 0, state.player.facing + Math.PI * 0.08);
  scene.add(mesh);
  let life = 0.23;
  state.effects.push({
    update(dt) {
      life -= dt;
      mesh.scale.setScalar(1 + (1 - life / 0.23) * 0.5);
      material.opacity = (life / 0.23) * 0.62;
      if (life <= 0) {
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        return true;
      }
      return false;
    },
  });
}

function spawnHeal() {
  spawnBurst(new THREE.Vector3(state.player.x, state.player.y + 1, state.player.z), 0x88f0b0, 20, 2.6, 0.16);
  spawnRing(new THREE.Vector3(state.player.x, state.player.y, state.player.z), 0x8ef4bc, 3.2, 0.8);
}

function nearestEnemy(range = 30, requireCone = false) {
  let best = null;
  let bestDistance = Infinity;
  const forwardX = -Math.sin(state.cameraYaw);
  const forwardZ = -Math.cos(state.cameraYaw);
  for (const enemy of state.enemies) {
    if (!enemy.alive || (enemy.boss && !state.bossActive)) continue;
    const dx = enemy.x - state.player.x;
    const dz = enemy.z - state.player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > range || distance >= bestDistance) continue;
    if (requireCone) {
      const dot = (dx / (distance || 1)) * forwardX + (dz / (distance || 1)) * forwardZ;
      if (dot < 0.25) continue;
    }
    bestDistance = distance;
    best = enemy;
  }
  return best;
}

function attack() {
  const player = state.player;
  if (state.mode !== "playing" || player.attackCooldown > 0 || player.attackTimer > 0) return;
  dismissTutorial();
  player.attackCooldown = 0.46;
  player.attackTimer = 0.4;
  player.attackHitPending = true;
  player.attackHitDelay = 0.15;
  playerCat.attack(0.4);
  sound.sword();
  const target = nearestEnemy(5.2);
  if (target) {
    player.facing = Math.atan2(-(target.x - player.x), -(target.z - player.z));
  } else {
    player.facing = state.cameraYaw;
  }
  state.shake = Math.max(state.shake, 0.035);
  dom.btnAttack.classList.remove("pulse");
  void dom.btnAttack.offsetWidth;
  dom.btnAttack.classList.add("pulse");
}

function resolveSwordHit() {
  const player = state.player;
  const forwardX = -Math.sin(player.facing);
  const forwardZ = -Math.cos(player.facing);
  spawnSlash();
  let hit = false;
  for (const enemy of state.enemies) {
    if (!enemy.alive || (enemy.boss && !state.bossActive)) continue;
    const dx = enemy.x - player.x;
    const dz = enemy.z - player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > (enemy.boss ? 4.0 : 3.25)) continue;
    const dot = (dx / (distance || 1)) * forwardX + (dz / (distance || 1)) * forwardZ;
    if (dot < 0.02) continue;
    const critChance = state.options.classKey === "rogue" ? 0.31 : 0.14;
    const critical = Math.random() < critChance;
    let amount = playerClass().damage * (0.9 + Math.random() * 0.18);
    if (critical) amount *= 1.8;
    damageEnemy(enemy, Math.round(amount), { critical, source: "sword" });
    hit = true;
  }
  if (hit) {
    state.shake = Math.max(state.shake, 0.12);
    sound.hit();
  }
}

function castSpell() {
  const player = state.player;
  if (state.mode !== "playing" || player.spellCooldown > 0) return;
  const cls = playerClass();
  if (player.magicka < cls.spellCost) {
    if (performance.now() - (player.lastNoManaAt || 0) > 1600) {
      player.lastNoManaAt = performance.now();
      showToast("Not enough magicka. Let the moon catch its breath.");
    }
    return;
  }
  dismissTutorial();
  player.magicka -= cls.spellCost;
  player.spellCooldown = 0.82;
  playerCat.attack(0.34);
  sound.spell();

  const target = nearestEnemy(27, true);
  const origin = new THREE.Vector3(
    player.x - Math.sin(state.cameraYaw) * 0.65,
    player.y + 1.15,
    player.z - Math.cos(state.cameraYaw) * 0.65,
  );
  let direction;
  if (target) {
    direction = new THREE.Vector3(target.x - origin.x, target.y + 1.05 - origin.y, target.z - origin.z).normalize();
  } else {
    direction = new THREE.Vector3(-Math.sin(state.cameraYaw), -0.02, -Math.cos(state.cameraYaw)).normalize();
  }

  const group = new THREE.Group();
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 1),
    new THREE.MeshBasicMaterial({ color: 0xb9fbf6, toneMapped: false }),
  );
  group.add(orb);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: 0x6fe8e0, transparent: true, opacity: 0.82,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.set(1.5, 1.5, 1);
  group.add(halo);
  group.position.copy(origin);
  scene.add(group);
  state.projectiles.push({
    group, position: origin.clone(), velocity: direction.multiplyScalar(20),
    life: 1.65, damage: state.options.classKey === "mage" ? 44 : 37, radius: 4.0,
  });
  spawnBurst(origin, 0x7ff0eb, 8, 1.8, 0.12);
}

function createExplosion(position, damage, radius) {
  spawnBurst(position, 0xa8fffa, 26, 6.5, 0.22);
  spawnRing(position, 0x7ef0ea, 8.5, 0.7);
  sound.explode();
  state.shake = Math.max(state.shake, 0.24);
  for (const enemy of state.enemies) {
    if (!enemy.alive || (enemy.boss && !state.bossActive)) continue;
    const distance = Math.hypot(enemy.x - position.x, enemy.z - position.z);
    if (distance > radius) continue;
    const falloff = 1 - clamp(distance / radius, 0, 1) * 0.45;
    damageEnemy(enemy, Math.round(damage * falloff), { source: "spell" });
  }
}

function damageEnemy(enemy, amount, options = {}) {
  if (!enemy.alive) return;
  enemy.health = Math.max(0, enemy.health - amount);
  enemy.aggroActive = true;
  enemy.cat.flash(options.critical ? 1.4 : 1);
  const hitPosition = new THREE.Vector3(enemy.x, enemy.y + 1.3 * enemy.cat.scale, enemy.z);
  addFloater(hitPosition, `${options.critical ? "✦" : ""}${amount}`, options.critical ? "crit" : "damage");
  spawnBurst(hitPosition, options.source === "spell" ? 0x8ff9f2 : 0xfff0c5, options.critical ? 18 : 11, 3.2, 0.13);
  if (enemy.bar) {
    const ratio = enemy.health / enemy.maxHealth;
    if (Math.abs(ratio - enemy.bar.lastRatio) > 0.01) {
      enemy.bar.draw(ratio);
      enemy.bar.lastRatio = ratio;
    }
  }
  if (enemy.boss) {
    dom.bossFill.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
    dom.bossHp.textContent = String(Math.ceil(enemy.health));
  }
  if (enemy.health <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  if (!enemy.alive) return;
  enemy.alive = false;
  enemy.aggroActive = false;
  enemy.deathTimer = enemy.boss ? 1.8 : 1.1;
  enemy.cat.root.rotation.z = 0;
  if (enemy.bar) {
    enemy.bar.sprite.material.opacity = 0;
  }
  const hitPosition = new THREE.Vector3(enemy.x, enemy.y + 1.2, enemy.z);
  spawnBurst(hitPosition, enemy.boss ? 0xffc77c : 0xb88cff, enemy.boss ? 50 : 22, enemy.boss ? 9 : 4.6, enemy.boss ? 0.3 : 0.16);
  spawnRing(new THREE.Vector3(enemy.x, enemy.y, enemy.z), enemy.boss ? 0xffcf85 : 0x9b80db, enemy.boss ? 12 : 5, 0.8);
  state.kills += 1;
  const reward = enemy.boss ? 80 : 8 + Math.floor(Math.random() * 8);
  state.gold += reward;
  addFloater(hitPosition, `+${reward} gold`, "gold");
  const newLevel = 1 + Math.floor(state.kills / 3);
  if (newLevel > state.player.level) {
    state.player.level = newLevel;
    showToast(`Level ${newLevel} · the north takes notice`);
    sound.quest();
  }
  if (enemy.boss) {
    state.bossActive = false;
    state.bossDefeated = true;
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 30);
    setStage(3);
    showToast("Frostfang is vanquished");
    sound.victory();
    state.shake = 0.3;
    world.setAurora(1.25);
  } else {
    sound.hit();
  }
}

function jump() {
  const player = state.player;
  if (state.mode !== "playing" || !player.grounded || player.stamina < 12) return;
  player.jumpVelocity = 5.3;
  player.grounded = false;
  player.stamina = Math.max(0, player.stamina - 12);
  sound.noise({ duration: 0.16, volume: 0.04, frequency: 700, type: "bandpass", Q: 1.1, sweep: 1600 });
  dismissTutorial();
}

function usePotion() {
  const player = state.player;
  if (state.mode !== "playing") return;
  if (player.potions <= 0) {
    showToast("No potions left. The road is long.");
    return;
  }
  if (player.health >= player.maxHealth - 0.5) {
    showToast("Already at full health.");
    return;
  }
  player.potions -= 1;
  player.health = Math.min(player.maxHealth, player.health + 46);
  addFloater(new THREE.Vector3(player.x, player.y + 1.8, player.z), "+46", "heal");
  spawnHeal();
  sound.heal();
  dom.potionCount.textContent = String(player.potions);
}

function damagePlayer(amount) {
  const player = state.player;
  if (state.mode !== "playing" || player.invuln > 0) return;
  player.health = Math.max(0, player.health - amount);
  player.invuln = 0.72;
  player.lastDamageAt = state.playTime;
  state.shake = Math.max(state.shake, 0.25);
  addFloater(new THREE.Vector3(player.x, player.y + 2.05, player.z), `-${amount}`, "player-damage");
  spawnBurst(new THREE.Vector3(player.x, player.y + 1.05, player.z), 0xd95566, 13, 3.2, 0.14);
  dom.damageVignette.classList.add("hit");
  window.setTimeout(() => dom.damageVignette.classList.remove("hit"), 160);
  sound.hit();
  if (player.health <= 0) die();
}

function die() {
  if (state.mode !== "playing") return;
  setMode("dead");
  resetJoystick();
  state.lookPointer = null;
  state.deathTimer = 0;
  state.player.health = 0;
  dom.interactWrap.classList.add("hidden");
  sound.death();
  sound.setPaused(true);
  window.setTimeout(() => {
    if (state.mode === "dead") dom.death.classList.remove("hidden");
  }, 520);
}

function respawn() {
  if (respawnBusy) return;
  respawnBusy = true;
  dom.death.classList.add("hidden");
  dom.fader.classList.add("visible");
  window.setTimeout(() => {
    const p = state.player;
    p.x = worldLayout.shrine.x;
    p.z = worldLayout.shrine.z + 10;
    p.y = groundAt(p.x, p.z);
    p.facing = 0;
    p.health = p.maxHealth;
    p.magicka = p.maxMagicka;
    p.stamina = p.maxStamina;
    p.jumpOffset = 0;
    p.jumpVelocity = 0;
    p.grounded = true;
    p.invuln = 1.5;
    p.attackTimer = 0;
    p.attackCooldown = 0;
    p.spellCooldown = 0;
    playerCat.root.position.set(p.x, p.y, p.z);
    playerCat.root.rotation.set(0, 0, 0);
    playerCat.visual.rotation.set(0, 0, 0);
    snapGameCamera();
    if (state.boss && state.boss.alive) {
      state.boss.health = state.boss.maxHealth;
      state.boss.active = false;
      state.boss.aggroActive = false;
      state.boss.attackCooldown = 0;
      state.boss.windup = 0;
      state.boss.windupActive = false;
      state.boss.cat.root.visible = false;
      dom.bossFill.style.width = "100%";
    }
    state.bossActive = false;
    dom.bossWrap.classList.add("hidden");
    setMode("playing");
    updateQuestCard();
    sound.setPaused(false);
    dom.fader.classList.remove("visible");
    showToast("The shrine pulls you back from the frost");
    respawnBusy = false;
  }, 480);
}

function triggerBoss() {
  if (state.bossActive || !state.boss || !state.boss.alive || state.stage >= 3) return;
  setStage(2, { silent: true });
  state.bossActive = true;
  state.boss.health = state.boss.maxHealth;
  state.boss.active = true;
  state.boss.aggroActive = true;
  state.boss.cat.root.visible = true;
  state.boss.cat.root.position.set(state.boss.x, groundAt(state.boss.x, state.boss.z), state.boss.z);
  state.boss.y = state.boss.cat.root.position.y;
  dom.bossFill.style.width = "100%";
  dom.bossHp.textContent = String(state.boss.maxHealth);
  dom.bossWrap.classList.remove("hidden");
  dom.questCard.classList.add("hidden");
  sound.roar();
  state.shake = 0.5;
  world.setAurora(0.85);
  showSubtitle("FROSTFANG, THE HOLLOW KING", 5000);
  showToast("A hollow roar rolls off the barrow");
}

function createQuestMarker() {
  const group = new THREE.Group();
  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshBasicMaterial({ color: 0xffd27c, transparent: true, opacity: 0.9, toneMapped: false }),
  );
  group.add(diamond);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.025, 5, 28),
    new THREE.MeshBasicMaterial({ color: 0xffcf72, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: 0xffc65f, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.set(3.4, 3.4, 1);
  group.add(halo);
  group.visible = false;
  scene.add(group);
  state.marker = { group, diamond, ring, halo };
}

function updateQuestMarker(dt, time) {
  if (!state.marker) return;
  const objective = state.mode === "playing" || state.mode === "paused" || state.mode === "dialogue" ? getObjectivePosition() : null;
  if (!objective || state.stage >= 5 || state.mode === "dead" || state.mode === "victory") {
    state.marker.group.visible = false;
    return;
  }
  const x = objective.x;
  const z = objective.z;
  const y = groundAt(x, z) + 3.25 + Math.sin(time * 1.45) * 0.18;
  state.marker.group.visible = true;
  state.marker.group.position.set(x, y, z);
  state.marker.diamond.rotation.y = time * 0.85;
  state.marker.ring.rotation.z = time * 0.4;
  state.marker.ring.scale.setScalar(1 + Math.sin(time * 1.6) * 0.08);
  state.marker.halo.material.opacity = 0.32 + Math.sin(time * 2.2) * 0.08;
}

function readMoveInput() {
  let x = state.joystick.x;
  let forward = -state.joystick.y;
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) x -= 1;
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) x += 1;
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) forward += 1;
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) forward -= 1;
  const magnitude = Math.hypot(x, forward);
  if (magnitude > 1) {
    x /= magnitude;
    forward /= magnitude;
  }
  return { x, forward, magnitude: Math.min(1, magnitude) };
}

function updatePlayer(dt, time) {
  const p = state.player;
  const cls = playerClass();
  const input = readMoveInput();
  const joystickMagnitude = Math.hypot(state.joystick.x, state.joystick.y);
  const wantsSprint = (state.joystick.active && joystickMagnitude > 0.91) || state.keys.has("ControlLeft") || state.keys.has("ControlRight");
  p.sprinting = wantsSprint && input.magnitude > 0.2 && p.stamina > 0.5 && p.grounded;
  const speed = cls.speed * (p.sprinting ? 1.34 : 1);

  if (p.sprinting) {
    p.stamina = Math.max(0, p.stamina - 13.5 * dt);
    if (p.stamina <= 0) p.sprinting = false;
  } else {
    p.stamina = Math.min(p.maxStamina, p.stamina + 12.5 * dt);
  }

  p.moving = input.magnitude > 0.08;
  const prevX = p.x;
  const prevZ = p.z;
  if (p.moving) {
    const rightX = Math.cos(state.cameraYaw);
    const rightZ = -Math.sin(state.cameraYaw);
    const forwardX = -Math.sin(state.cameraYaw);
    const forwardZ = -Math.cos(state.cameraYaw);
    let dx = rightX * input.x + forwardX * input.forward;
    let dz = rightZ * input.x + forwardZ * input.forward;
    const length = Math.hypot(dx, dz) || 1;
    dx /= length;
    dz /= length;
    p.x += dx * speed * input.magnitude * dt;
    p.z += dz * speed * input.magnitude * dt;
    const targetFacing = Math.atan2(-dx, -dz);
    p.facing = dampAngle(p.facing, targetFacing, 13, dt);
    p.moveTime = (p.moveTime || 0) + dt;
    p.stepTimer = (p.stepTimer || 0) - dt;
    if (p.stepTimer <= 0) {
      sound.footstep(true);
      p.stepTimer = p.sprinting ? 0.215 : 0.31;
    }
    if (p.moveTime > 2.4) dismissTutorial();
  } else {
    p.moveTime = 0;
    p.stepTimer = 0;
    p.facing = dampAngle(p.facing, p.facing, 1, dt);
  }

  const radius = 132;
  const worldDistance = Math.hypot(p.x, p.z);
  if (worldDistance > radius) {
    p.x = (p.x / worldDistance) * radius;
    p.z = (p.z / worldDistance) * radius;
  }

  for (const collider of world.colliders) {
    if (collider.low) continue;
    const dx = p.x - collider.x;
    const dz = p.z - collider.z;
    const distance = Math.hypot(dx, dz);
    const minimum = collider.radius + 0.48;
    if (distance < minimum && distance > 0.0001) {
      p.x = collider.x + (dx / distance) * minimum;
      p.z = collider.z + (dz / distance) * minimum;
    }
  }

  if (!p.grounded) {
    p.jumpVelocity -= 15.5 * dt;
    p.jumpOffset += p.jumpVelocity * dt;
    if (p.jumpOffset <= 0) {
      p.jumpOffset = 0;
      p.jumpVelocity = 0;
      p.grounded = true;
      sound.footstep(true);
    }
  }
  const newGround = groundAt(p.x, p.z);
  if (newGround < -1.72) {
    p.x = prevX;
    p.z = prevZ;
  }
  p.y = groundAt(p.x, p.z) + p.jumpOffset;
  playerCat.root.position.set(p.x, p.y, p.z);
  playerCat.root.rotation.y = p.facing;

  p.attackCooldown = Math.max(0, p.attackCooldown - dt);
  p.spellCooldown = Math.max(0, p.spellCooldown - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  if (p.attackTimer > 0) p.attackTimer = Math.max(0, p.attackTimer - dt);
  if (p.attackHitPending) {
    p.attackHitDelay -= dt;
    if (p.attackHitDelay <= 0) {
      p.attackHitPending = false;
      resolveSwordHit();
    }
  }

  const regenMultiplier = state.stage >= 2 ? 1.15 : 1;
  p.magicka = Math.min(p.maxMagicka, p.magicka + cls.magickaRegen * regenMultiplier * dt);
  if (state.playTime - p.lastDamageAt > 9.5 && p.health < p.maxHealth) {
    p.health = Math.min(p.maxHealth, p.health + 1.35 * dt);
  }
  playerCat.update(dt, time, p.moving, speed);

  if (state.tiltEnabled) {
    state.tiltSmoothed = damp(state.tiltSmoothed, state.tiltTarget, 7, dt);
    if (Math.abs(state.tiltSmoothed) > 0.045) {
      state.cameraYaw -= state.tiltSmoothed * 1.25 * dt;
    }
  }

  if (state.stage === 1) {
    const bossDistance = Math.hypot(p.x - worldLayout.barrow.x, p.z - worldLayout.barrow.z);
    if (bossDistance < 22) triggerBoss();
  }
}

function updateEnemy(enemy, dt, time, combatEnabled) {
  if (!enemy.alive) {
    if (enemy.deathTimer > 0) {
      enemy.deathTimer -= dt;
      const ratio = clamp(enemy.deathTimer / (enemy.boss ? 1.8 : 1.1), 0, 1);
      enemy.cat.root.scale.setScalar(Math.max(0.02, ratio));
      enemy.cat.root.rotation.z += dt * 2.4;
      enemy.cat.root.position.y = groundAt(enemy.x, enemy.z) + (1 - ratio) * 0.4;
      if (enemy.deathTimer <= 0) enemy.cat.root.visible = false;
    }
    return;
  }
  if (enemy.boss && !state.bossActive) return;

  const player = state.player;
  const dx = player.x - enemy.x;
  const dz = player.z - enemy.z;
  const distance = Math.hypot(dx, dz);
  const playerForwardX = -Math.sin(player.facing);
  const playerForwardZ = -Math.cos(player.facing);
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
  enemy.specialCooldown = Math.max(0, enemy.specialCooldown - dt);

  if (combatEnabled && distance < enemy.aggro && !enemy.aggroActive) {
    enemy.aggroActive = true;
    if (enemy.boss) sound.roar();
  }
  if (combatEnabled && enemy.aggroActive && distance > 27 && !enemy.boss) {
    enemy.aggroActive = false;
  }

  let moving = false;
  let targetFacing = enemy.cat.root.rotation.y;
  if (combatEnabled && enemy.aggroActive) {
    targetFacing = Math.atan2(-dx, -dz);
    if (enemy.boss && distance < 8.5 && enemy.specialCooldown <= 0) {
      enemy.specialCooldown = 7.2;
      enemy.cat.swipe(0.6);
      sound.roar();
      state.shake = Math.max(state.shake, 0.45);
      spawnRing(new THREE.Vector3(enemy.x, enemy.y, enemy.z), 0xff7b8a, 9, 0.7);
      if (distance < 6.6) damagePlayer(Math.round(enemy.damage * 0.9));
    }
    if (distance > enemy.attackRange) {
      const step = enemy.speed * dt;
      enemy.x += (dx / (distance || 1)) * step;
      enemy.z += (dz / (distance || 1)) * step;
      enemy.y = groundAt(enemy.x, enemy.z);
      moving = true;
    } else if (enemy.windupActive) {
      enemy.windup -= dt;
      if (enemy.windup <= 0) {
        enemy.windupActive = false;
        const currentDistance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
        if (currentDistance < enemy.attackRange + 0.6 && state.mode === "playing") {
          damagePlayer(enemy.damage);
        }
      }
    } else if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = enemy.boss ? 1.7 : 1.42;
      enemy.windup = enemy.boss ? 0.48 : 0.32;
      enemy.windupActive = true;
      enemy.cat.swipe(enemy.boss ? 0.55 : 0.44);
    }
  } else if (!enemy.boss) {
    const homeDx = enemy.spawnX - enemy.x;
    const homeDz = enemy.spawnZ - enemy.z;
    const homeDistance = Math.hypot(homeDx, homeDz);
    if (homeDistance > 0.5) {
      enemy.x += (homeDx / homeDistance) * enemy.speed * 0.42 * dt;
      enemy.z += (homeDz / homeDistance) * enemy.speed * 0.42 * dt;
      enemy.y = groundAt(enemy.x, enemy.z);
      moving = true;
      targetFacing = Math.atan2(-homeDx, -homeDz);
    }
    if (enemy.health < enemy.maxHealth && distance > 25) {
      enemy.health = Math.min(enemy.maxHealth, enemy.health + 1.6 * dt);
      if (enemy.bar) {
        const ratio = enemy.health / enemy.maxHealth;
        enemy.bar.draw(ratio);
        enemy.bar.lastRatio = ratio;
      }
    }
  }

  enemy.cat.root.position.set(enemy.x, enemy.y, enemy.z);
  enemy.cat.root.rotation.y = dampAngle(enemy.cat.root.rotation.y, targetFacing, 8, dt);
  enemy.cat.update(dt, time, moving, enemy.speed * (moving ? 1 : 0));
  if (enemy.bar) {
    const show = combatEnabled && (enemy.aggroActive || enemy.health < enemy.maxHealth) && distance < 23;
    enemy.bar.sprite.material.opacity = damp(enemy.bar.sprite.material.opacity, show ? 1 : 0, 8, dt);
    enemy.bar.sprite.visible = enemy.bar.sprite.material.opacity > 0.01;
  }
}

function updateEnemies(dt, time) {
  const combatEnabled = state.mode === "playing";
  for (const enemy of state.enemies) updateEnemy(enemy, dt, time, combatEnabled);
}

function updateNpcs(dt, time) {
  for (const npc of state.npcs) {
    const dx = state.player.x - npc.x;
    const dz = state.player.z - npc.z;
    const distance = Math.hypot(dx, dz);
    let yaw = npc.baseYaw + Math.sin(time * 0.23 + npc.phase) * 0.08;
    if (distance < 7.5 && state.mode !== "title" && state.mode !== "creator") {
      yaw = Math.atan2(-dx, -dz);
    }
    npc.cat.root.rotation.y = dampAngle(npc.cat.root.rotation.y, yaw, 2.4, dt);
    npc.cat.update(dt, time + npc.phase, false, 0);
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.life -= dt;
    projectile.position.addScaledVector(projectile.velocity, dt);
    projectile.group.position.copy(projectile.position);
    projectile.group.rotation.y += dt * 8;
    let explode = false;
    for (const enemy of state.enemies) {
      if (!enemy.alive || (enemy.boss && !state.bossActive)) continue;
      const distance = Math.hypot(projectile.position.x - enemy.x, projectile.position.z - enemy.z);
      if (distance < (enemy.boss ? 1.55 : 1.1) && Math.abs(projectile.position.y - (enemy.y + 1.0)) < 1.8) {
        explode = true;
        break;
      }
    }
    if (projectile.position.y <= groundAt(projectile.position.x, projectile.position.z) + 0.15) explode = true;
    if (projectile.life <= 0) explode = true;
    if (explode) {
      createExplosion(projectile.position, projectile.damage, projectile.radius);
      scene.remove(projectile.group);
      projectile.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      state.projectiles.splice(i, 1);
    }
  }
}

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    if (state.effects[i].update(dt)) state.effects.splice(i, 1);
  }
}

function cameraDistanceFactor(targetX, targetZ, dirX, dirZ, horizontalDistance, cameraY) {
  if (!world || horizontalDistance < 1 || cameraY > 6.4) return 1;
  let factor = 1;
  const blockers = world.cameraBlockers || world.colliders;
  for (const blocker of blockers) {
    const ox = blocker.x - targetX;
    const oz = blocker.z - targetZ;
    const along = ox * dirX + oz * dirZ;
    if (along <= 0.85 || along >= horizontalDistance) continue;
    const perpendicular = Math.abs(ox * dirZ - oz * dirX);
    const clearance = blocker.radius + 0.5;
    if (perpendicular >= clearance) continue;
    const halfChord = Math.sqrt(Math.max(0, clearance * clearance - perpendicular * perpendicular));
    const safeAlong = along - halfChord - 0.45;
    const pull = Math.max(0.24, safeAlong / horizontalDistance);
    if (pull < factor) factor = pull;
  }
  return factor;
}

function snapGameCamera() {
  const p = state.player;
  const target = new THREE.Vector3(p.x, p.y + 1.28, p.z);
  const cosPitch = Math.cos(state.cameraPitch);
  const dirX = Math.sin(state.cameraYaw);
  const dirZ = Math.cos(state.cameraYaw);
  const rawY = target.y + Math.sin(state.cameraPitch) * state.cameraDistance + 0.18;
  const factor = cameraDistanceFactor(target.x, target.z, dirX, dirZ, state.cameraDistance * cosPitch, rawY);
  const distance = state.cameraDistance * factor;
  camera.position.set(
    target.x + dirX * cosPitch * distance,
    target.y + Math.sin(state.cameraPitch) * distance + 0.18,
    target.z + dirZ * cosPitch * distance,
  );
  const forwardX = -Math.sin(state.cameraYaw);
  const forwardZ = -Math.cos(state.cameraYaw);
  camera.lookAt(target.x + forwardX * 1.1, target.y + 0.12, target.z + forwardZ * 1.1);
}

function updateGameCamera(dt, time) {
  const p = state.player;
  const target = new THREE.Vector3(p.x, p.y + 1.26, p.z);
  const bossZoom = state.bossActive ? 0.75 : 0;
  const distance = state.cameraDistance + bossZoom;
  const cosPitch = Math.cos(state.cameraPitch);
  const dirX = Math.sin(state.cameraYaw);
  const dirZ = Math.cos(state.cameraYaw);
  const rawY = target.y + Math.sin(state.cameraPitch) * distance + 0.2;
  const factor = cameraDistanceFactor(target.x, target.z, dirX, dirZ, distance * cosPitch, rawY);
  const safeDistance = distance * factor;
  const desiredX = target.x + dirX * cosPitch * safeDistance;
  const desiredZ = target.z + dirZ * cosPitch * safeDistance;
  const desiredY = target.y + Math.sin(state.cameraPitch) * safeDistance + 0.2;
  const floor = groundAt(desiredX, desiredZ) + 1.05;
  const desired = new THREE.Vector3(desiredX, Math.max(desiredY, floor), desiredZ);
  const lambda = state.mode === "title" ? 2.4 : 8.5;
  camera.position.lerp(desired, 1 - Math.exp(-lambda * dt));
  const forwardX = -Math.sin(state.cameraYaw);
  const forwardZ = -Math.cos(state.cameraYaw);
  const look = new THREE.Vector3(target.x + forwardX * 1.15, target.y + 0.1, target.z + forwardZ * 1.15);
  camera.lookAt(look);
  if (state.shake > 0.001) {
    const shake = state.shake;
    camera.position.x += (Math.random() - 0.5) * shake * 0.5;
    camera.position.y += (Math.random() - 0.5) * shake * 0.32;
    camera.position.z += (Math.random() - 0.5) * shake * 0.5;
    state.shake = Math.max(0, state.shake - dt * 1.8);
  }
  const portrait = camera.aspect < 0.82;
  const baseFov = portrait ? 66 : camera.aspect < 1.25 ? 62 : 58;
  const targetFov = baseFov + (state.player.sprinting ? 2.2 : 0);
  camera.fov = damp(camera.fov, targetFov, 4.5, dt);
  camera.updateProjectionMatrix();
}

function updateTitleCamera(dt, time) {
  titleOrbit += dt * 0.035;
  const p = state.player;
  const orbit = 0.18 + Math.sin(titleOrbit) * 0.24;
  const radius = 10.2;
  const targetY = groundAt(p.x, p.z) + 1.25;
  const desired = new THREE.Vector3(
    p.x + Math.sin(orbit) * radius,
    targetY + 4.1,
    p.z + Math.cos(orbit) * radius,
  );
  camera.position.lerp(desired, 1 - Math.exp(-2.1 * dt));
  camera.lookAt(p.x - 3.4, targetY + 0.45, p.z - 1.0);
  playerCat.root.rotation.y = Math.PI + orbit + Math.sin(time * 0.27) * 0.08;
  playerCat.update(dt, time, false, 0);
  const portrait = camera.aspect < 0.82;
  camera.fov = damp(camera.fov, portrait ? 68 : 55, 2.4, dt);
  camera.updateProjectionMatrix();
}

function updateCompass() {
  const heading = normalizeDegrees((-state.cameraYaw * 180) / Math.PI);
  const half = dom.compass.clientWidth * 0.5 || 190;
  const pixelsPerDegree = half / 82;
  for (const item of state.compassLabels) {
    const delta = signedDegrees(item.bearing - heading);
    const x = half + delta * pixelsPerDegree;
    item.el.style.left = `${x}px`;
    if (item.tick) {
      item.el.style.opacity = Math.abs(delta) < 82 ? "0.28" : "0";
    } else {
      item.el.style.opacity = Math.abs(delta) < 82 ? "" : "0";
    }
  }
  const objective = getObjectivePosition();
  if (!objective || state.stage >= 5) {
    dom.compassQuest.style.opacity = "0";
    return;
  }
  dom.compassQuest.style.opacity = "";
  const dx = objective.x - state.player.x;
  const dz = objective.z - state.player.z;
  const bearing = (Math.atan2(dx, -dz) * 180) / Math.PI;
  const delta = signedDegrees(bearing - heading);
  const clamped = clamp(delta, -82, 82);
  const x = half + clamped * pixelsPerDegree;
  dom.compassQuest.style.left = `${x}px`;
  dom.compassQuest.classList.toggle("offscreen", Math.abs(delta) > 82);
}

function updateClockText() {
  const totalMinutes = 18 * 60 + 40 + Math.floor(state.playTime / 22);
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const period = hour >= 20 || hour < 5 ? "Night" : hour < 7 ? "Dawn" : hour < 17 ? "Day" : "Dusk";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  dom.timeText.textContent = `${period} · ${displayHour}:${String(minute).padStart(2, "0")}`;
}

function updateHud(dt) {
  const p = state.player;
  hudClock += dt;
  if (hudClock > 0.06) {
    hudClock = 0;
    setStatBar(dom.barHealth, p.health, p.maxHealth);
    setStatBar(dom.barMagicka, p.magicka, p.maxMagicka);
    setStatBar(dom.barStamina, p.stamina, p.maxStamina);
    dom.textHealth.textContent = String(Math.ceil(p.health));
    dom.textMagicka.textContent = String(Math.ceil(p.magicka));
    dom.textStamina.textContent = String(Math.ceil(p.stamina));
    dom.hudName.textContent = state.options.name;
    dom.hudLevel.textContent = `Lv. ${p.level}`;
    dom.potionCount.textContent = String(p.potions);
    const attackRatio = p.attackCooldown > 0 ? p.attackCooldown / 0.46 : 0;
    dom.attackCd.style.setProperty("--cd", String(attackRatio));
    dom.btnAttack.classList.toggle("cooling", attackRatio > 0.03);
    const spellRatio = p.spellCooldown > 0 ? p.spellCooldown / 0.82 : 0;
    dom.spellCd.style.setProperty("--cd", String(spellRatio));
    dom.btnSpell.classList.toggle("cooling", spellRatio > 0.03);
    const objective = getObjectivePosition();
    if (objective && state.stage < 5) {
      const distance = Math.hypot(objective.x - p.x, objective.z - p.z);
      dom.questDistance.textContent = `${Math.max(0, Math.round(distance))} m`;
    }
  }
  updateCompass();
  updateInteractPrompt();
  if (state.mode === "playing") {
    state.tutorialTimer += dt;
    if (state.tutorialTimer > 14 && !state.tutorialDismissed) dismissTutorial();
  }
  if (state.boss && state.bossActive) {
    dom.bossFill.style.width = `${(state.boss.health / state.boss.maxHealth) * 100}%`;
    dom.bossHp.textContent = String(Math.ceil(state.boss.health));
  }
  dom.hudPortrait.style.setProperty("--fur", furInfo().color);
}

function tick(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!state.ready) return;
  const time = now / 1000;
  state.elapsed += dt;

  if (state.mode === "title" || state.mode === "creator") {
    updateTitleCamera(dt, time);
  } else {
    updateGameCamera(dt, time);
  }

  if (state.mode === "playing") {
    state.playTime += dt;
    updatePlayer(dt, time);
    updateEnemies(dt, time);
    updateProjectiles(dt);
    updateNpcs(dt, time);
    saveTimer += dt;
    if (saveTimer > 9) {
      saveTimer = 0;
      saveGame();
    }
  } else {
    if (state.mode === "dialogue") updateDialogue(dt);
    if (state.mode === "dead") {
      state.deathTimer += dt;
      if (playerCat) {
        playerCat.visual.rotation.z = damp(playerCat.visual.rotation.z, -1.2, 4.5, dt);
        playerCat.visual.position.y = damp(playerCat.visual.position.y, -0.16, 4, dt);
      }
    }
    updateNpcs(dt, time);
    if (playerCat && state.mode !== "dead") playerCat.update(dt, time, false, 0);
    updateProjectiles(dt);
  }

  updateEffects(dt);
  updateFloaters(dt);
  updateQuestMarker(dt, time);
  updateHud(dt);
  world.update(dt, time, new THREE.Vector3(state.player.x, state.player.y, state.player.z), camera);
  renderer.render(scene, camera);
}

function bindTap(element, handler) {
  if (!element) return;
  element.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  });
}

function updateCreatorPreview() {
  const fur = furInfo();
  dom.creatorPortrait.style.setProperty("--fur", fur.color);
  dom.creatorFur.textContent = fur.label;
  dom.creatorName.textContent = state.options.name || "Mist";
  dom.catName.value = state.options.name;
  dom.hudPortrait.style.setProperty("--fur", fur.color);
}

function syncCreatorSelection() {
  $$(".fur-swatch").forEach((button) => {
    button.classList.toggle("selected", button.dataset.fur === state.options.furKey);
    button.setAttribute("aria-checked", String(button.dataset.fur === state.options.furKey));
  });
  $$(".path-card").forEach((button) => {
    button.classList.toggle("selected", button.dataset.class === state.options.classKey);
    button.setAttribute("aria-checked", String(button.dataset.class === state.options.classKey));
  });
  updateCreatorPreview();
}

function setOptionsFromSave(save) {
  if (!save || !save.options) return;
  state.options = {
    name: save.options.name || "Mist",
    furKey: FURS[save.options.furKey] ? save.options.furKey : "snow",
    classKey: CLASSES[save.options.classKey] ? save.options.classKey : "warrior",
  };
}

function resetPlayerForClass() {
  const cls = playerClass();
  const p = state.player;
  p.maxHealth = cls.maxHealth;
  p.maxMagicka = cls.maxMagicka;
  p.maxStamina = cls.maxStamina;
  p.health = cls.maxHealth;
  p.magicka = cls.maxMagicka;
  p.stamina = cls.maxStamina;
  p.potions = cls.potions;
  p.level = 1 + Math.floor(state.kills / 3);
  p.invuln = 0;
  p.attackCooldown = 0;
  p.spellCooldown = 0;
  p.attackTimer = 0;
  p.attackHitPending = false;
  p.jumpOffset = 0;
  p.jumpVelocity = 0;
  p.grounded = true;
  p.sprinting = false;
  p.lastDamageAt = -20;
  p.moveTime = 0;
  p.stepTimer = 0;
}

function resetEnemiesForSession(loadStage = 0) {
  for (const enemy of state.enemies) {
    enemy.health = enemy.maxHealth;
    enemy.alive = !(enemy.boss && loadStage >= 3);
    enemy.active = !enemy.boss;
    enemy.aggroActive = false;
    enemy.attackCooldown = 0;
    enemy.windup = 0;
    enemy.windupActive = false;
    enemy.specialCooldown = 5.5;
    enemy.deathTimer = 0;
    enemy.x = enemy.spawnX;
    enemy.z = enemy.spawnZ;
    enemy.y = groundAt(enemy.x, enemy.z);
    enemy.cat.root.position.set(enemy.x, enemy.y, enemy.z);
    enemy.cat.root.rotation.set(0, Math.random() * Math.PI * 2, 0);
    enemy.cat.root.scale.setScalar(1);
    enemy.cat.root.visible = !enemy.boss;
    if (enemy.bar) {
      enemy.bar.draw(1);
      enemy.bar.lastRatio = 1;
      enemy.bar.sprite.material.opacity = 0;
      enemy.bar.sprite.visible = false;
    }
  }
  state.bossActive = false;
  dom.bossWrap.classList.add("hidden");
  dom.bossFill.style.width = "100%";
}

function preparePlayingUi() {
  const app = dom.app;
  if (app) {
    app.scrollLeft = 0;
    app.scrollTop = 0;
  }
  dom.title.classList.add("hidden");
  dom.creator.classList.add("hidden");
  dom.loading.classList.add("hidden");
  dom.pause.classList.add("hidden");
  dom.death.classList.add("hidden");
  dom.victory.classList.add("hidden");
  dom.dialogueLayer.classList.add("hidden");
  dom.hud.classList.remove("hidden");
  dom.interactWrap.classList.add("hidden");
  setMode("playing");
  updateTiltUI();
}

function flashIn() {
  dom.fader.classList.add("visible");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dom.fader.classList.remove("visible"));
  });
}

function startNewGame() {
  sound.init();
  sound.ui();
  sound.setPaused(false);
  const cls = playerClass();
  state.stage = -1;
  state.kills = 0;
  state.gold = 0;
  state.playTime = 0;
  state.bossDefeated = false;
  state.bossActive = false;
  state.player.x = worldLayout.spawn.x;
  state.player.z = worldLayout.spawn.z;
  state.player.y = groundAt(state.player.x, state.player.z);
  state.player.facing = 0;
  resetPlayerForClass();
  resetEnemiesForSession(0);
  makePlayerCat();
  state.cameraYaw = 0;
  state.cameraPitch = 0.21;
  state.saveDirty = true;
  setStage(0, { force: true, silent: true });
  preparePlayingUi();
  snapGameCamera();
  flashIn();
  showTutorial();
  showToast(`${state.options.name} · ${cls.label}`, 3600);
  window.setTimeout(() => showSubtitle("Nine lives. One long night.", 3800), 700);
  updateCreatorPreview();
  saveGame(true);
  if (camera.aspect < 0.82) showRotateHint();
}

function startFromSave(save) {
  if (!save) return;
  sound.init();
  sound.setPaused(false);
  setOptionsFromSave(save);
  const cls = playerClass();
  resetPlayerForClass();
  state.kills = Math.max(0, Number(save.kills) || 0);
  state.gold = Math.max(0, Number(save.gold) || 0);
  state.playTime = Math.max(0, Number(save.playTime) || 0);
  state.bossDefeated = Boolean(save.bossDefeated);
  state.player.potions = clamp(Number(save.potions ?? cls.potions), 0, 9);
  state.player.level = 1 + Math.floor(state.kills / 3);
  state.player.x = save.position?.x ?? worldLayout.spawn.x;
  state.player.z = save.position?.z ?? worldLayout.spawn.z;
  state.player.y = groundAt(state.player.x, state.player.z);
  state.player.facing = 0;
  state.player.health = clamp(Number(save.health) || state.player.maxHealth, 22, state.player.maxHealth);
  const loadStage = clamp(Number(save.stage) || 0, 0, 5);
  state.stage = -1;
  resetEnemiesForSession(loadStage);
  makePlayerCat();
  state.cameraYaw = 0;
  state.cameraPitch = 0.21;
  setStage(loadStage, { force: true, silent: true });
  preparePlayingUi();
  snapGameCamera();
  flashIn();
  updateCreatorPreview();
  showToast(`Welcome back, ${state.options.name}`, 3000);
  if (loadStage === 5) {
    dom.questCard.classList.add("hidden");
    showSubtitle("The north is quiet. For now.", 3600);
  }
  saveGame(true);
}

function showCreator() {
  sound.init();
  sound.ui();
  syncCreatorSelection();
  dom.creator.classList.remove("hidden");
  dom.titleHint.textContent = "Choose a name, fur, and path";
  setMode("creator");
}

function closeCreator() {
  dom.creator.classList.add("hidden");
  setMode("title");
  dom.titleHint.textContent = "Tap New Tale to begin · headphones recommended";
}

function pauseGame() {
  if (state.mode !== "playing") return;
  setMode("paused");
  resetJoystick();
  state.lookPointer = null;
  sound.setPaused(true);
  dom.pause.classList.remove("hidden");
  dom.pauseHint.textContent = "Tilt is optional. Touch controls always work.";
  const location = $("#pause-location");
  if (location) {
    const area = state.stage >= 1 && state.stage <= 3 ? "Frostfang Barrow" : "Whiskerhold";
    location.textContent = `${area} · ${state.options.name}`;
  }
  updateTiltUI();
  updateSoundUI();
  updateFullscreenUI();
  saveGame(true);
}

function resumeGame() {
  if (state.mode !== "paused") return;
  dom.pause.classList.add("hidden");
  setMode("playing");
  sound.setPaused(false);
  resetJoystick();
  lastFrame = performance.now();
}

function returnToTitle() {
  if (state.mode === "dead" || state.mode === "victory" || state.mode === "paused" || state.mode === "dialogue") {
    saveGame(true);
  }
  dom.pause.classList.add("hidden");
  dom.death.classList.add("hidden");
  dom.victory.classList.add("hidden");
  dom.dialogueLayer.classList.add("hidden");
  dom.hud.classList.add("hidden");
  dom.creator.classList.add("hidden");
  dom.title.classList.remove("hidden");
  dom.interactWrap.classList.add("hidden");
  dom.bossWrap.classList.add("hidden");
  state.dialogue = null;
  resetJoystick();
  state.lookPointer = null;
  playerCat.visual.rotation.set(0, 0, 0);
  playerCat.visual.position.y = 0;
  sound.setPaused(false);
  setMode("title");
  dom.titleHint.textContent = hasSave() ? "Continue your tale · or begin again" : "Tap New Tale to begin · headphones recommended";
  updateTiltUI();
}

function keepPlaying() {
  dom.victory.classList.add("hidden");
  dom.hud.classList.remove("hidden");
  setMode("playing");
  sound.setPaused(false);
  showToast("The road is yours. Explore Whiskerhold.");
}

function bindUi() {
  bindTap(dom.btnNew, showCreator);
  bindTap(dom.btnContinue, () => {
    const save = readJSON(SAVE_KEY, null) || savedGame;
    if (save) startFromSave(save);
  });
  bindTap(dom.btnCreatorClose, closeCreator);
  bindTap(dom.btnEnter, startNewGame);
  bindTap(dom.btnAttack, attack);
  bindTap(dom.btnSpell, castSpell);
  bindTap(dom.btnJump, jump);
  bindTap(dom.btnPotion, usePotion);
  bindTap(dom.btnInteract, interact);
  bindTap(dom.btnDialogueNext, advanceDialogue);
  bindTap(dom.btnRespawn, respawn);
  bindTap(dom.btnKeepPlaying, keepPlaying);
  bindTap(dom.btnVictoryTitle, returnToTitle);
  bindTap(dom.btnPause, pauseGame);
  bindTap(dom.btnResume, resumeGame);
  bindTap(dom.btnTitle, returnToTitle);
  bindTap(dom.btnTutorialClose, dismissTutorial);
  bindTap(dom.btnTiltTitle, () => setTiltEnabled(!state.tiltEnabled));
  bindTap(dom.btnTiltPause, () => setTiltEnabled(!state.tiltEnabled));
  bindTap(dom.btnSoundTitle, () => setSoundMuted(!settings.muted));
  bindTap(dom.btnSoundPause, () => setSoundMuted(!settings.muted));
  bindTap(dom.btnFullTitle, toggleFullscreen);
  bindTap(dom.btnFullPause, toggleFullscreen);
  bindTap(dom.titleBrand, (event) => event.preventDefault());

  $$(".fur-swatch").forEach((button) => {
    bindTap(button, () => {
      state.options.furKey = button.dataset.fur;
      sound.ui();
      syncCreatorSelection();
    });
  });
  $$(".path-card").forEach((button) => {
    bindTap(button, () => {
      state.options.classKey = button.dataset.class;
      sound.ui();
      syncCreatorSelection();
    });
  });
  dom.catName.addEventListener("input", () => {
    const value = dom.catName.value.replace(/[<>]/g, "").slice(0, 14);
    state.options.name = value || "Mist";
    updateCreatorPreview();
  });
  dom.catName.addEventListener("blur", () => {
    if (!dom.catName.value.trim()) {
      dom.catName.value = "Mist";
      state.options.name = "Mist";
      updateCreatorPreview();
    }
  });
}

async function boot() {
  try {
    dom.loadingText.textContent = "Shaping the pines…";
    await new Promise((resolve) => requestAnimationFrame(resolve));
    createRenderer();
    dom.loadingText.textContent = "Waking the north…";
    await new Promise((resolve) => requestAnimationFrame(resolve));
    world = createWorld(scene);
    state.player.y = groundAt(state.player.x, state.player.z);
    makePlayerCat();
    createNpcs();
    createEnemies();
    createQuestMarker();
    buildCompass();
    bindInput();
    bindUi();
    bindGlobalEvents();
    updateSoundUI();
    updateTiltUI();
    updateFullscreenUI();
    updateQuestCard();
    updateCreatorPreview();
    dom.btnContinue.disabled = !hasSave();
    if (hasSave()) dom.titleHint.textContent = "Continue your tale · or begin again";
    dom.loading.classList.add("hidden");
    setMode("title");
    state.ready = true;
    updateTitleCamera(1, 0);
    renderer.setAnimationLoop(tick);
    window.setTimeout(() => {
      if (state.mode === "title") dom.titleHint.textContent = hasSave() ? "Continue your tale · or begin again" : "Tap New Tale to begin · headphones recommended";
    }, 1400);

    window.__frostpaw = {
      state,
      get world() { return world; },
      get playerCat() { return playerCat; },
      get camera() { return camera; },
      get renderer() { return renderer; },
      teleport(x, z) {
        state.player.x = x;
        state.player.z = z;
        state.player.y = groundAt(x, z);
        playerCat.root.position.set(x, state.player.y, z);
        snapGameCamera();
      },
      setStage(value) { setStage(value, { force: true }); },
      triggerBoss,
      save: saveGame,
      startNewGame,
      openElder: openElderDialogue,
      damagePlayer,
      toTitle: returnToTitle,
    };
  } catch (error) {
    console.error(error);
    dom.loadingText.textContent = "The north could not wake. WebGL is required.";
    dom.loadingText.style.color = "#d98b91";
  }
}

boot();
