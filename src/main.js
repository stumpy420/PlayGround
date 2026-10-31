// ---------------------------------------------------------------------------
// CATTERFALL — bootstrap, render loop, weather, input, saves and a great deal
// of snow. Everything here is original and every soul is a cat.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { World } from './world/world.js';
import { Player } from './entities/player.js';
import { NPCManager } from './entities/npc.js';
import { EnemyManager } from './entities/enemy.js';
import { QuestLog } from './systems/quests.js';
import { Inventory } from './systems/inventory.js';
import { Effects } from './systems/effects.js';
import { DialogueSystem } from './systems/dialogue.js';
import { AudioSystem } from './systems/audio.js';
import { UI } from './ui.js';
import { CLASSES, ITEMS, LANDMARKS } from './core/data.js';
import { createCat, catAvatarStyle } from './entities/cat.js';
import { makeGlowTexture } from './world/buildings.js';
import { clamp } from './core/noise.js';

const SAVE_KEY = 'catterfall.save.v1';
const SETTINGS_KEY = 'catterfall.settings.v1';
const $ = (id) => document.getElementById(id);
const frame = () => new Promise(r => requestAnimationFrame(() => r()));

const DEFAULT_SETTINGS = { music: 0.55, sfx: 0.8, quality: 'medium', snow: 'medium', reduceMotion: false };

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch (e) { return { ...DEFAULT_SETTINGS }; }
}

// ---------------------------------------------------------------------------
// Renderer, scene, camera
// ---------------------------------------------------------------------------
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x070d12, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0a141c');
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 2600);
camera.position.set(210, 42, 360);
camera.lookAt(175, 8, 306);

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
const game = {
  scene, camera, renderer,
  mode: 'loading',
  creator: { breed: 'tabby', fur: 'ember', eye: 'amber', cls: 'wayfarer', name: 'Moth' },
  settings: readSettings(),
  time: { hours: 9.2, day: 1 },
  weather: { type: 'snow', label: 'Snow', intensity: 1 },
  companions: [],
  enemyTarget: null,
  compassTarget: null,
  currentArea: { name: 'Catterfall', sub: 'The kingdom beneath the snow' },
  shopNpc: null,
  respawnPoint: null,
  indoor: false,
  fishT: 0,
  weatherTimer: 130,
  isTouch: ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0,
};
window.CATTERFALL = game;

const audio = new AudioSystem();
game.audio = audio;
const ui = new UI(game);
game.ui = ui;
ui.setLoading(7, 'Reading the omens…');

// ---------------------------------------------------------------------------
// Character preview renderer
// ---------------------------------------------------------------------------
class CatPreview {
  constructor(game) {
    this.game = game;
    this.canvas = $('preview');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
    this.camera.position.set(0, 1.5, 4.5);
    this.camera.lookAt(0, 1.05, 0);

    this.scene.add(new THREE.HemisphereLight(0xcfe8f5, 0x2a2420, 1.5));
    const key = new THREE.DirectionalLight(0xffe3b4, 2.6);
    key.position.set(3.4, 5.5, 4.2);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x7fd4dc, 2.1);
    rim.position.set(-4, 2.6, -3);
    this.scene.add(rim);
    const fill = new THREE.PointLight(0xffb872, 5, 9, 2);
    fill.position.set(-1.4, 1.2, 2.2);
    this.scene.add(fill);

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.32, 0.16, 40),
      new THREE.MeshStandardMaterial({ color: 0x1a2a30, roughness: 0.6, metalness: 0.25 })
    );
    disc.position.y = -0.09;
    this.scene.add(disc);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.018, 6, 64),
      new THREE.MeshBasicMaterial({ color: 0xd8b16a, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.012;
    this.scene.add(ring);

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.cat = null;
    this.t = 0;
    this.lastW = 0; this.lastH = 0;
    this.refresh(game.creator);
  }

  resize() {
    const w = this.canvas.clientWidth || 300;
    const h = this.canvas.clientHeight || 300;
    if (!w || !h) return;
    if (w === this.lastW && h === this.lastH) return;
    this.lastW = w; this.lastH = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  refresh(c) {
    if (this.cat) this.root.remove(this.cat.root);
    this.cat = createCat({ breed: c.breed, fur: c.fur, eye: c.eye, scale: 1 });
    this.cat.root.position.y = 0.02;
    this.root.add(this.cat.root);
  }

  update(dt) {
    if (!this.canvas || this.canvas.clientWidth === 0) return;
    this.resize();
    this.t += dt;
    if (this.cat) {
      this.cat.update(dt, { speed: 0, sitting: false });
      this.root.rotation.y = Math.sin(this.t * 0.55) * 0.45;
      this.cat.root.position.y = 0.02 + Math.sin(this.t * 1.2) * 0.006;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const input = {
  keys: {},
  block: false,
  jumpQueued: false,
  clear() {
    this.keys = {};
    this.block = false;
    this.jumpQueued = false;
    if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} }
  },
};
game.input = input;

const SPELL_ORDER = ['fireball', 'lightning', 'heal', 'ice'];
let touchSpell = 0;

function isTyping() {
  const a = document.activeElement;
  return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT');
}

function togglePhoto() {
  if (game.mode === 'play') {
    game.mode = 'photo';
    ui.setPhoto(true);
    input.clear();
  } else if (game.mode === 'photo') {
    game.mode = 'play';
    ui.setPhoto(false);
  }
}

window.addEventListener('keydown', (e) => {
  if (isTyping()) return;
  const k = e.key.toLowerCase();
  const blockKeys = [' ', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  if (blockKeys.includes(k)) e.preventDefault();

  if (k === 'escape') {
    if (game.mode === 'dialogue') { game.dialogue?.close(); return; }
    if (game.mode === 'photo') { togglePhoto(); return; }
    if (ui.panel) { ui.closePanel(ui.panel); return; }
    if (game.mode === 'play' || game.mode === 'paused') { game.togglePause(); return; }
    return;
  }
  if (game.mode === 'photo' && k === 'p') { togglePhoto(); return; }
  if (game.mode !== 'play') return;

  input.keys[k] = true;
  if (e.repeat) return;

  if (k === 'e') game.player?.interact();
  else if (k === ' ') input.jumpQueued = true;
  else if (k === '1' || k === '2' || k === '3' || k === '4') game.player?.castSpell(SPELL_ORDER[+k - 1]);
  else if (k === 'b') game.player?.toggleAim();
  else if (k === 'r') game.usePotion();
  else if (k === 'i' || k === 'tab') ui.togglePanel('inventory');
  else if (k === 'j') ui.togglePanel('quests');
  else if (k === 'm') ui.togglePanel('map');
  else if (k === 'k') ui.togglePanel('skills');
  else if (k === 'f') game.petCat();
  else if (k === 'p') togglePhoto();
  else if (k === 'h') ui.toggleHUD();
  else if (k === 'v') ui.toast('You sheathe your weapon. The snow is unimpressed.');
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  delete input.keys[k];
});

window.addEventListener('blur', () => input.clear());

// Mouse look and combat ------------------------------------------------------
canvas.addEventListener('mousedown', (e) => {
  if (game.mode !== 'play') return;
  if (e.button === 2) { input.block = true; e.preventDefault(); return; }
  if (e.button !== 0) return;
  if (!game.isTouch && document.pointerLockElement !== canvas) {
    try { canvas.requestPointerLock(); } catch (err) {}
    return;
  }
  if (game.player?.aiming) game.player.shootBow();
  else game.player?.meleeAttack();
});
window.addEventListener('mouseup', (e) => { if (e.button === 2) input.block = false; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('mousemove', (e) => {
  if (game.mode !== 'play' || document.pointerLockElement !== canvas) return;
  const p = game.player;
  if (!p) return;
  p.camYaw += e.movementX * 0.0024;
  p.camPitch = clamp(p.camPitch - e.movementY * 0.0019, 0.02, 1.08);
});

document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement) input.block = false;
});

// Touch controls -------------------------------------------------------------
if (game.isTouch) {
  $('mobile-controls')?.classList.remove('hidden');
  const joy = $('joystick'), stick = $('stick');
  let joyId = null, joyCenter = { x: 0, y: 0 };
  const setJoyKeys = (dx, dy) => {
    const len = Math.hypot(dx, dy);
    const nx = len > 1 ? dx / len : dx, ny = len > 1 ? dy / len : dy;
    input.keys['w'] = ny < -0.28;
    input.keys['s'] = ny > 0.28;
    input.keys['a'] = nx < -0.28;
    input.keys['d'] = nx > 0.28;
    if (stick) stick.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const endJoy = () => {
    joyId = null;
    input.keys['w'] = input.keys['s'] = input.keys['a'] = input.keys['d'] = false;
    if (stick) stick.style.transform = '';
  };
  joy?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const r = joy.getBoundingClientRect();
    joyCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    joyId = e.pointerId;
    joy.setPointerCapture(e.pointerId);
  });
  joy?.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyId) return;
    let dx = e.clientX - joyCenter.x, dy = e.clientY - joyCenter.y;
    const d = Math.hypot(dx, dy), max = 42;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    setJoyKeys(dx, dy);
  });
  joy?.addEventListener('pointerup', endJoy);
  joy?.addEventListener('pointercancel', endJoy);

  const look = $('touch-look');
  let lookId = null, lastX = 0, lastY = 0;
  look?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    look.setPointerCapture(e.pointerId);
  });
  look?.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lookId || game.mode !== 'play') return;
    const p = game.player;
    if (!p) return;
    p.camYaw += (e.clientX - lastX) * 0.006;
    p.camPitch = clamp(p.camPitch - (e.clientY - lastY) * 0.004, 0.02, 1.08);
    lastX = e.clientX; lastY = e.clientY;
  });
  look?.addEventListener('pointerup', () => { lookId = null; });
  look?.addEventListener('pointercancel', () => { lookId = null; });

  document.querySelectorAll('[data-touch]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (game.mode !== 'play') return;
      const a = btn.dataset.touch;
      if (a === 'attack') {
        if (game.player?.aiming) game.player.shootBow();
        else game.player?.meleeAttack();
      } else if (a === 'interact') game.player?.interact();
      else if (a === 'jump') input.jumpQueued = true;
      else if (a === 'spell') {
        touchSpell = (touchSpell + 1) % SPELL_ORDER.length;
        game.player?.castSpell(SPELL_ORDER[touchSpell]);
      } else if (a === 'potion') game.usePotion();
      else if (a === 'menu') game.togglePause();
    });
  });
}

// ---------------------------------------------------------------------------
// Boot: world, systems, people, monsters
// ---------------------------------------------------------------------------
let world, npcs, enemies, effects, dialogue, preview;

async function boot() {
  try {
    ui.setLoading(14, 'Carving the mountains…');
    await frame();
    world = new World(scene);
    game.world = world;
    ui.setLoading(52, 'Waking the cats…');
    await frame();

    game.quests = new QuestLog(game);
    game.inventory = new Inventory(game);
    dialogue = new DialogueSystem(game);
    game.dialogue = dialogue;

    // A placeholder Tenth stands in the snow while the menu is open.
    game.inventory.equipment = { weapon: null, armor: null, trinket: null, bow: null };
    game.player = new Player(game, { look: { breed: 'tabby', fur: 'ember', eye: 'amber' }, cls: 'wayfarer', name: 'Moth' });
    game.player.group.visible = false;
    game.inventory.initFromClass(CLASSES.wayfarer);
    game.player.refreshGear();
    catAvatarStyle(game.player.cat, $('hud-avatar'));

    ui.setLoading(68, 'Hanging the banners…');
    await frame();
    effects = new Effects(game);
    game.effects = effects;
    npcs = new NPCManager(game);
    game.npcs = npcs;
    enemies = new EnemyManager(game);
    game.enemies = enemies;

    preview = new CatPreview(game);
    game.preview = preview;
    ui.syncCreator();

    createWeather();
    createIndoorLights();
    applyWeather(game.weather.type, true);

    ui.setLoading(88, 'Teaching the fish to be smug…');
    await frame();
    installCallbacks();
    installSaveCallbacks();
    bindMenus();
    game.setQuality(game.settings.quality);

    const save = readSave();
    $('btn-continue')?.classList.toggle('hidden', !save);
    applySettingsToUI();

    ui.setLoading(100, 'The kingdom is awake.');
    await frame();
    await new Promise(r => setTimeout(r, 420));
    ui.hideLoading();
    ui.showMenu(true);
    ui.showHUD(false);
    game.mode = 'menu';
    world.lastArea = null;
    game.currentArea = world.locationAt(game.player.position.x, game.player.position.z);

    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    ui.setLoading(100, 'The snow has eaten an error. See the console.');
    ui.toast('Failed to start: ' + (err?.message || err), 'bad');
  }
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------
const WEATHER_MAX = 3200;
let weatherPoints, weatherPositions, weatherGroup;

function createWeather() {
  weatherGroup = new THREE.Group();
  scene.add(weatherGroup);
  weatherPositions = new Float32Array(WEATHER_MAX * 3);
  for (let i = 0; i < WEATHER_MAX; i++) {
    weatherPositions[i * 3] = (Math.random() - 0.5) * 110;
    weatherPositions[i * 3 + 1] = Math.random() * 60;
    weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 110;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(weatherPositions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xeaf6ff, size: 0.24, map: makeGlowTexture(), transparent: true, opacity: 0.85,
    depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending,
  });
  weatherPoints = new THREE.Points(geo, mat);
  weatherPoints.frustumCulled = false;
  weatherGroup.add(weatherPoints);
  game.weatherGroup = weatherGroup;
}

function weatherDensity() {
  const snow = { low: 0.35, medium: 0.65, high: 1 }[game.settings.snow] || 0.65;
  const q = { low: 0.55, medium: 0.8, high: 1 }[game.settings.quality] || 0.8;
  return snow * q;
}

function applyWeather(type, silent = false) {
  game.weather.type = type;
  const label = { snow: 'Snow', blizzard: 'Blizzard', sleet: 'Freezing rain', clear: 'Clear' }[type] || 'Snow';
  game.weather.label = label;
  if (!weatherPoints) return;
  const mat = weatherPoints.material;
  if (type === 'clear') {
    weatherGroup.visible = false;
    return;
  }
  weatherGroup.visible = !game.indoor;
  if (type === 'sleet') {
    mat.color.setHex(0xa9d7e6); mat.size = 0.075; mat.opacity = 0.8;
    game.weather.speed = 27; game.weather.wind = 2.4;
  } else if (type === 'blizzard') {
    mat.color.setHex(0xf4fbff); mat.size = 0.32; mat.opacity = 0.95;
    game.weather.speed = 11; game.weather.wind = 7.5;
  } else {
    mat.color.setHex(0xeaf6ff); mat.size = 0.24; mat.opacity = 0.85;
    game.weather.speed = 3.6; game.weather.wind = 0.9;
  }
  mat.needsUpdate = true;
  if (!silent && game.mode === 'play') ui.toast(`The weather turns: <b>${label}</b>.`, 'magic');
}

function updateWeather(dt) {
  if (!weatherPoints) return;
  if (game.mode === 'play' || game.mode === 'menu' || game.mode === 'dead') {
    game.weatherTimer -= dt;
    if (game.weatherTimer <= 0) {
      game.weatherTimer = 100 + Math.random() * 100;
      const r = Math.random();
      const next = r < 0.44 ? 'snow' : r < 0.62 ? 'clear' : r < 0.82 ? 'sleet' : 'blizzard';
      if (next !== game.weather.type) applyWeather(next);
    }
  }
  if (game.indoor || game.weather.type === 'clear') {
    weatherGroup.visible = false;
    return;
  }
  weatherGroup.visible = true;
  const cam = camera.position;
  const count = Math.max(220, Math.floor(WEATHER_MAX * weatherDensity() * (game.weather.type === 'blizzard' ? 1 : 0.72)));
  const speed = game.weather.speed || 4;
  const wind = game.weather.wind || 1;
  const pos = weatherPositions;
  for (let i = 0; i < count; i++) {
    const j = i * 3;
    pos[j + 1] -= speed * dt * (0.75 + (i % 7) * 0.06);
    pos[j] += wind * dt;
    pos[j + 2] += Math.sin((i + performance.now() * 0.0002) * 0.7) * wind * dt * 0.3;
    if (pos[j + 1] < cam.y - 16) {
      pos[j] = cam.x + (Math.random() - 0.5) * 90;
      pos[j + 1] = cam.y + 20 + Math.random() * 24;
      pos[j + 2] = cam.z + (Math.random() - 0.5) * 90;
    }
    if (pos[j] > cam.x + 55) pos[j] -= 110;
    else if (pos[j] < cam.x - 55) pos[j] += 110;
    if (pos[j + 2] > cam.z + 55) pos[j + 2] -= 110;
    else if (pos[j + 2] < cam.z - 55) pos[j + 2] += 110;
  }
  weatherPoints.geometry.setDrawRange(0, count);
  weatherPoints.geometry.attributes.position.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// Indoor lighting
// ---------------------------------------------------------------------------
let indoorAmbient, indoorHemi, indoorFill;

function createIndoorLights() {
  indoorAmbient = new THREE.AmbientLight(0xffd9b0, 0);
  indoorHemi = new THREE.HemisphereLight(0xffe0b8, 0x241a12, 0);
  indoorFill = new THREE.PointLight(0xffc98a, 0, 22, 2);
  scene.add(indoorAmbient, indoorHemi, indoorFill);
}

// ---------------------------------------------------------------------------
// Callbacks used by the rest of the game
// ---------------------------------------------------------------------------
function installCallbacks() {
  game.setEnemyTarget = (e) => { game.enemyTarget = e; };

  game.setIndoor = (v, interior) => {
    game.indoor = v;
    if (indoorAmbient) indoorAmbient.intensity = v ? 0.55 : 0;
    if (indoorHemi) indoorHemi.intensity = v ? 0.7 : 0;
    if (indoorFill) indoorFill.intensity = v ? 7 : 0;
    if (weatherGroup) weatherGroup.visible = !v && game.weather.type !== 'clear';
  };

  game.openShop = (npc) => {
    game.shopNpc = npc;
    ui.showShop(npc);
    audio.playUIClick();
  };

  game.openChest = (chest) => {
    if (!chest || chest.opened) return;
    chest.opened = true;
    const lists = [world.interactables, world.activeInterior?.interactables || []];
    for (const list of lists) {
      const it = list.find(i => i.chest === chest);
      if (it) it.used = true;
    }
    const names = [];
    for (const id of chest.items || []) {
      if (id === 'gold') {
        const qty = 9 + Math.floor(Math.random() * 17);
        game.inventory.add('gold', qty, true);
        names.push(`${qty} gold`);
      } else if (ITEMS[id]) {
        game.inventory.add(id, 1, true);
        names.push(ITEMS[id].name);
      }
    }
    audio.playLoot();
    audio.playPickup();
    const pos = new THREE.Vector3(chest.x, (chest.y || 0) + 1, chest.z);
    effects.burst(pos, 0xffd27a, 22, 3.2, 0.9, 0.12);
    effects.ring(pos, 0xffd27a, 2.4, 0.5);
    ui.toast(`<b>Chest opened</b><br>${names.join(' · ') || 'It is empty. Rude.'}`, 'good');
    ui.refreshInventory();
    ui.updateHUD();
    saveGame(true);
  };

  game.fish = () => {
    if (game.fishT > 0) { ui.toast('The fish are still pretending to be stones.', 'bad'); return; }
    game.fishT = 3.2;
    audio.playBow();
    const p = game.player.position;
    if (Math.random() < 0.78) {
      game.inventory.add('riverFish', 1, true);
      if (Math.random() < 0.35) game.inventory.add('fish', 1, true);
      audio.playPickup();
      effects.burst(p.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x8fd9ff, 18, 2.4, 0.8, 0.1);
      ui.toast('<b>You catch a fish.</b> It looks personally betrayed.', 'good');
    } else {
      ui.toast('The fish escapes. It has seen things.', 'bad');
    }
    ui.refreshInventory();
    ui.updateHUD();
  };

  game.takeRelic = (id, name, mesh, light) => {
    if (game.inventory.has(id)) return;
    game.inventory.add(id, 1, true);
    if (mesh) { mesh.visible = false; mesh.userData.relicHidden = true; }
    if (light) { light.visible = false; light.userData.relicHidden = true; }
    const key = id === 'emberRelic' ? 'relic_ember' : 'relic_bell';
    const it = world.interactables.find(i => i.id === key);
    if (it) it.used = true;
    const p = game.player.position;
    effects.ring(p, id === 'emberRelic' ? 0xff9b45 : 0xbfe6ff, 5, 0.9);
    effects.burst(p.clone().add(new THREE.Vector3(0, 1.5, 0)), id === 'emberRelic' ? 0xff9b45 : 0xbfe6ff, 36, 4.5, 1.1, 0.16);
    audio.playQuestComplete();
    ui.showArea(name, 'Relic of the Nine', 'Recovered');
    ui.toast(`<b>${name}</b> recovered. It hums against your ribs.`, 'quest');
    ui.refreshInventory();
    ui.updateHUD();
    saveGame(true);
  };

  game.restAtShrine = (name, x, z, y) => {
    const p = game.player;
    p.health = p.maxHealth;
    p.stamina = p.maxStamina;
    p.mana = p.maxMana;
    const ry = y ?? world.groundHeight(x, z);
    game.respawnPoint = { x, z, y: ry, name };
    game.time.hours = (game.time.hours + 2) % 24;
    audio.bell();
    effects.ring(p.position, 0x8ee39b, 3.6, 0.9);
    effects.burst(p.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x8ee39b, 24, 2.6, 1, 0.12);
    ui.showArea(name, 'You rest. The snow keeps watch.', 'Rested');
    ui.toast('Health, stamina and mana restored. The shrine remembers you.', 'good');
    ui.updateHUD();
    saveGame(true);
  };

  game.recruit = (npc) => npcs.recruit(npc);

  game.onBossDefeated = (e) => {
    if (e.type === 'marrowmaw') ui.showArea('The Silver Bell', 'The mine falls quiet', 'Boss defeated');
    else if (e.type === 'vaelmaw') { effects.screenFlash('#d8b16a', 0.3); ui.showArea('Vaelmaw', 'The Empty Bowl is empty', 'Boss defeated'); }
    saveGame(true);
  };

  game.victory = () => {
    if (game.mode === 'victory') return;
    game.mode = 'victory';
    input.clear();
    const completed = [...game.quests.states.values()].filter(s => s.complete).length;
    ui.showVictory({
      'Quests completed': completed,
      'Level reached': game.player.level,
      'Gold carried': game.inventory.gold,
      'Companions': game.companions.length,
    });
    audio.playQuestComplete();
    saveGame(true);
  };

  game.victoryContinue = () => {
    ui.hideVictory();
    game.mode = 'play';
    ui.showHUD(true);
  };

  game.onAreaChange = (area) => {
    game.currentArea = area;
    ui.showArea(area.name, area.sub || '', 'Now entering');
    if (area.interior) return;
    if (game.mode === 'play' && ['whiskerhold', 'highpaw', 'pawsmouth', 'shrine', 'hearthwhisker', 'frostpelt'].includes(area.id)) {
      saveGame(true);
    }
  };

  game.onPlayerDeath = () => {
    if (game.mode === 'dead' || game.mode === 'menu') return;
    game.mode = 'dead';
    input.clear();
    const lines = [
      'A cat always lands on their feet. Eventually.',
      'You have been unravelled. The snow is very sorry.',
      'Nine lives were never enough for this weather.',
      'Somewhere, a fish is laughing. It has earned this.',
    ];
    ui.showDeath(lines[Math.floor(Math.random() * lines.length)]);
  };

  game.respawn = () => {
    if (world.activeInteriorId) world.exitInterior(game);
    const rp = game.respawnPoint || { x: 178, z: 346, name: 'Pawsmouth' };
    const y = rp.y ?? world.groundHeight(rp.x, rp.z);
    game.player.reviveAt(rp.x, y + 0.1, rp.z);
    game.player.lastSafe = { x: rp.x, y, z: rp.z };
    world.lastArea = null;
    game.mode = 'play';
    ui.hideDeath();
    ui.showHUD(true);
    audio.unlock();
    saveGame(true);
  };

  game.usePotion = () => {
    if (game.mode !== 'play') return;
    game.inventory.quickHeal();
    ui.updateHUD();
  };

  game.togglePause = (force) => {
    if (game.mode === 'play') ui.openPanel('pause');
    else if (game.mode === 'paused') ui.closePanel('pause');
  };

  game.quitToMenu = () => {
    saveGame(true);
    if (dialogue?.open) dialogue.close();
    if (ui.panel) ui.closePanel(ui.panel);
    leaveInteriorSilently();
    game.mode = 'menu';
    game.player.group.visible = false;
    ui.hideDeath();
    ui.hideVictory();
    ui.setPhoto(false);
    ui.setAiming(false);
    ui.showHUD(false);
    ui.showCreator(false);
    ui.showMenu(true);
    $('btn-continue')?.classList.remove('hidden');
    world.lastArea = null;
  };

  game.setQuality = (q) => {
    if (!['low', 'medium', 'high'].includes(q)) q = 'medium';
    game.settings.quality = q;
    const pr = q === 'low' ? 1 : q === 'high' ? Math.min(2, window.devicePixelRatio || 1) : Math.min(1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(pr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (world?.sun) {
      world.sun.castShadow = q !== 'low';
      const size = q === 'high' ? 2048 : q === 'low' ? 512 : 1024;
      if (world.sun.shadow.mapSize.x !== size) {
        if (world.sun.shadow.map) { world.sun.shadow.map.dispose(); world.sun.shadow.map = null; }
        world.sun.shadow.mapSize.set(size, size);
      }
    }
    if (scene.fog) scene.fog.density = q === 'low' ? 0.0034 : q === 'high' ? 0.0022 : 0.0027;
    const sel = $('set-quality');
    if (sel) sel.value = q;
  };

  game.readNote = (text) => {
    ui.subtitle(text, 8);
    ui.toast(text, 'quest');
  };

  game.petCat = () => {
    const npc = npcs.nearestTalkable(game.player.position, 3.8);
    if (!npc) { ui.toast('There is no cat nearby. Only snow, and judgment.', 'bad'); return; }
    npc.cat.playTalk();
    audio.meow(1.15);
    audio.purr();
    effects.burst(npc.group.position.clone().add(new THREE.Vector3(0, 1.8, 0)), 0xff9ec4, 10, 1.6, 0.8, 0.08);
    ui.toast(`You pet <b>${npc.name}</b>. They allow it.`, 'good');
  };

  game.togglePhoto = togglePhoto;

  // Quest catch-up: pick up objectives that were already true when accepted.
  game.syncQuestProgress = () => {
    for (const state of game.quests.states.values()) {
      if (state.complete) continue;
      const stage = game.quests.currentStage(state);
      if (!stage) continue;
      if (stage.event === 'recruit') {
        const npc = npcs.byId[stage.target];
        if (npc?.recruited) { game.quests.event('recruit', stage.target, 1); return; }
      } else if (stage.event === 'collect') {
        const need = stage.count || 1;
        if (game.inventory.count(stage.target) >= need && state.progress < need) {
          state.progress = need - 1;
          game.quests.event('collect', stage.target, 1);
          return;
        }
      } else if (stage.event === 'reach') {
        const l = LANDMARKS[stage.target];
        const near = l ? Math.hypot(game.player.position.x - l.x, game.player.position.z - l.z) < (l.radius || 30) * 0.82 : false;
        if (world.activeInteriorId === stage.target || near) {
          game.quests.event('reach', stage.target, 1);
          return;
        }
      } else if (stage.event === 'kill') {
        const need = stage.count || 1;
        const total = enemies.killCounts?.get(stage.target) || 0;
        if (total > state.progress) {
          state.progress = Math.min(need, total);
          if (state.progress >= need) {
            state.progress = need - 1;
            game.quests.event('kill', stage.target, 1);
          } else {
            ui.updateHUD();
            ui.refreshQuests();
          }
          return;
        }
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Sessions, saves, menus
// ---------------------------------------------------------------------------
function leaveInteriorSilently() {
  if (!world?.activeInterior) return;
  world.activeInterior.group.visible = false;
  world.activeInterior = null;
  world.activeInteriorId = null;
  world.outdoorVisible(true);
  game.setIndoor(false, null);
  world.lastArea = null;
  const rp = world.returnPosition;
  if (rp && game.player) {
    const y = world.terrain.heightAt(rp.x, rp.z) + 0.1;
    game.player.teleport(rp.x, y, rp.z, rp.yaw || Math.PI);
  }
  world.returnPosition = null;
}

function resetChest(chest) {
  if (!chest) return;
  chest.opened = false;
  if (chest.lidPivot) chest.lidPivot.rotation.x = 0;
  if (chest.glow?.material) chest.glow.material.opacity = 0.3;
}

function resetWorldState() {
  world.chests.forEach(resetChest);
  (world.outdoorInteractables || []).forEach(it => { it.used = false; });
  for (const interior of world.interiors.values()) {
    (interior.chests || []).forEach(resetChest);
    (interior.interactables || []).forEach(it => { it.used = false; });
    interior.group.traverse(o => {
      if (o.userData?.relicHidden) { o.visible = true; o.userData.relicHidden = false; }
    });
  }
  world.lastArea = null;
  world.returnPosition = null;
}

function createPlayer(look, cls, name) {
  if (game.player) scene.remove(game.player.group);
  game.player = new Player(game, { look, cls, name });
  game.player.group.visible = false;
  return game.player;
}

function newSession(data = null) {
  leaveInteriorSilently();
  resetWorldState();
  game.companions.length = 0;
  npcs.reset();
  enemies.reset();
  game.enemyTarget = null;
  game.compassTarget = null;

  game.quests = new QuestLog(game);
  game.inventory = new Inventory(game);

  const look = data?.player?.look || { breed: game.creator.breed, fur: game.creator.fur, eye: game.creator.eye };
  const cls = data?.player?.cls || game.creator.cls || 'wayfarer';
  const name = data?.player?.name || game.creator.name || 'Moth';

  if (data) game.inventory.load(data.inventory);
  const player = createPlayer(look, cls, name);
  if (!data) {
    game.inventory.initFromClass(CLASSES[cls] || CLASSES.wayfarer);
    player.refreshGear();
    const y = world.terrain.heightAt(178, 346) + 0.1;
    player.teleport(178, y, 346, Math.PI);
    player.lastSafe = { x: 178, y, z: 346 };
    game.respawnPoint = { x: 178, y, z: 346, name: 'Pawsmouth' };
  } else {
    player.load(data.player);
    game.quests.load(data.quests);
    game.respawnPoint = data.respawn || { x: 178, z: 346, name: 'Pawsmouth' };
    game.time.hours = data.time?.hours ?? 9.2;
    game.weather = { type: data.weather?.type || 'snow', label: data.weather?.label || 'Snow', intensity: 1 };
    applyWeather(game.weather.type, true);
    if (Array.isArray(data.kills)) enemies.killCounts = new Map(data.kills);
    npcs.loadCompanions(data.companions || []);
    applyChestStates(data.chests || []);
  }

  player.group.visible = true;
  catAvatarStyle(player.cat, $('hud-avatar'));
  npcs.setInterior(null);
  world.setTime(game.time.hours);
  world.lastArea = null;
  game.currentArea = world.locationAt(player.position.x, player.position.z);

  if (data) game.compassTarget = null;
  else game.compassTarget = { x: 175, z: 322, name: 'Elder Whiskerby' };

  game.mode = 'play';
  ui.showCreator(false);
  ui.showMenu(false);
  ui.showHUD(true);
  ui.hideDeath();
  ui.hideVictory();
  ui.setPhoto(false);
  ui.setAiming(false);
  ui.refreshInventory();
  ui.refreshSkills();
  ui.refreshQuests();
  ui.updateHUD();
  audio.unlock();

  if (!data) {
    ui.showArea('Pawsmouth', 'A fishing village with more cats than fish');
    ui.subtitle('Elder Whiskerby: “You are late. The snow has been waiting three days for you, and it is not a patient snow.”', 7);
    ui.toast('Speak with <b>Elder Whiskerby</b> by the well. <kbd>E</kbd> to talk.', 'quest');
    audio.meow(0.95);
  } else {
    ui.showArea(game.currentArea.name, game.currentArea.sub || '');
    ui.toast('Welcome back, little hunter. The snow kept your place.', 'good');
  }
  saveGame(true);
}

function applyChestStates(ids) {
  const set = new Set(ids || []);
  if (!set.size) return;
  const all = [...world.chests, ...[...world.interiors.values()].flatMap(i => i.chests || [])];
  for (const chest of all) {
    if (set.has(chest.id)) {
      chest.opened = true;
      if (chest.lidPivot) chest.lidPivot.rotation.x = 1.9;
      if (chest.glow?.material) chest.glow.material.opacity = 0;
    }
  }
  const lists = [world.outdoorInteractables || [], ...[...world.interiors.values()].map(i => i.interactables || [])];
  for (const list of lists) for (const it of list) {
    if (it.chest && set.has(it.chest.id)) it.used = true;
  }
}

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.player) return null;
    return data;
  } catch (e) { return null; }
}

function saveGame(silent = false) {
  if (!game.player || !game.inventory || !game.quests) return;
  try {
    const pdata = game.player.save();
    if (world?.activeInteriorId && world.returnPosition) {
      const rp = world.returnPosition;
      pdata.position = { x: rp.x, y: world.terrain.heightAt(rp.x, rp.z) + 0.1, z: rp.z };
      pdata.yaw = rp.yaw || Math.PI;
    }
    const opened = [];
    const allChests = [...world.chests, ...[...world.interiors.values()].flatMap(i => i.chests || [])];
    for (const chest of allChests) if (chest.opened && chest.id) opened.push(chest.id);
    const data = {
      version: 1,
      savedAt: Date.now(),
      player: pdata,
      inventory: game.inventory.save(),
      quests: game.quests.save(),
      companions: npcs.save(),
      time: { hours: game.time.hours, day: game.time.day },
      weather: { type: game.weather.type, label: game.weather.label },
      respawn: game.respawnPoint,
      chests: opened,
      kills: [...(enemies.killCounts || new Map()).entries()],
      settings: game.settings,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(game.settings));
    $('btn-continue')?.classList.remove('hidden');
    if (!silent) {
      ui.toast('Game saved. The snow remembers.', 'good');
      ui.setSaveNote('Saved. The snow remembers.');
      audio.playQuestComplete();
    }
  } catch (e) {
    console.warn('Save failed', e);
    if (!silent) ui.toast('The save failed. The snow is embarrassed.', 'bad');
  }
}

function installSaveCallbacks() {
  game.save = saveGame;
  game.continueGame = () => {
    const data = readSave();
    if (!data) { ui.toast('No saved life found. Start a new one.', 'bad'); return; }
    if (data.settings) game.settings = { ...game.settings, ...data.settings };
    newSession(data);
    applySettingsToUI();
    game.setQuality(game.settings.quality);
  };
  game.beginGame = () => {
    game.creator = { ...game.creator, ...ui.readCreator() };
    newSession(null);
  };
  game.showCreator = () => {
    ui.showMenu(false);
    ui.showCreator(true);
    game.mode = 'creator';
    ui.syncCreator();
    preview?.resize();
  };
  game.backToMenu = () => {
    ui.showCreator(false);
    ui.showMenu(true);
    game.mode = 'menu';
  };
}

function bindMenus() {
  // Buttons are wired by UI; these just cover the 3D menu backdrop clicks.
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    preview?.resize();
  });
}

function applySettingsToUI() {
  const s = game.settings;
  if ($('set-music')) $('set-music').value = s.music;
  if ($('set-sfx')) $('set-sfx').value = s.sfx;
  if ($('set-quality')) $('set-quality').value = s.quality;
  if ($('set-snow')) $('set-snow').value = s.snow;
  if ($('set-motion')) $('set-motion').checked = !!s.reduceMotion;
  document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
  audio.setMusicVolume(s.music);
  audio.setSfxVolume(s.sfx);
  game.setQuality(s.quality);
}

// ---------------------------------------------------------------------------
// Menu camera and simulation
// ---------------------------------------------------------------------------
let menuT = 0;
function updateMenuCamera(dt) {
  menuT += dt;
  const a = menuT * 0.035 + 0.35;
  const cx = 175, cz = 306, r = 76;
  camera.position.set(cx + Math.cos(a) * r, 30 + Math.sin(menuT * 0.12) * 5, cz + Math.sin(a) * r);
  camera.lookAt(cx, 7, cz);
}

let lightTimer = 0;
function advanceWorld(dt) {
  game.time.hours = (game.time.hours + dt * 0.018) % 24;
  lightTimer -= dt;
  if (lightTimer <= 0) {
    lightTimer = 0.28;
    world.setTime(game.time.hours);
    audio.setNight(world.night);
  }
  world.update(dt, game);
}

let syncTimer = 0;
function loop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - (loop.last || now)) / 1000));
  loop.last = now;

  if (game.mode === 'menu' || game.mode === 'creator') {
    updateMenuCamera(dt);
    advanceWorld(dt);
    npcs.update(dt);
  } else if (game.mode === 'play') {
    advanceWorld(dt);
    game.player.update(dt);
    npcs.update(dt);
    enemies.update(dt);
    game.quests.update(dt);
    game.effects.update(dt);
    game.fishT = Math.max(0, game.fishT - dt);
    syncTimer -= dt;
    if (syncTimer <= 0) { syncTimer = 0.4; game.syncQuestProgress(); }
    if (game.enemyTarget && (!game.enemyTarget.alive || game.enemyTarget.group.position.distanceTo(game.player.position) > 46)) {
      game.setEnemyTarget(null);
    }
    game.ui.update(dt);
  } else if (game.mode === 'dead') {
    advanceWorld(dt);
    game.player.update(dt);
    game.effects.update(dt);
    game.ui.update(dt);
  } else if (game.mode === 'photo') {
    // The world holds its breath for the photograph.
  }

  if (game.indoor && game.player && indoorFill) {
    indoorFill.position.set(game.player.position.x, game.player.position.y + 2.6, game.player.position.z);
  }
  audio.gamePaused = game.mode !== 'play';
  audio.update(dt, game);
  updateWeather(dt);
  if (game.mode === 'creator') preview?.update(dt);

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

boot();
