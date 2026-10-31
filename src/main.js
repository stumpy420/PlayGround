import * as THREE from '../vendor/three.module.js';
import { World } from './world.js';
import { Player } from './player.js';
import { NPCSystem } from './npcs.js';
import { Combat } from './combat.js';
import { UI, fmt, $ } from './ui.js';
import { Audio } from './audio.js';
import {
  BUSINESSES, ITEMS, NPCS, BOSSES, QUESTS, SIDE_QUESTS, EVENTS, ENCOUNTERS, ENDINGS,
  STYLES, WEATHER, DISTRICTS, HAIRSTYLES, OUTFITS, TATTOOS, RANKS
} from './data.js';

const SAVE_KEY = 'bellingham_underground_save_v3';
const TAU = Math.PI * 2;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isTouch = matchMedia('(pointer: coarse)').matches || innerWidth < 760;

const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .08, 1600);
scene.add(camera);

const audio = new Audio();
let world, npcs, player, ui, combat;
let state = loadRawState() || defaultState();
let gameMode = 'boot';
let gameStarted = false;
let currentTarget = null;
let objectiveBeacon = null;
let objectiveTarget = null;
let lastFrame = performance.now();
let elapsed = 0;
let eventTimer = 48;
let weatherTimer = 80;
let timingGame = null;
let eventCount = 0;
let alternate = false;
let introShown = false;
let consentGiven = false;
let lastArea = '';
let lastAutoSave = 0;
let bossContext = null;
let touchSprint = false;
let touchMove = { x:0, z:0 };
let touchLook = null;
let toastWarned = {};

function defaultState() {
  const s = {
    version:3,
    createdAt:Date.now(),
    player:{
      name:'Rae Mercer', age:27, money:1284, health:100, stamina:100,
      hunger:78, energy:84, hygiene:77, mood:71, intoxication:0, heat:0,
      reputation:8, xp:0, level:1, skillPoints:0, strength:1, endurance:1, charisma:1, reflex:1,
      style:'street', styles:['street'], outfit:'Rain shell', hair:'Rain-matted', tattoo:'None',
      home:'harborview', homeOwned:false, rentDue:3, rent:650, car:'The Rustbucket',
      job:'Barista', position:null
    },
    time:{ day:0, minutes:462 },
    weather:'rain', weatherTimer:80,
    weirdness:.1,
    relationships:{},
    flags:{
      workedShift:false, busRide:false, tournamentUnlocked:false, bossesDefeated:[],
      raincoatFound:false, mirrorDefeated:false, futureDefeated:false, truthRevealed:false,
      quietTable:false, darkRep:0, artifacts:[], endings:[], allBosses:false,
      bookDelivered:false, alternateSeen:false, finalUnlocked:false
    },
    quest:{ stage:0, side:{}, completed:[] },
    stats:{ fights:0, wins:0, losses:0, ko:0, drinks:0, shifts:0, days:0, storms:0, training:{gym:0,dojo:0,junkyard:0}, events:0 },
    inventory:[
      {id:'coffee', qty:1}, {id:'firstaid', qty:1}, {id:'energy_drink', qty:1}
    ],
    settings:{ sens:1, volume:.55, invert:false, motion:false },
    lastSaved:0
  };
  initRelationships(s);
  return s;
}

function initRelationships(s) {
  for (const n of NPCS) {
    if (!s.relationships[n.id]) {
      s.relationships[n.id] = {
        affinity:0, trust:0, romance:0, grudge:0, met:false, status:'STRANGER',
        dates:0, memories:[], lastTalk:0, fights:0, wins:0, losses:0
      };
    }
  }
  return s;
}

function mergeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const s = { ...base, ...raw };
  s.player = { ...base.player, ...(raw.player || {}) };
  s.time = { ...base.time, ...(raw.time || {}) };
  s.flags = { ...base.flags, ...(raw.flags || {}) };
  s.quest = { ...base.quest, ...(raw.quest || {}) };
  s.stats = { ...base.stats, ...(raw.stats || {}), training:{ ...base.stats.training, ...(raw.stats?.training || {}) } };
  s.settings = { ...base.settings, ...(raw.settings || {}) };
  s.relationships = { ...base.relationships, ...(raw.relationships || {}) };
  s.inventory = Array.isArray(raw.inventory) ? raw.inventory : base.inventory;
  s.flags.bossesDefeated = Array.isArray(s.flags.bossesDefeated) ? s.flags.bossesDefeated : [];
  s.flags.artifacts = Array.isArray(s.flags.artifacts) ? s.flags.artifacts : [];
  s.flags.endings = Array.isArray(s.flags.endings) ? s.flags.endings : [];
  initRelationships(s);
  return s;
}

function loadRawState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return mergeState(JSON.parse(raw));
  } catch { return null; }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

function saveGame(quiet = true) {
  if (!gameStarted || !player) return;
  state.player.position = { x:player.x, z:player.z, yaw:player.yaw };
  state.weather = world?.weather || state.weather;
  state.lastSaved = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
  if (!quiet) ui?.toast('<b>SAVED</b> · The city forgets nothing.', '');
}

function setState(next) {
  state = initRelationships(next);
  if (world) world.state = state;
  if (player) player.state = state;
  if (npcs) npcs.state = state;
  if (combat) combat.state = state;
  if (ui) ui.state = state;
}

function applyState() {
  if (!player) return;
  player.state = state;
  player.arms.visible = false;
  player.lookSensitivity = state.settings?.sens || 1;
  player.invert = !!state.settings?.invert;
  audio.setVolume(state.settings?.volume ?? .55);
  world.setWeirdness(state.weirdness || .1);
  world.setWeather(state.weather || 'rain', true);
  npcs.setWeirdness(state.weirdness || .1);
  const pos = state.player.position;
  if (pos) player.teleport(pos.x, pos.z, pos.yaw || 0);
  else player.teleport(world.spawn.x, world.spawn.z, 0);
  updateStoryVisibility();
  refreshQuest();
  ui.setPlayer(player);
  ui.updateHUD(true);
  audio.setWeather(state.weather || 'rain');
}

// --------------------------
// boot / start
// --------------------------
async function boot() {
  try {
    ui = new UI(null, state);
    ui.bootProgress(.03, 'READING THE RAIN...');
    await document.fonts.ready;
    world = new World(scene, renderer, state);
    await world.build((p, text) => ui.bootProgress(p, text));
    ui.world = world;
    npcs = new NPCSystem(scene, world, state);
    npcs.build();
    player = new Player(scene, camera, world, state, audio);
    player.arms.visible = false;
    ui = new UI(world, state);
    ui.setPlayer(player);
    combat = new Combat(scene, camera, player, world, npcs, state, ui, audio);
    buildObjectiveBeacon();
    applyState();
    bindEvents();
    setupTouch();
    ui.bootProgress(1, 'BELLINGHAM IS AWAKE');
    setTimeout(() => {
      ui.hideBoot();
      ui.showMenu(hasSave());
      gameMode = 'menu';
      lastFrame = performance.now();
      requestAnimationFrame(loop);
    }, 500);
  } catch (err) {
    console.error(err);
    ui.bootProgress(1, 'SIGNAL LOST — SEE CONSOLE');
    $('boot-text').textContent = 'SIGNAL LOST. ' + (err.message || 'Unknown error');
  }
}

function requireConsent(then) {
  if (consentGiven) { then(); return; }
  ui.modal({
    kicker: 'MATURE CONTENT · 18+',
    title: 'BEFORE YOU CLOCK IN',
    body: `<p>Bellingham: The Underground is a work of fiction for adults. It contains violence, crime, alcohol and drug themes, profanity, and psychological horror.</p>
      <p>Romance and intimacy are between consenting adults only, and every intimate scene fades to black. There is no sexual violence or exploitation.</p>
      <p class="modal-quote">All characters are adults. The city is not real. The rain is a texture.</p>`,
    actions: [
      { label: 'I AM 18 OR OLDER', id: 'yes', primary: true },
      { label: 'LEAVE', id: 'no' }
    ],
    onAction: (a) => {
      ui.closeModal();
      if (a === 'yes') { consentGiven = true; then(); }
    }
  });
}

function startGame(useSave) {  audio.init();
  audio.setVolume(state.settings?.volume ?? .55);
  audio.setWeather(state.weather || 'rain');
  if (useSave) {
    const loaded = loadRawState();
    if (loaded) setState(loaded);
  } else {
    setState(defaultState());
    localStorage.removeItem(SAVE_KEY);
  }
  gameStarted = true;
  gameMode = 'play';
  ui.hideMenu();
  ui.showHUD();
  if (isTouch) ui.showTouch(true);
  player.arms.visible = true;
  applyState();
  player.teleport(player.x, player.z, state.player.position?.yaw || 0);
  refreshQuest();
  eventTimer = 55;
  weatherTimer = 80;
  saveGame(true);
  const d = world.districtAt(player.x, player.z);
  lastArea = d.id;
  ui.showArea(d.name, d.sub);
  if (!introShown && !useSave) {
    introShown = true;
    setTimeout(() => ui.subtitle('MONDAY. 7:42 AM. You have $1,284, a rented apartment, and a shift in eighteen minutes.', 7000), 900);
    setTimeout(() => ui.toast('<b>OBJECTIVE</b> · Clock in at The Steam Kettle.', ''), 2200);
  } else if (useSave) {
    ui.toast('<b>WELCOME BACK</b> · The rain kept your seat.', '');
  }
  ui.hideLookHint();
  requestLock();
}

function requestLock() {
  if (isTouch) return;
  try { canvas.requestPointerLock?.(); } catch {}
}

function loop(now) {
  const rawDt = Math.min(.06, (now - lastFrame) / 1000 || .016);
  lastFrame = now;
  elapsed += rawDt;
  if (gameMode === 'menu') {
    world.update(rawDt, elapsed, { x:player.x, y:0, z:player.z }, state);
    if (!isTouch) {
      camera.position.set(player.x, 1.68 + Math.sin(elapsed * .5) * .015, player.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = player.yaw + Math.sin(elapsed * .09) * .12;
      camera.rotation.x = -.03;
    }
    ui.updateHUD(false);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
    return;
  }
  const paused = ['dialogue','panel','map','settings','pause','timing','ending','modal'].includes(gameMode);
  if (!paused) {
    if (gameMode === 'play') {
      updateSimulation(rawDt);
      player.update(rawDt, elapsed);
      npcs.update(rawDt, { x:player.x, y:player.y, z:player.z }, elapsed);
      updateInteraction();
      updateStoryVisibility();
      updateWeather(rawDt);
      updateEvents(rawDt);
    } else if (gameMode === 'combat') {
      player.update(rawDt, elapsed);
      combat.update(rawDt);
      npcs.update(rawDt, { x:player.x, y:player.y, z:player.z }, elapsed);
    }
    world.update(rawDt, elapsed, { x:player.x, y:player.y, z:player.z }, state);
    updateObjectiveBeacon(rawDt);
    audio.update(rawDt);
    ui.updateHUD(false);
    if (gameMode === 'play') {
      if (now - lastAutoSave > 30000) { lastAutoSave = now; saveGame(true); }
    }
  } else {
    world.update(rawDt * .2, elapsed, { x:player.x, y:player.y, z:player.z }, state);
    audio.update(rawDt * .2);
  }
  if (timingGame) updateTiming(rawDt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateSimulation(dt) {
  const gm = dt * 1.15;
  state.time.minutes += gm;
  while (state.time.minutes >= 1440) {
    state.time.minutes -= 1440;
    state.time.day++;
    state.stats.days++;
    state.player.rentDue = Math.max(0, (state.player.rentDue || 0) - 1);
    if (state.player.rentDue === 0 && !state.player.homeOwned) {
      ui.toast('<b>LANDLORD</b> · Rent is due. $650. The door still opens. For now.', 'warn');
    }
    ui.toast(`<b>DAY ${state.time.day + 1}</b> · ${['MON','TUE','WED','THU','FRI','SAT','SUN'][state.time.day % 7]} in Bellingham.`, '');
  }
  const p = state.player;
  p.hunger = clamp(p.hunger - gm * .024, 0, 100);
  p.energy = clamp(p.energy - gm * .012, 0, 100);
  p.hygiene = clamp(p.hygiene - gm * .009, 0, 100);
  p.mood = clamp(p.mood - gm * .006 - (p.hunger < 20 ? gm * .01 : 0), 0, 100);
  p.intoxication = clamp((p.intoxication || 0) - gm * .08, 0, 100);
  p.heat = clamp((p.heat || 0) - gm * .004, 0, 100);
  if (p.hunger > 35 && p.energy > 30 && p.health < 100) p.health = clamp(p.health + gm * .008, 0, 100);
  if (p.intoxication > 0) p.mood = clamp(p.mood + gm * .004, 0, 100);
  const warns = [['hunger',22,'You are starving. Eat something.'],['energy',18,'Your eyes are closing. Sleep.'],['hygiene',16,'You smell like the bay.'],['mood',15,'The city is getting under your skin.']];
  for (const [key, thresh, text] of warns) {
    if (p[key] < thresh && performance.now() - (toastWarned[key] || 0) > 60000) {
      toastWarned[key] = performance.now();
      ui.toast('<b>NEED</b> · ' + text, 'warn');
    }
  }
  const d = world.districtAt(player.x, player.z);
  if (d.id !== lastArea) {
    lastArea = d.id;
    ui.showArea(d.name, d.sub);
  }
}

function updateWeather(dt) {
  weatherTimer -= dt;
  if (weatherTimer > 0) return;
  weatherTimer = 95 + Math.random() * 130;
  if (state.quest.stage === 4 && !state.flags.raincoatFound) {
    if (world.weather !== 'storm') { setWeather('storm'); ui.showEvent('BAROMETRIC FAILURE','The forecast says rain. The sky says something else.'); }
    return;
  }
  const keys = ['rain','rain','heavy','fog','overcast','clear'];
  if (state.weirdness > .6) keys.push('storm','storm');
  const next = keys[Math.floor(Math.random() * keys.length)];
  if (next !== world.weather) {
    setWeather(next);
    if (next === 'storm') {
      state.stats.storms++;
      ui.showEvent('ELECTRIC STORM','The lights flicker in a rhythm. It might be a heartbeat.');
      audio.thunder();
    } else {
      ui.toast(`<b>WEATHER</b> · ${WEATHER[next].label}.`, '');
    }
  }
}

function setWeather(key) {
  state.weather = key;
  world.setWeather(key);
  audio.setWeather(key);
  ui.updateHUD(true);
  updateStoryVisibility();
}

function refreshQuest() {
  if (!state || !ui) return;
  const q = QUESTS[state.quest.stage] || QUESTS[0];
  let obj = q.objective;
  let targetPos = null;
  if (q.target) {
    const b = BUSINESSES.find(x => x.id === q.target);
    if (b) targetPos = { x:b.entry.x, z:b.entry.z };
  }
  if (state.quest.stage === 2) targetPos = { x:world.arena.x, z:world.arena.z + 20 };
  if (state.quest.stage >= 3 && state.quest.stage !== 4 && state.quest.stage !== 5) {
    targetPos = player && Math.hypot(player.x - world.arena.x, player.z - world.arena.z) < 60
      ? { x:world.arena.x + 15, z:world.arena.z - 15 }
      : { x:BUSINESSES.find(b=>b.id==='terminal9').entry.x, z:BUSINESSES.find(b=>b.id==='terminal9').entry.z };
  }
  if (state.quest.stage === 3) {
    const wins = Math.max(0, (state.flags.bossesDefeated?.length || 0) - 1);
    obj = wins >= 3 ? 'Return to Terminal 9. Something has changed.' : `Defeat ${3 - wins} more challenger${3-wins===1?'':'s'} at Terminal 9.`;
    targetPos = player && Math.hypot(player.x - world.arena.x, player.z - world.arena.z) < 60
      ? { x:world.arena.x + 15, z:world.arena.z - 15 } : { x:190, z:-192 };
  }
  if (state.quest.stage === 4) {
    targetPos = { x:-112, z:180 };
    obj = world.weather === 'storm' ? 'Find the yellow raincoat at Boulevard Park.' : 'Wait for the storm. The forecast is wrong on purpose.';
  }
  if (state.quest.stage === 5) targetPos = { x:300, z:54 };
  if (state.quest.stage === 6) {
    targetPos = player && Math.hypot(player.x - world.arena.x, player.z - world.arena.z) < 60
      ? { x:world.arena.x + 15, z:world.arena.z - 15 } : { x:190, z:-192 };
  }
  if (state.quest.stage === 7) { targetPos = null; obj = 'Decide what Bellingham becomes.'; }
  objectiveTarget = targetPos;
  let progress = 0;
  if (state.quest.stage === 0) progress = state.flags.workedShift ? 1 : 0;
  if (state.quest.stage === 1) progress = state.flags.busRide ? 1 : 0;
  if (state.quest.stage === 2) progress = state.flags.bossesDefeated?.includes('barista') ? 1 : 0;
  if (state.quest.stage === 3) progress = clamp(((state.flags.bossesDefeated?.length || 0) - 1) / 3, 0, 1);
  if (state.quest.stage === 4) progress = state.flags.raincoatFound ? 1 : 0;
  if (state.quest.stage === 5) progress = state.flags.mirrorDefeated ? 1 : 0;
  if (state.quest.stage === 6) progress = state.flags.futureDefeated ? 1 : 0;
  ui.setObjective({ chapter:q.chapter, title:q.title, objective:obj, targetPos, progress });
  ui.updateHUD(true);
}

function setQuestStage(n) {
  state.quest.stage = n;
  refreshQuest();
  saveGame(true);
}

// --------------------------
// objective beacon
// --------------------------
function buildObjectiveBeacon() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color:0xff4338, transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.7,2.1,32), mat);
  ring.rotation.x = -Math.PI/2; ring.position.y = .1; g.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,9,6), mat.clone());
  beam.position.y = 4.5; beam.material.opacity = .18; g.add(beam);
  const light = new THREE.PointLight(0xff4338, 5, 20, 2); light.position.y = 2; g.add(light);
  g.userData = { ring, beam, light };
  g.visible = false;
  scene.add(g);
  objectiveBeacon = g;
}

function updateObjectiveBeacon(dt) {
  if (!objectiveBeacon) return;
  if (!objectiveTarget || gameMode === 'menu') { objectiveBeacon.visible = false; return; }
  objectiveBeacon.visible = true;
  objectiveBeacon.position.set(objectiveTarget.x, 0, objectiveTarget.z);
  const t = elapsed;
  objectiveBeacon.userData.ring.scale.setScalar(1 + Math.sin(t * 2.2) * .16);
  objectiveBeacon.userData.ring.material.opacity = .32 + Math.sin(t * 2.2) * .12;
  objectiveBeacon.userData.beam.material.opacity = .1 + Math.sin(t * 1.4) * .04;
  objectiveBeacon.userData.light.intensity = 3 + Math.sin(t * 2.2) * 1.5;
}

// --------------------------
// interaction
// --------------------------
function updateInteraction() {
  if (gameMode !== 'play') { ui.hidePrompt(); return; }
  if (player.driving) {
    currentTarget = { type:'exitCar' };
    ui.setPrompt('Exit The Rustbucket', 'F');
    return;
  }
  const npc = npcs.nearest(player.x, player.z, 3.8);
  const it = world.nearestInteractable(player.x, player.z, 5.2);
  if (npc && (!it || player.distanceTo(npc.x, npc.z) < player.distanceTo(it.x, it.z))) {
    currentTarget = { type:'npc', npc };
    ui.setPrompt('Talk to ' + npc.name, npc.tag || npc.role);
  } else if (it) {
    currentTarget = { type:'place', it };
    ui.setPrompt(it.label, it.sub || '');
  } else {
    currentTarget = null;
    ui.hidePrompt();
  }
}

function interact() {
  if (gameMode !== 'play') return;
  if (player.driving) { player.exitCar(); return; }
  if (!currentTarget) return;
  if (currentTarget.type === 'npc') talkTo(currentTarget.npc);
  else if (currentTarget.type === 'place') doPlace(currentTarget.it);
}

function doPlace(it) {
  audio.ui();
  switch (it.action) {
    case 'business': openBusiness(it.business); break;
    case 'home': openHome(); break;
    case 'vehicle': enterVehicle(); break;
    case 'bus': openTransit(); break;
    case 'arena': openArena(); break;
    case 'scenic': scenic(it); break;
    case 'alternate': toggleAlternate(); break;
    default: ui.toast(it.label, '');
  }
}

function enterVehicle() {
  if (!world.playerCar) return;
  player.enterCar(world.playerCar);
  ui.toast('<b>THE RUSTBUCKET</b> · W/S throttle · A/D steer · F exit.', '');
}

function scenic(it) {
  const map = {
    viewpoint:['BOULEVARD PARK','The bay is a sheet of hammered pewter. Mount Baker appears for four seconds, then thinks better of it.'],
    falls:['WHATCOM FALLS','The water hits the basin with the sound of a crowd that has just stopped cheering.'],
    trail:['CHUCKANUT RIDGE','Sword ferns, wet rock, and the distinct feeling that the trail is longer going back.'],
    old_bench:['ELIZABETH PARK','An old man feeds pigeons that are not there. He does not look up.'],
    boardwalk:['BOULEVARD BOARDWALK','The pilings creak. Beneath the water, something knocks back.'],
    pier:['CORMORANT PIER','At the end of the pier, the rain falls in two directions.'],
    scenic:['BELLINGHAM','You stand in the rain and let the city happen to you.']
  };
  const [title, text] = map[it.id] || ['BELLINGHAM', it.label];
  ui.showEvent(title, text);
  state.player.mood = clamp(state.player.mood + 3, 0, 100);
  if (it.id === 'falls' || it.id === 'trail') {
    state.player.energy = clamp(state.player.energy - 8, 0, 100);
    state.time.minutes += 35;
  }
  if (it.id === 'old_bench' && state.quest.stage >= 3 && !state.flags.bossesDefeated.includes('oldman')) {
    const npc = npcs.byId.get('oldman');
    if (npc) setTimeout(() => talkTo(npc), 400);
  }
}

// --------------------------
// dialogue
// --------------------------
function relOf(npc) {
  if (!state.relationships[npc.id]) {
    state.relationships[npc.id] = { affinity:0, trust:0, romance:0, grudge:0, met:false, status:'STRANGER', dates:0, memories:[], lastTalk:0, fights:0, wins:0, losses:0 };
  }
  return state.relationships[npc.id];
}

function statusFor(r) {
  if (r.romance >= 75) return 'PARTNER';
  if (r.romance >= 45) return 'DATING';
  if (r.affinity >= 55) return 'CLOSE FRIEND';
  if (r.affinity >= 25) return 'FRIEND';
  if (r.affinity >= 8) return 'ACQUAINTANCE';
  if (r.grudge >= 25) return 'GRUDGE';
  return 'STRANGER';
}

function bossFor(npc) { return BOSSES.find(b => b.id === npc.boss); }

function npcLine(npc, key) {
  const lines = {
    mara:{
      intro:'You’re late. Not for your shift. For something else.',
      city:'The city is a cup. Somebody keeps shaking it.',
      rumor:'People disappear after fights. Then they come back and order a latte. Same name. Different eyes.',
      weird:'“ROUND ONE.” She says it while steaming milk. The machine does not make a sound.',
      fight:'You want the undercard? Fine. But you should know I fight better before noon.'
    },
    elias:{
      intro:'The tide brought you. It usually brings something worse.',
      city:'Bellingham is built on water and promises. Both are unstable.',
      rumor:'There is a ferry that runs only when the fog is thick. It does not go to an island. It goes to a room.',
      weird:'The bay is closer than it was yesterday. You can hear it through the pavement.'
    },
    juniper:{
      intro:'You smell like radiator coffee and bad decisions. I like that in a person.',
      city:'The forest remembers every road they cut through it. It is patient about it.',
      rumor:'There are trails that only appear after a storm. I have mapped six. They all end at the same door.',
      weird:'The trees are leaning toward you. Not away. Toward.'
    },
    rook:{
      intro:'If you’re here to sell me a car, I already have eleven.',
      city:'This town runs on rust, rain, and people pretending they’re fine.',
      rumor:'Somebody’s been buying industrial magnets and old bus parts. Cash. No name. I like that in a customer.',
      weird:'Every engine on the lot turned over at the same time. I didn’t have the keys.'
    },
    aiko:{
      intro:'You’re the one the city keeps talking about. I wrote three pages on your footwork.',
      city:'It’s a planned city. The plan just isn’t public.',
      rumor:'The tournament is a data set. Every fight is a variable. Every relationship is a control group.',
      weird:'The chalk lines in the dojo moved while I was meditating. They spell your name now.'
    },
    august:{
      intro:'You’re late. You were late the last time, too.',
      city:'I remember when this park was a forest and the forest was a rumor.',
      rumor:'The first champion never left. They made him a bench and a pension and a quiet room. He still fights every night.',
      weird:'The pigeons are not real. Neither is the bread. The hunger is.'
    },
    raincoat:{
      intro:'The rain says you have been practicing.',
      city:'Bellingham is a coat. Something else is wearing it.',
      rumor:'When the storm ends, do not look at the sky. It will look back.',
      weird:'You are standing in a room with no walls. The rain is the architecture.'
    },
    celeste:{
      intro:'Ah. The new resident. I’ve read your file. You have potential. Potential is a zoning issue.',
      city:'This city is a body. I am its permit.',
      rumor:'There are no secret fights. There are only unscheduled public safety demonstrations.',
      weird:'Every microphone in the city is warm. That is not a metaphor.'
    },
    mirror:{
      intro:'You took your time. I have been practicing being you.',
      city:'This city is a mirror. You keep calling it a home.',
      rumor:'The strongest fighter gets to leave. The strongest fighter also gets to choose who stays.',
      weird:'Your reflection is standing behind you. Do not turn around.'
    },
    future:{
      intro:'I know how this ends. I have the save file.',
      city:'You think you are exploring. You are being measured.',
      rumor:'There is no exit. There is only a different version of the same apartment.',
      weird:'I remember the choice you are about to make. I made it worse.'
    },
    nadia:{
      intro:'You look like someone who reads the last page first. I do too.',
      city:'Fairhaven is old enough to remember when the water was closer.',
      rumor:'I keep a ledger of everyone who asks about the underground. Your name is on page six.',
      weird:'A book fell off the shelf. It was already open to the page about you.'
    },
    theo:{
      intro:'What’ll it be? You look like a cider person with a whiskey problem.',
      city:'A bar is just a room where the city tells the truth.',
      rumor:'The mayor comes in after midnight and drinks alone. She tips in brass tokens.',
      weird:'The jukebox played your voicemail. I didn’t know it could do that.'
    },
    brooke:{
      intro:'You’re carrying your weight wrong. We can fix that.',
      city:'This town has two seasons: rain and training.',
      rumor:'Every fighter in the underground started at a normal job. Barista. Mechanic. Mayor. It’s a recruitment pipeline.',
      weird:'The heavy bag breathed out. I’m not joking.'
    },
    sasha:{
      intro:'You have the face of someone who tips well and lies about it.',
      city:'Bellingham at 2 AM is a different city. It has better music and worse intentions.',
      rumor:'There’s a song that only plays in the underground. I’ve been trying to steal it for years.',
      weird:'The crowd kept dancing after the music stopped. Same rhythm. No song.'
    },
    dax:{
      intro:'Boss. You look like money. Or at least a down payment on money.',
      city:'This town is a laundromat for people who don’t want to be found.',
      rumor:'There’s a table. Quiet people. They decide who fights and who gets forgotten. I can get you a chair.',
      weird:'The men in gray asked about you. I told them you were nobody. I hope that was true.'
    },
    kim:{
      intro:'Keep your hands where I can see them. The city’s already having a weird week.',
      city:'I’ve worked here fourteen years. The crime map has a hole in it the size of a warehouse.',
      rumor:'People go missing after street fights. The reports get redacted before I finish typing.',
      weird:'Dispatch called me about a man standing in the rain. The man was me. I was at home.'
    },
    wren:{
      intro:'You getting on or just admiring the schedule?',
      city:'The 14 runs on time. The other one runs on something else.',
      rumor:'There’s a route with no number. It only shows up for people who’ve been in a fight. You have the look.',
      weird:'The bus was full of people who looked exactly like my passengers from yesterday. Same seats. Same shoes.'
    }
  };
  return lines[npc.id]?.[key] || null;
}

function greetingFor(npc) {
  const r = relOf(npc);
  const weird = state.weirdness || .1;
  if (!r.met) {
    r.met = true;
    return npcLine(npc, 'intro') || npc.intro || `${npc.name} looks at you like they have seen you somewhere before.`;
  }
  if (r.fights > 0) {
    return r.wins > 0
      ? `“Still standing,” ${npc.name.split(' ')[0]} says. “That’s not nothing.”`
      : `“You heal fast,” ${npc.name.split(' ')[0]} says. “Most people don’t come back after a night like that.”`;
  }
  if (weird > .72 && Math.random() < .38) return npcLine(npc, 'weird') || 'They say your name before you tell them. Then they smile like it was a joke.';
  if (r.romance >= 55) return ['They lean against the nearest wall like it was built for this.', 'Their hand finds yours. The rain gets louder.', 'You get the smile they keep for after midnight.'][Math.floor(Math.random()*3)];
  if (r.grudge >= 25) return 'They look at you the way you look at a bruise.';
  if (r.affinity >= 25) return `“Hey, ${state.player.name.split(' ')[0]}.” They say it like it’s a small gift.`;
  if (r.affinity >= 8) return 'They nod. The city keeps moving around you both.';
  return ['“Yeah?”', 'They give you the half-second version of a smile.', '“You need something?”'][Math.floor(Math.random()*3)];
}

function talkTo(npc) {
  if (!npc) return;
  if (player.driving) player.exitCar();
  gameMode = 'dialogue';
  player.moveInput(0, 0);
  const r = relOf(npc);
  r.lastTalk = state.time.day * 1440 + state.time.minutes;
  const text = greetingFor(npc);
  ui.openDialogue(npc, text, choicesFor(npc), (ch) => dialogueChoice(npc, ch));
  audio.speak();
}

function choicesFor(npc) {
  const r = relOf(npc);
  const ch = [{ id:'talk', label:'TALK' }, { id:'rain', label:'TALK ABOUT THE RAIN' }];
  ch.push({ id:'city', label:'ASK ABOUT THE CITY' });
  ch.push({ id:'rumor', label:'ASK ABOUT RUMORS' });
  if (r.met) ch.push({ id:'compliment', label:'COMPLIMENT' });
  if (npc.romanceable && (npc.age || 0) >= 18) {
    ch.push({ id:'flirt', label:'FLIRT' });
    if (r.affinity >= 20) ch.push({ id:'date', label:'ASK ON A DATE' });
    if (r.romance >= 35) ch.push({ id:'kiss', label:'KISS' });
    if (r.romance >= 60) ch.push({ id:'intimacy', label:'SPEND THE NIGHT', special:true });
  }
  if (state.inventory.some(i => ITEMS[i.id]?.type === 'gift')) ch.push({ id:'gift', label:'GIVE A GIFT' });
  if (npc.fighter) ch.push({ id:'spar', label:'SPAR' });
  const boss = bossFor(npc);
  if (boss && canChallengeBoss(boss.id)) ch.push({ id:'challenge', label:'CHALLENGE', special:true });
  if (npc.id === 'dax' && !state.flags.quietTable) ch.push({ id:'quiet', label:'LISTEN TO THE OFFER', special:true });
  ch.push({ id:'bye', label:'LEAVE' });
  return ch;
}

function dialogueChoice(npc, ch) {
  const r = relOf(npc);
  const id = ch.id;
  audio.ui();
  if (id === 'bye') { closeDialogue(); return; }
  if (id === 'talk') {
    const text = r.affinity > 20
      ? ['“I was wondering when you’d come by.”', '“You’re becoming a regular. That’s either good or terminal.”', 'They tell you a small, true thing about their day.'][Math.floor(Math.random()*3)]
      : ['They talk about work, the weather, the price of everything.', 'The conversation is ordinary. It feels like a luxury.', '“Not much. Same rain. Same city. Different trouble.”'][Math.floor(Math.random()*3)];
    r.affinity = clamp(r.affinity + 2, 0, 100); r.trust = clamp(r.trust + 1, 0, 100);
    addMemory(npc, 'shared a quiet conversation');
    ui.updateDialogueText(text); refreshDialogueChoices(npc); return;
  }
  if (id === 'rain') {
    const text = npcLine(npc, 'weird') && state.weirdness > .35
      ? npcLine(npc, 'weird')
      : ['“It’s Bellingham. Rain is the local language.”', '“You get used to it. Then you get weird about it.”', '“I like the rain. It makes the city feel honest.”'][Math.floor(Math.random()*3)];
    r.affinity = clamp(r.affinity + 1, 0, 100);
    ui.updateDialogueText(text); refreshDialogueChoices(npc); return;
  }
  if (id === 'city') {
    ui.updateDialogueText(npcLine(npc, 'city') || '“It’s a city. It has opinions about itself.”');
    refreshDialogueChoices(npc); return;
  }
  if (id === 'rumor') {
    let text = npcLine(npc, 'rumor') || '“Rumors are just weather with better marketing.”';
    if (state.quest.stage >= 3) text += ' They glance at the nearest streetlight like it might be recording.';
    state.weirdness = clamp(state.weirdness + .004, 0, 1);
    world.setWeirdness(state.weirdness);
    ui.updateDialogueText(text); refreshDialogueChoices(npc); return;
  }
  if (id === 'compliment') {
    r.affinity = clamp(r.affinity + 5, 0, 100); r.mood = r.mood;
    state.player.mood = clamp(state.player.mood + 3, 0, 100);
    ui.updateDialogueText(['They try not to smile. They fail.', '“Careful. I’m susceptible to that.”', '“You’re not bad yourself. For someone who smells like the bay.”'][Math.floor(Math.random()*3)]);
    refreshDialogueChoices(npc); return;
  }
  if (id === 'flirt') {
    if ((npc.age || 0) < 18) { ui.updateDialogueText('They step back. “No.” The conversation is over.'); return; }
    if (r.affinity < 10) {
      ui.updateDialogueText('They give you a look that could refrigerate a beer. “Let’s not.”');
      r.grudge = clamp(r.grudge + 2, 0, 100);
    } else {
      r.romance = clamp(r.romance + 6, 0, 100); r.affinity = clamp(r.affinity + 4, 0, 100);
      r.status = statusFor(r); addMemory(npc, 'flirted and meant it');
      ui.updateDialogueText(['They hold your gaze a beat too long. “Smooth. Suspiciously smooth.”', '“You’re trouble,” they say, and do not move away.', 'The rain gets between you. Neither of you steps back.'][Math.floor(Math.random()*3)]);
    }
    refreshDialogueChoices(npc); return;
  }
  if (id === 'gift') {
    const gift = state.inventory.find(i => ITEMS[i.id]?.type === 'gift');
    if (!gift) { ui.updateDialogueText('You have nothing to give but the truth. They can tell.'); return; }
    removeItem(gift.id, 1);
    r.affinity = clamp(r.affinity + 12, 0, 100); r.romance = clamp(r.romance + 5, 0, 100); r.status = statusFor(r);
    addMemory(npc, `received ${ITEMS[gift.id].name}`);
    ui.updateDialogueText(`You give them the ${ITEMS[gift.id].name}. ${npc.name.split(' ')[0]} turns it over once, like it might be a key. “Oh.”`);
    refreshDialogueChoices(npc); return;
  }
  if (id === 'date') {
    if (r.affinity < 20) { ui.updateDialogueText('“Maybe when I know you better.”'); return; }
    r.dates++; r.romance = clamp(r.romance + 10, 0, 100); r.affinity = clamp(r.affinity + 8, 0, 100);
    r.status = statusFor(r); addMemory(npc, 'went on a date');
    state.player.mood = clamp(state.player.mood + 16, 0, 100);
    state.player.money = Math.max(0, state.player.money - 35);
    state.time.minutes += 150;
    state.player.energy = clamp(state.player.energy - 10, 0, 100);
    closeDialogue();
    gameMode = 'modal';
    ui.cinematic('A NIGHT OFF', 'THE CITY, BRIEFLY KIND', 'You eat something warm. You walk until the rain stops being an emergency. Neither of you checks your phone.');
    setTimeout(() => {
      ui.modal({
        kicker:'RELATIONSHIP', title:'A GOOD NIGHT',
        body:`<p>You and ${esc(npc.name)} spend two hours at ${['Boulevard Park','the marina','a noodle place that is somehow still open','the bookstore after hours'][Math.floor(Math.random()*4)]}. It is not cinematic. It is better.</p><p class="modal-quote">“Same time next week?” they ask.<br>You say yes before you can calculate anything.</p>`,
        actions:[{label:'CONTINUE', id:'ok', primary:true}],
        onAction:() => { ui.closeModal(); gameMode = 'play'; refreshDialogueChoices(npc); }
      });
    }, 1500);
    return;
  }
  if (id === 'kiss') {
    if (r.romance < 35) { ui.updateDialogueText('They turn their head at the last second. “Not yet.”'); return; }
    r.romance = clamp(r.romance + 7, 0, 100); r.affinity = clamp(r.affinity + 5, 0, 100); r.status = statusFor(r);
    state.player.mood = clamp(state.player.mood + 12, 0, 100); addMemory(npc, 'kissed in the rain');
    ui.updateDialogueText(['They kiss you like the city has stopped watching. For a second, it has.', '“Okay,” they breathe. “Okay.”', 'The rain does most of the work. They do the rest.'][Math.floor(Math.random()*3)]);
    refreshDialogueChoices(npc); return;
  }
  if (id === 'intimacy') {
    if (r.romance < 60) { ui.updateDialogueText('“I like you. I’m not there yet.”'); return; }
    closeDialogue();
    gameMode = 'modal';
    ui.modal({
      kicker:'CONSENT · ADULTS ONLY', title:'SPEND THE NIGHT?',
      body:`<p>${esc(npc.name)} asks if you want to come back to their place. You both agree, clearly, without pressure.</p><p class="modal-quote">The rest happens off-screen. This story fades to black.</p>`,
      actions:[{label:'YES, TONIGHT', id:'yes', primary:true}, {label:'NOT TONIGHT', id:'no'}],
      onAction:(a) => {
        ui.closeModal();
        if (a === 'no') { gameMode='play'; ui.toast('<b>BOUNDARY</b> · No pressure. The night stays yours.', ''); return; }
        r.romance = clamp(r.romance + 12, 0, 100); r.affinity = clamp(r.affinity + 10, 0, 100); r.status = statusFor(r);
        state.player.mood = clamp(state.player.mood + 25, 0, 100); state.player.energy = clamp(state.player.energy - 15, 0, 100);
        state.time.minutes += 390; addMemory(npc, 'spent the night together');
        gameMode = 'ending';
        (async () => {
          await ui.fade(true, 900);
          await new Promise(r => setTimeout(r, 900));
          ui.subtitle('The rest is yours. The city politely looks away.', 2500);
          await ui.fade(false, 900);
          gameMode = 'play';
          ui.toast(`<b>MORNING</b> · You wake up next to ${npc.name}. The rain has not stopped. It never does.`, '');
          checkJealousy(npc);
          saveGame(true);
        })();
      }
    });
    return;
  }
  if (id === 'spar') {
    closeDialogue();
    startFight(npc, null, { street:true });
    return;
  }
  if (id === 'challenge') {
    const boss = bossFor(npc);
    if (!boss) return;
    closeDialogue();
    if (boss.id === 'raincoat' && !state.flags.raincoatFound) {
      if (world.weather !== 'storm') { ui.toast('<b>NO STORM</b> · The raincoat is not here yet.', 'warn'); return; }
    }
    showBossIntro(boss, npc);
    return;
  }
  if (id === 'quiet') {
    r.affinity = clamp(r.affinity + 4, 0, 100); r.trust = clamp(r.trust + 2, 0, 100);
    closeDialogue();
    gameMode = 'modal';
    ui.modal({
      kicker:'THE QUIET TABLE', title:'A SEAT WITH NO NAME',
      body:`<p>Dax leans close enough that you can smell expensive cologne and bad intentions.</p><p class="modal-quote">“There’s a table under Terminal 9. They don’t bet money. They bet outcomes. You get a chair if you bring them something they can’t simulate.”</p><p>He taps the table twice. Somewhere, a door you have never seen unlocks.</p>`,
      actions:[{label:'TAKE THE SEAT · $250', id:'yes', primary:true}, {label:'WALK AWAY', id:'no'}],
      onAction:(a) => {
        ui.closeModal(); gameMode = 'play';
        if (a === 'no') { ui.toast('<b>DECLINED</b> · Dax shrugs. “Everyone says that first.”', ''); return; }
        if (state.player.money < 250) { ui.toast('<b>NO CASH</b> · Dax’s smile closes like a register.', 'warn'); return; }
        state.player.money -= 250; state.flags.quietTable = true; state.flags.darkRep = (state.flags.darkRep || 0) + 1;
        state.player.reputation = clamp(state.player.reputation + 20, -100, 1000);
        state.weirdness = clamp(state.weirdness + .08, 0, 1); world.setWeirdness(state.weirdness);
        ui.toast('<b>THE QUIET TABLE</b> · You have a seat. It is colder than it looks.', 'warn');
        saveGame(true);
      }
    });
    return;
  }
}

function refreshDialogueChoices(npc) {
  if (!ui.dialogueOpen) return;
  const choices = choicesFor(npc);
  const box = $('dialogue-choices');
  box.innerHTML = '';
  for (const ch of choices) {
    const b = document.createElement('button');
    b.textContent = ch.label;
    if (ch.special) b.classList.add('special');
    b.addEventListener('click', () => dialogueChoice(npc, ch));
    box.appendChild(b);
  }
}

function addMemory(npc, text) {
  const r = relOf(npc);
  r.memories.unshift({ day:state.time.day, text });
  r.memories = r.memories.slice(0, 8);
}

function checkJealousy(npc) {
  const others = Object.entries(state.relationships).filter(([id, r]) => id !== npc.id && r.romance >= 55);
  if (others.length && Math.random() < .45) {
    const [id, r] = others[Math.floor(Math.random()*others.length)];
    const other = NPCS.find(n => n.id === id);
    r.romance = clamp(r.romance - 8, 0, 100); r.grudge = clamp(r.grudge + 10, 0, 100); r.status = statusFor(r);
    addMemory(other, 'heard about someone else');
    setTimeout(() => ui.modal({
      kicker:'RELATIONSHIP CONSEQUENCE', title:'SOMEONE SAW YOU',
      body:`<p>${esc(other.name)} texts you a photo of the two of you from last night. No caption. Then: “I thought we were being honest.”</p><p class="modal-quote">Romance −8 · Grudge +10</p>`,
      actions:[{label:'APOLOGIZE', id:'ok', primary:true}],
      onAction:() => { ui.closeModal(); gameMode='play'; }
    }), 1200);
  }
}

function closeDialogue() {
  ui.closeDialogue();
  gameMode = 'play';
}

function removeItem(id, qty = 1) {
  const it = state.inventory.find(i => i.id === id);
  if (!it) return false;
  it.qty -= qty;
  if (it.qty <= 0) state.inventory = state.inventory.filter(i => i !== it);
  return true;
}

function addItem(id, qty = 1) {
  const it = state.inventory.find(i => i.id === id);
  if (it) it.qty += qty; else state.inventory.push({ id, qty });
}

function useItem(id) {
  const item = ITEMS[id];
  if (!item) return;
  const inv = state.inventory.find(i => i.id === id);
  if (!inv) return;
  const p = state.player;
  if (item.effects) {
    for (const [k, v] of Object.entries(item.effects)) p[k] = clamp((p[k] || 0) + v, 0, k === 'intoxication' ? 100 : 100);
  }
  removeItem(id, 1);
  if (id === 'pills') {
    p.health = clamp(p.health - 12, 0, 100); p.mood = clamp(p.mood + 20, 0, 100);
    state.flags.darkRep = (state.flags.darkRep || 0) + 1;
    ui.toast('<b>UNLABELED</b> · Your heart does a drum fill. The room breathes with you.', 'warn');
  }
  if (id === 'joint') ui.toast('<b>CHUCKANUT GREEN</b> · The rain sounds like applause.', '');
  ui.toast(`<b>USED</b> · ${item.name}.`, '');
  audio.cash();
  saveGame(true);
  if (ui.panelOpen) openPhone('bag');
}

// --------------------------
// business panels
// --------------------------
function card(title, desc, price, act, arg, tag = '', extra = '') {
  return `<div class="panel-card clickable" data-act="${act}" data-arg="${esc(arg)}">
    ${tag ? `<span class="tag">${esc(tag)}</span>` : ''}
    <h3>${esc(title)}</h3><p>${esc(desc)}</p>
    ${price ? `<span class="price">${esc(price)}</span>` : ''}${extra}
  </div>`;
}

function openBusiness(id) {
  const b = BUSINESSES.find(x => x.id === id);
  if (!b) return;
  gameMode = 'panel';
  player.moveInput(0, 0);
  const p = state.player;
  let html = `<div class="panel-hero"><div class="panel-hero-main"><span class="eyebrow">${esc(b.type.toUpperCase())} · ${esc(b.name.toUpperCase())}</span><h3>${esc(b.name)}</h3><p>${esc(b.desc)}</p></div>
    <div><div class="panel-stat"><span>STATUS</span><b class="good">OPEN</b></div><div class="panel-stat"><span>WALLET</span><b>${fmt(p.money)}</b></div><div class="panel-stat"><span>REPUTATION</span><b>${esc(ui.rank(p.reputation))}</b></div><div class="panel-stat"><span>WEATHER</span><b>${esc(WEATHER[state.weather]?.label || 'RAIN')}</b></div></div></div>`;
  if (b.type === 'cafe') {
    html += `<div class="panel-section-title">ORDER AT THE COUNTER</div><div class="panel-grid">
      ${card('Rain City Drip','Bitter, hot, honest. Restores energy.', '$5','consume','coffee','DRINK')}
      ${card('Cardamom Knot','Still warm. Somehow.', '$7','consume','pastry','FOOD')}
      ${card('Oat Latte','The barista makes it without asking. It is perfect. It is unsettling.', '$6','consume','coffee','DRINK')}
      ${card('Clock In','Four-hour shift. Tips depend on your timing. The first shift changes everything.', '$80+','work','shift','JOB')}
    </div><p class="panel-note">Mara Voss works the counter. She is very fast. She is always already looking at the door when you come in.</p>`;
  } else if (b.type === 'bar') {
    html += `<div class="panel-section-title">ON TAP</div><div class="panel-grid">
      ${card('Harbor Ale','Local. Hazy. Dangerous in numbers.','$8','consume','beer','DRINK')}
      ${card('Dry Apple Cider','A pint of autumn.','$9','consume','cider','DRINK')}
      ${card('Railroad Whiskey','A bad idea with a good finish.','$12','consume','whiskey','DRINK')}
      ${card('Play Pool','Lose $10 and an hour. Gain a story.','$10','activity','pool','SOCIAL')}
      ${card('Ask About the Underground','The bartender has heard every secret in town.','FREE','activity','underground','RUMOR')}
    </div><p class="panel-note">Theo Marsh pours without looking. He looks at you instead.</p>`;
  } else if (b.type === 'restaurant') {
    html += `<div class="panel-section-title">FROM THE KITCHEN</div><div class="panel-grid">
      ${card('Cedar Smoked Turkey','A very serious sandwich.','$12','consume','sandwich','FOOD')}
      ${card('Late Night Ramen','The broth has seen things.','$10','consume','ramen','FOOD')}
      ${card('Table for One','Sit by the window. Watch the rain. Restore mood.','$18','activity','table','DINE')}
    </div>`;
  } else if (b.type === 'gym') {
    html += `<div class="panel-section-title">NORTH SOUND STRENGTH</div><div class="panel-grid">
      ${card('Train · Strength','Timing drills on the heavy bag. Builds strength and endurance.','$15','train','gym','TRAINING')}
      ${card('Train · Muay Thai','Learn the eight limbs. Unlocks the MUAY THAI style.','$150','learn','muay','STYLE')}
      ${card('Shower','Wash the bay off. Restores hygiene.','$5','activity','shower','SELF CARE')}
      ${card('Sparring Partner','Challenge Brooke. She does not go easy.','FREE','challenge','brooke','FIGHT')}
    </div><p class="panel-note">Brooke Sato wraps her hands while she talks. Never stops watching your feet.</p>`;
  } else if (b.type === 'club') {
    html += `<div class="panel-section-title">STATIC / TONIGHT</div><div class="panel-grid">
      ${card('Drink Special','Something purple. The bartender calls it “The Simulation.”','$11','consume','beer','DRINK')}
      ${card('Dance','Lose yourself in the bass. Mood up. Energy down.','$10','activity','dance','SOCIAL')}
      ${card('Find Company','Consensual adult company for the evening. Non-graphic; fades to black.','$80','activity','company','ADULT')}
      ${card('Listen to Sasha','The musician knows a song that only plays underground.','FREE','activity','sasha','SOCIAL')}
    </div><p class="panel-note">The floor is sticky. The lights are illegal. Somebody in the corner is counting your drinks.</p>`;
  } else if (b.type === 'tattoo') {
    html += `<div class="panel-section-title">CASCADIA INK · FLASH SHEET</div><div class="panel-grid">
      ${TATTOOS.filter(t => t !== 'None').map(t => card(t, 'Original linework. Heals in the rain.', '$80', 'tattoo', t, 'TATTOO')).join('')}
    </div><p class="panel-note">The artist asks what you want to remember. You say “the rain.” She nods like she has heard worse.</p>`;
  } else if (b.type === 'clothing') {
    html += `<div class="panel-section-title">SECOND RAIN · OUTFITS</div><div class="panel-grid">
      ${OUTFITS.map(o => card(o, 'Vintage, repaired, and slightly haunted.', '$45', 'outfit', o, 'OUTFIT')).join('')}
    </div><div class="panel-section-title">HAIR</div><div class="panel-grid">
      ${HAIRSTYLES.map(h => card(h, 'The rain will ruin it anyway.', '$30', 'hair', h, 'HAIR')).join('')}
    </div>`;
  } else if (b.type === 'store') {
    html += `<div class="panel-section-title">OPEN 24 HOURS</div><div class="panel-grid">
      ${card('Sandwich','For later.','$8','buy','sandwich','FOOD')}
      ${card('Energy Drink','Tastes like a screensaver.','$6','buy','energy_drink','DRINK')}
      ${card('First Aid Kit','Gauze, tape, and a little prayer.','$22','buy','firstaid','HEAL')}
      ${card('Umbrella','Broken. The wind has opinions.','$4','buy','umbrella','MISC')}
      ${card('Fictional Local Green','Fictional, local, and probably not what you think. 18+.','$15','buy','joint','18+')}
      ${card('Odd Job · Stock Shelves','Three hours of fluorescent light. $55.','$55','work','stock','JOB')}
    </div><p class="panel-note">The clerk does not look up. The security camera does.</p>`;
  } else if (b.type === 'clinic') {
    html += `<div class="panel-section-title">FREE CLINIC</div><div class="panel-grid">
      ${card('Patch Up','Stitches, ice, a lollipop. Restores health.','$50','activity','heal','CARE')}
      ${card('Detox','Flush the night out. Reduces intoxication.','$35','activity','detox','CARE')}
      ${card('Buy First Aid Kit','For the next bad decision.','$22','buy','firstaid','HEAL')}
      ${card('Talk to Priya','The nurse has seen the missing-person reports.','FREE','activity','nurse','RUMOR')}
    </div>`;
  } else if (b.type === 'pawn') {
    html += `<div class="panel-section-title">BUY / SELL</div><div class="panel-grid">
      ${card('The Quiet Architecture','A novel about a city that edits itself. A gift for Nadia.','$24','buy','book','GIFT')}
      ${card('Rain Ring','A silver band with a tiny storm cloud etched into it.','$90','buy','ring','GIFT')}
      ${card('Cedar & Fern Bouquet','The florist wrapped it in yesterday’s newspaper.','$38','buy','flowers','GIFT')}
      ${card('Unlabeled Pills','“FOR THE RAIN.” 18+. Side effects include honesty.','$28','buy','pills','18+')}
    </div><div class="panel-section-title">SELL FROM BAG</div><div class="panel-grid">
      ${state.inventory.length ? state.inventory.map(i => card(ITEMS[i.id]?.name || i.id, `You have ${i.qty}. Sell one for half price.`, '$' + Math.floor((ITEMS[i.id]?.price || 0)/2), 'sell', i.id, 'SELL')).join('') : '<div class="panel-empty">Nothing to sell. The city already took its cut.</div>'}
    </div>`;
  } else if (b.type === 'cityhall') {
    html += `<div class="panel-section-title">CIVIC SERVICES</div><div class="panel-grid">
      ${card('Pay a Fine','Make your heat disappear. $75.','$75','activity','payfine','CIVIC')}
      ${card('Request an Audience','Mayor Ward has three minutes. She will use two.','FREE','activity','mayor','POLITICS')}
      ${card('Read the Public Record','Construction permits for Terminal 9. Odd.','FREE','activity','records','RUMOR')}
    </div>`;
  } else if (b.type === 'transit') {
    html += `<div class="panel-section-title">ROUTES</div><div class="panel-grid">
      ${card('Downtown Loop','Railroad Ave. $2.','$2','travel','downtown','BUS')}
      ${card('Fairhaven','Old Town. $2.','$2','travel','fairhaven','BUS')}
      ${card('Campus','Western Washington. $2.','$2','travel','campus','BUS')}
      ${card('Waterfront','Boulevard Park and marina. $2.','$2','travel','waterfront','BUS')}
      ${card('Whatcom Falls','Cedar Hollow trailhead. $2.','$2','travel','falls','BUS')}
      ${card('Lake Whatcom','Mirror Lake dock. $2.','$2','travel','lake','BUS')}
      ${card('Industrial','Rook’s Salvage / Terminal 9. $2.','$2','travel','industrial','BUS')}
      ${state.quest.stage >= 1 ? card('ROUTE 0','Unlisted. No fare. The driver does not ask your name.','FREE','activity','hiddenbus','???') : ''}
    </div><p class="panel-note">The departure board flickers. For a moment it shows a route with no number.</p>`;
  } else if (b.type === 'marina') {
    html += `<div class="panel-section-title">CORMORANT MARINA</div><div class="panel-grid">
      ${card('Walk the Docks','Salt, diesel, and a horizon that will not hold still.','FREE','activity','docks','SCENIC')}
      ${card('Ferryman’s Challenge','Elias Crane is waiting. He has been waiting for a while.','FREE','challenge','elias','FIGHT')}
      ${card('Buy a Brass Token','The dockmaster sells them. No route number.','$25','buy','token','ARTIFACT')}
    </div>`;
  } else if (b.type === 'bookstore') {
    html += `<div class="panel-section-title">RAVEN & SALT BOOKS</div><div class="panel-grid">
      ${card('The Quiet Architecture','A novel about a city that edits itself.','$24','buy','book','GIFT')}
      ${card('Local Zines','Three stapled pamphlets about rain, mushrooms, and the mayor.','$12','buy','book','GIFT')}
      ${card('Deliver the Book','If you have the pawn-shop copy, Nadia is looking for it.','FREE','activity','deliver','SIDE QUEST')}
    </div><p class="panel-note">Nadia Okafor is reshelving a section that did not exist yesterday.</p>`;
  } else if (b.type === 'dojo') {
    html += `<div class="panel-section-title">EMPTY CUP DOJO</div><div class="panel-grid">
      ${card('Train · Flow','Learn to move like water. Unlocks the FLOW style.','$120','learn','flow','STYLE')}
      ${card('Spar with Aiko','She has already read your footwork.','FREE','challenge','aiko','FIGHT')}
      ${card('Meditate','Sit with the rain. Restore mood and stamina.','FREE','activity','meditate','CARE')}
    </div>`;
  } else if (b.type === 'trail') {
    html += `<div class="panel-section-title">CEDAR HOLLOW</div><div class="panel-grid">
      ${card('Hike to the Falls','Mud, moss, and a waterfall that sounds like applause.','FREE','activity','hike','SCENIC')}
      ${card('Juniper’s Challenge','She says the trail is closed. You are on it anyway.','FREE','challenge','juniper','FIGHT')}
    </div>`;
  } else if (b.type === 'lake') {
    html += `<div class="panel-section-title">MIRROR LAKE</div><div class="panel-grid">
      ${card('Skip Stones','The lake is very still. Your reflection is not.','FREE','activity','stones','SCENIC')}
      ${state.quest.stage >= 5 ? card('Face the Reflection','It has been practicing being you.','FREE','challenge','mirror','FIGHT') : ''}
    </div>`;
  } else if (b.type === 'junkyard') {
    html += `<div class="panel-section-title">ROOK’S SALVAGE</div><div class="panel-grid">
      ${card('Train · Wrestling','Grapples, throws, and the wisdom of heavy objects. Unlocks WRESTLING.','$110','learn','wrestling','STYLE')}
      ${card('Spar with Rook','Warranty void.','FREE','challenge','rook','FIGHT')}
      ${card('Repaint the Rustbucket','A new coat of paint will not fix the engine. $120.','$120','activity','paint','VEHICLE')}
    </div>`;
  } else if (b.type === 'motel') {
    html += `<div class="panel-section-title">RAINIER MOTOR LODGE</div><div class="panel-grid">
      ${card('Room for the Night','Sleep until morning. $45.','$45','activity','motelsleep','REST')}
      ${card('Shower','Hot water. Questionable pressure.','$5','activity','shower','CARE')}
    </div><p class="panel-note">Vacancy. Always vacancy.</p>`;
  } else if (b.type === 'radio') {
    html += `<div class="panel-section-title">KAVX 88.1</div><div class="panel-grid">
      ${card('Listen Live','Local music, local weather, local warnings.','FREE','activity','listen','MEDIA')}
      ${card('Request a Song','The host knows your name before you say it.','FREE','activity','request','WEIRD')}
    </div>`;
  } else if (b.type === 'park') {
    html += `<div class="panel-section-title">${esc(b.name.toUpperCase())}</div><div class="panel-grid">
      ${card('Sit on a Bench','Watch the rain. Restore mood.','FREE','activity','bench','SCENIC')}
      ${b.id === 'old_park' ? card('August’s Challenge','The old man is not what he appears. He is worse.','FREE','challenge','august','FIGHT') : ''}
    </div>`;
  } else if (b.type === 'pier') {
    html += `<div class="panel-section-title">THE END OF THE BOARDWALK</div><div class="panel-grid">
      ${card('Look at the Water','The rain falls in two directions here.','FREE','activity','pier','SCENIC')}
      ${state.quest.stage === 4 && world.weather === 'storm' ? card('Follow the Yellow Coat','The raincoat is waiting at the end of the pier.','FREE','challenge','raincoat','FIGHT') : ''}
    </div>`;
  } else if (b.type === 'campus') {
    html += `<div class="panel-section-title">VIKING UNION</div><div class="panel-grid">
      ${card('Cheap Noodles','$6. Restores hunger.','$6','consume','ramen','FOOD')}
      ${card('Listen to a Lecture','“Urban Systems and the Illusion of Choice.”','FREE','activity','lecture','WEIRD')}
    </div>`;
  } else {
    html += `<div class="panel-empty">The door is open. Nobody is behind the counter.</div>`;
  }
  html += `<div style="display:flex;justify-content:flex-end;margin-top:22px"><button class="panel-action ghost" data-act="leave">LEAVE</button></div>`;
  ui.openPanel({ kicker:b.type.toUpperCase(), title:b.name, html, onMount:(body) => bindBizActions(body, b) });
}

function bindBizActions(body, b) {
  body.querySelectorAll('[data-act]').forEach(el => {
    el.addEventListener('click', () => {
      const act = el.dataset.act, arg = el.dataset.arg;
      bizAction(act, arg, b);
    });
  });
}

function bizAction(act, arg, b) {
  const p = state.player;
  audio.ui();
  if (act === 'leave') { closePanel(); return; }
  if (act === 'consume') {
    const item = ITEMS[arg];
    if (!item) return;
    if (p.money < item.price) { ui.toast('<b>NO CASH</b> · The counter is patient. Your wallet is not.', 'warn'); return; }
    p.money -= item.price;
    for (const [k,v] of Object.entries(item.effects || {})) p[k] = clamp((p[k] || 0) + v, 0, 100);
    if (arg === 'beer' || arg === 'cider' || arg === 'whiskey') { state.stats.drinks++; p.intoxication = clamp(p.intoxication + (arg === 'whiskey' ? 16 : 8), 0, 100); }
    state.time.minutes += 18; audio.cash();
    ui.toast(`<b>ORDERED</b> · ${item.name}.`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'buy') {
    const item = ITEMS[arg];
    if (!item) return;
    if (p.money < item.price) { ui.toast('<b>NO CASH</b> · The city does not extend credit to strangers.', 'warn'); return; }
    p.money -= item.price; addItem(arg, 1); audio.cash();
    ui.toast(`<b>BOUGHT</b> · ${item.name} added to your bag.`, '');
    if (arg === 'token') {
      if (!state.flags.artifacts.includes('token')) state.flags.artifacts.push('token');
      state.flags.busRide = true;
    }
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'sell') {
    const item = ITEMS[arg];
    if (!item) return;
    const price = Math.max(1, Math.floor((item.price || 0) / 2));
    removeItem(arg, 1); p.money += price; audio.cash();
    ui.toast(`<b>SOLD</b> · ${item.name} for ${fmt(price)}.`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'work') {
    if (arg === 'shift') startTimingGame({ kicker:'THE STEAM KETTLE', title:'CLOCK IN', rounds:3, prompt:'HIT THE MARK WHEN THE SHOT PULLS', onComplete:finishShift });
    else if (arg === 'stock') startTimingGame({ kicker:'PIGEON MART', title:'STOCK SHELVES', rounds:3, prompt:'STACK THE SHELF', onComplete:(hits) => {
      const pay = 30 + hits * 12; p.money += pay; p.energy = clamp(p.energy - 18, 0, 100); state.time.minutes += 180; state.stats.shifts++;
      closePanel(); ui.toast(`<b>SHIFT COMPLETE</b> · ${fmt(pay)}. Your hands smell like cardboard.`, ''); saveGame(true);
    }});
    return;
  }
  if (act === 'activity') {
    if (arg === 'pool') { if (p.money < 10) return noCash(); p.money -= 10; state.time.minutes += 60; p.mood = clamp(p.mood + 8, 0, 100); ui.toast('<b>POOL</b> · You lose. The bartender says you have “promising geometry.”', ''); }
    else if (arg === 'underground') { ui.showEvent('THE UNDERGROUND','Theo lowers his voice. “There’s a fight every night under Terminal 9. No names. No insurance.”'); state.weirdness = clamp(state.weirdness + .02, 0, 1); }
    else if (arg === 'table') { p.money -= 18; state.time.minutes += 45; p.hunger = clamp(p.hunger + 35, 0, 100); p.mood = clamp(p.mood + 12, 0, 100); ui.toast('<b>DINNER</b> · You watch the rain. It watches back.', ''); }
    else if (arg === 'shower') { p.money -= 5; p.hygiene = 100; state.time.minutes += 20; ui.toast('<b>SHOWER</b> · You smell like a person again.', ''); }
    else if (arg === 'dance') { p.money -= 10; p.mood = clamp(p.mood + 18, 0, 100); p.energy = clamp(p.energy - 12, 0, 100); state.time.minutes += 90; ui.toast('<b>STATIC</b> · The bass gets into your teeth. You feel briefly immortal.', ''); }
    else if (arg === 'company') {
      if (p.money < 80) return noCash();
      p.money -= 80; p.mood = clamp(p.mood + 22, 0, 100); p.energy = clamp(p.energy - 10, 0, 100); state.time.minutes += 180;
      gameMode = 'modal';
      ui.modal({ kicker:'ADULT NIGHTLIFE', title:'COMPANY', body:'<p>You meet someone at the bar. You are both adults. You both agree. The rest is off-screen.</p><p class="modal-quote">This game fades to black. Always.</p>', actions:[{label:'CONTINUE', id:'ok', primary:true}], onAction:() => { ui.closeModal(); gameMode='play'; ui.toast('<b>MORNING</b> · You wake up alone. The city has already moved on.', ''); } });
      return;
    }
    else if (arg === 'sasha') { ui.showEvent('SASHA VANE','“There’s a song that only plays underground. I’ve been trying to steal it for years. Maybe you can get closer.”'); state.weirdness = clamp(state.weirdness + .02, 0, 1); }
    else if (arg === 'heal') { if (p.money < 50) return noCash(); p.money -= 50; p.health = 100; p.blood = 0; state.time.minutes += 60; ui.toast('<b>PATCHED UP</b> · The nurse does not ask how. That is the service.', ''); }
    else if (arg === 'detox') { if (p.money < 35) return noCash(); p.money -= 35; p.intoxication = 0; p.health = clamp(p.health + 10, 0, 100); state.time.minutes += 120; ui.toast('<b>DETOX</b> · The room stops breathing with you.', ''); }
    else if (arg === 'nurse') { ui.showEvent('PRIYA, RN','“People come back from that warehouse with no memory of the fight. Then they order coffee like nothing happened.”'); state.weirdness = clamp(state.weirdness + .02, 0, 1); }
    else if (arg === 'payfine') { if (p.money < 75) return noCash(); p.money -= 75; p.heat = 0; ui.toast('<b>FINE PAID</b> · The clerk stamps your file. The stamp is warm.', ''); }
    else if (arg === 'mayor') { closePanel(); setTimeout(() => talkTo(npcs.byId.get('celeste')), 200); return; }
    else if (arg === 'records') { ui.showEvent('PUBLIC RECORD','Terminal 9 has no construction permit. It has a demolition permit dated six years in the future.'); state.weirdness = clamp(state.weirdness + .03, 0, 1); }
    else if (arg === 'docks') { ui.showEvent('CORMORANT MARINA','Salt, diesel, and a horizon that will not hold still. Elias Crane is already watching.'); }
    else if (arg === 'meditate') { state.time.minutes += 60; p.mood = clamp(p.mood + 12, 0, 100); p.stamina = 100; p.energy = clamp(p.energy + 5, 0, 100); ui.toast('<b>STILLNESS</b> · The rain keeps its rhythm. So do you.', ''); }
    else if (arg === 'hike') { state.time.minutes += 120; p.energy = clamp(p.energy - 22, 0, 100); p.mood = clamp(p.mood + 16, 0, 100); ui.showEvent('CEDAR HOLLOW','The waterfall sounds like applause. For a moment, you take a bow.'); }
    else if (arg === 'stones') { state.time.minutes += 20; p.mood = clamp(p.mood + 6, 0, 100); ui.showEvent('MIRROR LAKE','Your reflection skips a stone. You did not throw one.'); state.weirdness = clamp(state.weirdness + .03, 0, 1); }
    else if (arg === 'bench') { state.time.minutes += 30; p.mood = clamp(p.mood + 10, 0, 100); ui.showEvent('ELIZABETH PARK','The bench is cold. The pigeons are not real. The feeling of being watched is.'); }
    else if (arg === 'pier') { state.time.minutes += 15; p.mood = clamp(p.mood + 8, 0, 100); ui.showEvent('CORMORANT PIER','The rain falls in two directions. You stop trying to decide which is real.'); }
    else if (arg === 'lecture') { state.time.minutes += 90; p.mood = clamp(p.mood + 4, 0, 100); ui.showEvent('VIKING UNION','“Urban Systems and the Illusion of Choice.” Attendance is mandatory. Nobody remembers signing up.'); state.weirdness = clamp(state.weirdness + .03, 0, 1); }
    else if (arg === 'listen') { ui.showEvent('KAVX 88.1','The host reads the weather, then reads your name, then reads it again in a different voice.'); state.weirdness = clamp(state.weirdness + .03, 0, 1); }
    else if (arg === 'request') { ui.showEvent('KAVX 88.1','“This one goes out to Rae, who is standing exactly where they were six minutes ago.”'); state.weirdness = clamp(state.weirdness + .04, 0, 1); }
    else if (arg === 'paint') { if (p.money < 120) return noCash(); p.money -= 120; world.playerCar.traverse(o => { if (o.isMesh && o.material?.color && o.material.color.getHex() === 0x6f4b3a) o.material.color.set(0x2f4a45); }); ui.toast('<b>PAINTED</b> · The Rustbucket is now a slightly different bad idea.', ''); }
    else if (arg === 'motelsleep') { if (p.money < 45) return noCash(); p.money -= 45; closePanel(); sleepSequence(8, 'RAINIER MOTOR LODGE', 'The mattress has a body-shaped memory. You do not ask whose.'); return; }
    else if (arg === 'deliver') { if (!state.inventory.some(i=>i.id==='book')) { ui.toast('<b>NO BOOK</b> · Nadia is looking for a specific copy. Try Lucky Nickel.', 'warn'); return; } removeItem('book',1); state.flags.bookDelivered=true; p.money += 40; state.relationships.nadia.affinity = clamp(state.relationships.nadia.affinity + 18, 0, 100); state.relationships.nadia.romance = clamp(state.relationships.nadia.romance + 6, 0, 100); ui.toast('<b>DELIVERED</b> · Nadia reads the inscription twice. “This was my mother’s copy.”', ''); }
    state.weirdness = clamp(state.weirdness, 0, 1);
    world.setWeirdness(state.weirdness);
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'tattoo') {
    if (p.money < 80) return noCash();
    p.money -= 80; p.tattoo = arg; audio.cash(); ui.toast(`<b>INK</b> · ${arg}. It will look better wet.`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'outfit') {
    if (p.money < 45) return noCash();
    p.money -= 45; p.outfit = arg; audio.cash(); ui.toast(`<b>STYLE</b> · ${arg}.`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'hair') {
    if (p.money < 30) return noCash();
    p.money -= 30; p.hair = arg; audio.cash(); ui.toast(`<b>HAIR</b> · ${arg}. The rain approves.`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'train') {
    startTimingGame({ kicker:'NORTH SOUND STRENGTH', title:'HEAVY BAG', rounds:2, prompt:'TIME THE COMBO', onComplete:(hits) => {
      p.money = Math.max(0, p.money - 15); p.energy = clamp(p.energy - 18, 0, 100); state.time.minutes += 90;
      state.stats.training.gym++; p.strength = (p.strength || 1) + .25; p.xp += 25;
      checkLevel();
      closePanel();
      ui.toast(`<b>TRAINING</b> · ${hits}/2 clean combos. Strength +.25.`, '');
      if (state.stats.training.gym === 3) ui.toast('<b>MILESTONE</b> · Iron & Rain complete. +1 skill point.', '');
      if (state.stats.training.gym === 3) p.skillPoints = (p.skillPoints || 0) + 1;
      saveGame(true);
    }});
    return;
  }
  if (act === 'learn') {
    const cost = arg === 'muay' ? 150 : arg === 'flow' ? 120 : 110;
    if (p.money < cost) return noCash();
    if (p.styles.includes(arg)) { ui.toast('<b>ALREADY KNOWN</b> · Your body remembers.', 'warn'); return; }
    p.money -= cost; p.styles.push(arg); p.style = arg; audio.cash();
    ui.toast(`<b>STYLE UNLOCKED</b> · ${STYLES[arg].name} · ${STYLES[arg].desc}`, '');
    openBusiness(b.id); saveGame(true); return;
  }
  if (act === 'travel') {
    const dest = { downtown:[-18,58], fairhaven:[-164,150], campus:[-204,-134], waterfront:[-70,190], falls:[230,-106], lake:[300,66], industrial:[140,-96] }[arg];
    if (!dest) return;
    if (p.money < 2) return noCash();
    p.money -= 2; state.time.minutes += 15;
    closePanel();
    (async () => {
      gameMode = 'ending';
      await ui.fade(true, 350);
      player.teleport(dest[0], dest[1], 0);
      await ui.fade(false, 450);
      gameMode = 'play';
      const d = world.districtAt(player.x, player.z);
      ui.showArea(d.name, d.sub);
      saveGame(true);
    })();
    return;
  }
  if (act === 'challenge') {
    const npc = npcs.byId.get(arg);
    closePanel();
    if (!npc) return;
    if (arg === 'raincoat') {
      if (world.weather !== 'storm') { ui.toast('<b>NO STORM</b> · The coat is not here.', 'warn'); return; }
      if (state.quest.stage < 4) { ui.toast('<b>NOT YET</b> · The storm has not noticed you.', 'warn'); return; }
    }
    if (arg === 'mirror' && state.quest.stage < 5) { ui.toast('<b>NOT YET</b> · The lake is still just a lake.', 'warn'); return; }
    const boss = bossFor(npc);
    if (boss) showBossIntro(boss, npc); else startFight(npc);
    return;
  }
}

function noCash() { ui.toast('<b>NO CASH</b> · The city does not extend credit to strangers.', 'warn'); }

function closePanel() {
  ui.closePanel();
  gameMode = 'play';
  saveGame(true);
}

function finishShift(hits) {
  const p = state.player;
  const pay = 55 + hits * 22;
  p.money += pay; p.energy = clamp(p.energy - 28, 0, 100); p.hunger = clamp(p.hunger - 8, 0, 100);
  state.time.minutes += 240; state.stats.shifts++; p.xp += 35; checkLevel();
  closePanel();
  saveGame(true);
  ui.toast(`<b>SHIFT COMPLETE</b> · ${fmt(pay)}. The espresso machine sighs.`, '');
  if (!state.flags.workedShift) {
    state.flags.workedShift = true;
    state.weirdness = clamp(state.weirdness + .08, 0, 1); world.setWeirdness(state.weirdness);
    setQuestStage(1);
    setTimeout(async () => {
      await ui.cinematic('MONDAY · 12:04 PM', 'ROUND ONE', 'Mara is already looking at you.');
      ui.showEvent('ROUND ONE', 'Mara says it like a weather report. The sign flips to CLOSED by itself.');
      ui.toast('<b>NEW OBJECTIVE</b> · Follow the unmarked bus at the Transit Center.', 'warn');
    }, 700);
  }
}

function checkLevel() {
  const p = state.player;
  const next = 100 + (p.level - 1) * 75;
  while (p.xp >= next * p.level / 1.5) {
    p.level++;
    p.skillPoints = (p.skillPoints || 0) + 1;
    p.health = clamp(p.health + 10, 0, 100);
    ui.toast(`<b>LEVEL ${p.level}</b> · +1 skill point. The city notices.`, '');
  }
}

// --------------------------
// home / sleep
// --------------------------
function openHome() {
  gameMode = 'panel';
  const p = state.player;
  const owned = p.homeOwned;
  const html = `<div class="panel-hero"><div class="panel-hero-main"><span class="eyebrow">HARBORVIEW LOFTS · UNIT 4B</span><h3>Your Apartment</h3><p>One bedroom. Radiator noise. A window that looks at another window. It is yours, or close enough.</p></div>
    <div><div class="panel-stat"><span>TENURE</span><b>${owned ? 'OWNED' : 'RENTED'}</b></div><div class="panel-stat"><span>RENT</span><b>${owned ? '—' : fmt(p.rent)}</b></div><div class="panel-stat"><span>DUE IN</span><b>${owned ? '—' : p.rentDue + ' DAYS'}</b></div><div class="panel-stat"><span>WALLET</span><b>${fmt(p.money)}</b></div></div></div>
    <div class="panel-section-title">AT HOME</div><div class="panel-grid">
      ${card('Sleep Until Morning','Restores energy. Advances time. Saves your life.','FREE','activity','homesleep','REST')}
      ${card('Cook Something','Pasta, garlic, whatever is in the cupboard. Restores hunger.','FREE','activity','cook','FOOD')}
      ${card('Shower','Restores hygiene. The water pressure is a rumor.','FREE','activity','homeshower','CARE')}
      ${card('Wardrobe','Change outfit, hair, and tattoos.','FREE','activity','wardrobe','STYLE')}
      ${card('Pay Rent','$650. Keeps the door yours.','$650','activity','payrent','HOUSING')}
      ${owned ? '' : card('Buy the Apartment','$12,000. Stop renting your own life.','$12,000','activity','buyhome','HOUSING')}
      ${card('Save Game','Write this version of Bellingham to memory.','FREE','activity','savehome','SYSTEM')}
    </div><p class="panel-note">${state.weirdness > .55 ? 'The radiator is whispering in a language you almost understand.' : 'The radiator knocks twice. You have stopped asking who is there.'}</p>`;
  ui.openPanel({ kicker:'HOME', title:'Harborview Lofts', html, onMount:body => {
    body.querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', () => homeAction(el.dataset.arg || el.dataset.act)));
  }});
}

function homeAction(act) {
  const p = state.player;
  audio.ui();
  if (act === 'leave') { closePanel(); return; }
  if (act === 'homesleep') { closePanel(); sleepSequence(8, 'HARBORVIEW LOFTS', 'The radiator knocks. You dream of a city with no rain, and wake up disappointed.'); return; }
  if (act === 'cook') { state.time.minutes += 40; p.hunger = clamp(p.hunger + 48, 0, 100); p.mood = clamp(p.mood + 5, 0, 100); p.hygiene = clamp(p.hygiene - 4, 0, 100); ui.toast('<b>COOKED</b> · Pasta. Garlic. A little too much hope.', ''); openHome(); saveGame(true); return; }
  if (act === 'homeshower') { state.time.minutes += 20; p.hygiene = 100; p.mood = clamp(p.mood + 4, 0, 100); ui.toast('<b>SHOWER</b> · The water pressure is still a rumor.', ''); openHome(); saveGame(true); return; }
  if (act === 'wardrobe') { closePanel(); openPhone('style'); return; }
  if (act === 'payrent') { if (p.money < 650) return noCash(); p.money -= 650; p.rentDue = 7; ui.toast('<b>RENT PAID</b> · The landlord says “thank you” like it is a threat.', ''); openHome(); saveGame(true); return; }
  if (act === 'buyhome') { if (p.money < 12000) return noCash(); p.money -= 12000; p.homeOwned = true; p.rentDue = 0; ui.toast('<b>DEED TRANSFERRED</b> · You own a small piece of a very strange city.', ''); openHome(); saveGame(true); return; }
  if (act === 'savehome') { saveGame(false); openHome(); return; }
}

async function sleepSequence(hours, place, text) {
  gameMode = 'ending';
  await ui.fade(true, 700);
  const p = state.player;
  state.time.minutes += hours * 60;
  p.energy = 100; p.health = clamp(p.health + 20, 0, 100); p.hunger = clamp(p.hunger - 18, 0, 100);
  p.hygiene = clamp(p.hygiene - 8, 0, 100); p.mood = clamp(p.mood + 8, 0, 100);
  while (state.time.minutes >= 1440) { state.time.minutes -= 1440; state.time.day++; state.stats.days++; }
  await new Promise(r => setTimeout(r, 600));
  ui.subtitle(text, 3500);
  await ui.fade(false, 800);
  gameMode = 'play';
  ui.toast(`<b>MORNING</b> · ${place}. Day ${state.time.day + 1}.`, '');
  saveGame(true);
}

// --------------------------
// timing minigame
// --------------------------
function startTimingGame(opts) {
  if (timingGame) return;
  gameMode = 'timing';
  player.moveInput(0, 0);
  timingGame = {
    rounds: Math.max(1, opts.rounds || 3), hits: 0, round: 0,
    pos: 0, dir: 1, speed: .82 + Math.random() * .18, target: .5,
    onComplete: opts.onComplete, done: false, details: []
  };
  const html = `<div class="timing-wrap">
    <p class="timing-prompt">${esc(opts.prompt || 'HIT THE MARK')}</p>
    <div class="timing-track" id="timing-track">
      <div class="timing-zone" id="timing-zone"></div>
      <div class="timing-marker" id="timing-marker"></div>
      <div class="timing-ticks"></div>
    </div>
    <div class="timing-meta"><span id="timing-round">ROUND 1 / ${timingGame.rounds}</span><span id="timing-status">READY</span></div>
    <button class="panel-action" id="timing-hit">HIT · SPACE</button>
    <p class="panel-note">Click the track or press SPACE when the marker enters the bright zone. Perfect timing pays more.</p>
  </div>`;
  ui.openPanel({
    kicker: opts.kicker || 'JOB', title: opts.title || 'SHIFT',
    html,
    onMount: (body) => {
      const track = body.querySelector('#timing-track');
      track?.addEventListener('pointerdown', (e) => { e.preventDefault(); timingHit(); });
      body.querySelector('#timing-hit')?.addEventListener('click', timingHit);
    }
  });
  setTimingTarget();
  requestAnimationFrame(() => {
    const m = $('timing-marker');
    if (m) m.style.left = '0%';
  });
}

function setTimingTarget() {
  if (!timingGame) return;
  const t = .18 + Math.random() * .64;
  timingGame.target = t;
  const zone = $('timing-zone');
  if (zone) { zone.style.left = (t * 100 - 7) + '%'; zone.style.width = '14%'; }
  const r = $('timing-round');
  if (r) r.textContent = `ROUND ${Math.min(timingGame.round + 1, timingGame.rounds)} / ${timingGame.rounds}`;
  const s = $('timing-status');
  if (s) { s.textContent = 'READY'; s.className = ''; }
}

function updateTiming(dt) {
  if (!timingGame || timingGame.done) return;
  const g = timingGame;
  g.pos += g.dir * g.speed * dt;
  if (g.pos >= 1) { g.pos = 1; g.dir = -1; }
  if (g.pos <= 0) { g.pos = 0; g.dir = 1; }
  const m = $('timing-marker');
  if (m) m.style.left = (g.pos * 100) + '%';
}

function timingHit() {
  if (!timingGame || timingGame.done) return;
  const g = timingGame;
  const d = Math.abs(g.pos - g.target);
  let label = 'MISS', cls = 'bad';
  if (d < .045) { g.hits += 1; label = 'PERFECT'; cls = 'perfect'; }
  else if (d < .11) { g.hits += 1; label = 'GOOD'; cls = 'good'; }
  else if (d < .19) { label = 'GRAZED'; cls = 'ok'; }
  g.details.push(label);
  g.round++;
  audio.ui();
  if (label === 'PERFECT') audio.cash();
  const s = $('timing-status');
  if (s) { s.textContent = label; s.className = cls; }
  if (g.round >= g.rounds) {
    g.done = true;
    const cb = g.onComplete;
    const hits = g.hits;
    const details = g.details.slice();
    setTimeout(() => {
      timingGame = null;
      ui.closePanel();
      gameMode = 'play';
      cb?.(hits, details);
    }, 520);
  } else {
    setTimingTarget();
    g.speed = Math.min(1.55, g.speed + .1);
  }
}

// --------------------------
// transit
// --------------------------
function openTransit() {
  gameMode = 'panel';
  player.moveInput(0, 0);
  const p = state.player;
  const stage = state.quest.stage;
  const dests = [
    ['downtown', 'DOWNTOWN LOOP', 'Railroad Ave / The Steam Kettle'],
    ['fairhaven', 'FAIRHAVEN', 'Old Town / Raven & Salt'],
    ['campus', 'SEHOME / CAMPUS', 'Viking Union / Empty Cup'],
    ['waterfront', 'WATERFRONT', 'Boulevard Park / Marina'],
    ['falls', 'WHATCOM FALLS', 'Cedar Hollow trailhead'],
    ['lake', 'LAKE WHATCOM', 'Mirror Lake dock'],
    ['industrial', 'INDUSTRIAL', 'Rook’s Salvage / Terminal 9']
  ];
  let html = `<div class="panel-hero"><div class="panel-hero-main"><span class="eyebrow">WTA · WHATCOM TRANSPORTATION AUTHORITY</span><h3>Transit Center</h3><p>Buses arrive. Buses leave. One bus does neither. The departure board is older than the building and twice as stubborn.</p></div>
    <div><div class="panel-stat"><span>FARE</span><b>$2</b></div><div class="panel-stat"><span>WALLET</span><b>${fmt(p.money)}</b></div><div class="panel-stat"><span>TIME</span><b>${String(Math.floor(state.time.minutes/60)).padStart(2,'0')}:${String(Math.floor(state.time.minutes%60)).padStart(2,'0')}</b></div><div class="panel-stat"><span>WEATHER</span><b>${esc(WEATHER[state.weather]?.label || 'RAIN')}</b></div></div></div>
    <div class="panel-section-title">SCHEDULED ROUTES</div><div class="panel-grid">
    ${dests.map(([id,name,sub]) => card(name, sub, '$2', 'travel', id, 'BUS')).join('')}
    </div>`;
  if (stage >= 1) {
    html += `<div class="panel-section-title">UNSCHEDULED</div><div class="panel-grid">
      ${card('ROUTE 0', 'No number. No destination. The driver does not ask your name. It idles at the far bay, engine already warm.', 'FREE', 'hiddenbus', '0', '???')}
    </div>`;
  }
  html += `<p class="panel-note">${stage >= 1 ? 'The board flickers. For one second every route reads TERMINAL 9.' : 'A woman in a yellow raincoat is not standing at the far bay. You are almost sure of it.'}</p>
  <div style="display:flex;justify-content:flex-end;margin-top:22px"><button class="panel-action ghost" data-transit="leave">LEAVE</button></div>`;
  ui.openPanel({ kicker:'TRANSIT', title:'WTA Transit Center', html, onMount: body => {
    body.querySelectorAll('[data-act]').forEach(el => el.addEventListener('click', () => {
      const act = el.dataset.act;
      if (act === 'travel') travelTo(el.dataset.arg);
      else if (act === 'hiddenbus') hiddenBus();
    }));
    body.querySelectorAll('[data-transit]').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.transit === 'leave') closePanel();
    }));
  }});
}

function travelTo(id) {
  const dest = { downtown:[-18,58], fairhaven:[-164,150], campus:[-204,-134], waterfront:[-70,190], falls:[230,-106], lake:[300,66], industrial:[140,-96] }[id];
  if (!dest) return;
  const p = state.player;
  if (p.money < 2) { noCash(); return; }
  p.money -= 2; state.time.minutes += 15;
  ui.closePanel();
  (async () => {
    gameMode = 'ending';
    await ui.fade(true, 380);
    player.teleport(dest[0], dest[1], 0);
    await ui.fade(false, 460);
    gameMode = 'play';
    const d = world.districtAt(player.x, player.z);
    ui.showArea(d.name, d.sub);
    saveGame(true);
  })();
}

function hiddenBus() {
  if (state.quest.stage < 1) { ui.toast('<b>ROUTE 0</b> · The driver shakes her head. “Not yet.”', 'warn'); return; }
  ui.closePanel();
  (async () => {
    gameMode = 'ending';
    player.moveInput(0, 0);
    await ui.fade(true, 900);
    player.teleport(world.arena.x, world.arena.z + 25, 0);
    state.flags.busRide = true;
    state.weirdness = clamp(state.weirdness + .1, 0, 1);
    world.setWeirdness(state.weirdness);
    if (state.quest.stage === 1) state.quest.stage = 2;
    await new Promise(r => setTimeout(r, 450));
    await ui.fade(false, 900);
    await ui.cinematic('ROUTE 0', 'TERMINAL 9', 'The bus does not take the road you know. It takes the road that was always there.');
    gameMode = 'play';
    refreshQuest();
    ui.showArea('TERMINAL 9', 'NOT ON THE PORT AUTHORITY MAP');
    ui.toast('<b>THE UNDERCURRENT</b> · The crowd is already loud. They have been waiting for you.', 'warn');
    saveGame(true);
  })();
}

// --------------------------
// arena / bosses
// --------------------------
function canChallengeBoss(id) {
  const f = state.flags;
  if (f.bossesDefeated.includes(id)) return false;
  const stage = state.quest.stage;
  switch (id) {
    case 'barista': return stage >= 2;
    case 'ferryman': case 'hiker': case 'mechanic': case 'student': case 'oldman': return stage >= 3;
    case 'raincoat': return stage >= 4 && world.weather === 'storm';
    case 'mayor': return stage >= 4;
    case 'mirror': return stage >= 5;
    case 'future': return stage >= 6 && f.mirrorDefeated;
    default: return false;
  }
}

function bossRequirement(id) {
  const stage = state.quest.stage;
  switch (id) {
    case 'barista': return 'Ride the unmarked bus first.';
    case 'ferryman': case 'hiker': case 'mechanic': case 'student': case 'oldman': return 'Defeat the Barista first.';
    case 'raincoat': return world.weather === 'storm' ? 'Face the storm at Boulevard Park.' : 'Wait for an electric storm.';
    case 'mayor': return 'The undercurrent must notice you first.';
    case 'mirror': return 'The raincoat must fall first.';
    case 'future': return 'Face your reflection at Mirror Lake first.';
    default: return 'Not yet.';
  }
}

function openArena() {
  if (state.quest.stage < 2) {
    gameMode = 'modal';
    ui.modal({
      kicker:'TERMINAL 9', title:'A WAREHOUSE WITH NO PERMIT',
      body:`<p>The door is chained. A sign says <b>NO TRESPASSING · PORT AUTHORITY</b>. The chain has been cut and re-welded so many times it looks like a scar.</p><p class="modal-quote">Somewhere inside, a crowd is counting down from ten. They never reach one.</p>`,
      actions:[{label:'WALK AWAY', id:'ok', primary:true}],
      onAction:() => { ui.closeModal(); gameMode = 'play'; }
    });
    return;
  }
  gameMode = 'panel';
  player.moveInput(0, 0);
  const f = state.flags;
  const defeated = f.bossesDefeated;
  const stage = state.quest.stage;
  let html = `<div class="panel-hero"><div class="panel-hero-main"><span class="eyebrow">THE UNDERCURRENT · TERMINAL 9</span><h3>Choose Your Round</h3><p>The crowd is a single animal. The ring is chalk and old blood. Somewhere above, a screen lists names that have not been spoken yet.</p></div>
    <div><div class="panel-stat"><span>DEFEATED</span><b class="good">${defeated.length} / ${BOSSES.length}</b></div><div class="panel-stat"><span>REPUTATION</span><b>${esc(ui.rank(state.player.reputation))}</b></div><div class="panel-stat"><span>ARTIFACTS</span><b>${f.artifacts.length} / 3</b></div><div class="panel-stat"><span>STYLE</span><b>${esc(STYLES[state.player.style]?.name || 'STREET')}</b></div></div></div>
    <div class="panel-section-title">THE ROSTER</div><div class="panel-grid">`;
  for (const b of BOSSES) {
    const done = defeated.includes(b.id);
    const ok = canChallengeBoss(b.id);
    const tag = done ? 'DEFEATED' : ok ? 'AVAILABLE' : 'LOCKED';
    const sub = done ? b.win : ok ? b.intro : bossRequirement(b.id);
    html += `<div class="panel-card ${ok ? 'clickable' : ''} ${done ? 'done' : ''}" ${ok ? `data-boss="${b.id}"` : ''}>
      <span class="tag" style="color:${b.accent};border-color:${b.accent}55">${tag} · ${esc(b.style)}</span>
      <h3 style="color:${done ? '#8d938d' : b.accent}">${esc(b.name)}</h3>
      <p>${esc(sub)}</p>
      <span class="price">${done ? '✓ CLEARED' : ok ? 'FIGHT · FREE' : 'REQUIREMENT'}</span>
    </div>`;
  }
  html += `</div>`;
  if (stage >= 6 && f.futureDefeated) {
    html += `<div class="panel-section-title">THE LAST BELL</div><div class="panel-grid">
      ${card('Decide What Bellingham Becomes','The crowd has stopped moving. The screen is waiting for a choice.','FREE','ending','','ENDGAME')}
    </div>`;
  }
  html += `<p class="panel-note">All fighters are adults. All fights are consensual. No refunds.</p>
  <div style="display:flex;justify-content:flex-end;margin-top:22px"><button class="panel-action ghost" data-arena="leave">LEAVE</button></div>`;
  ui.openPanel({ kicker:'TERMINAL 9', title:'The Undercurrent', html, onMount: body => {
    body.querySelectorAll('[data-boss]').forEach(el => el.addEventListener('click', () => startArenaBoss(el.dataset.boss)));
    body.querySelectorAll('[data-arena]').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.arena === 'leave') closePanel(); else if (el.dataset.arena === 'ending') openEndingChoices();
    }));
    body.querySelectorAll('[data-act="ending"]').forEach(el => el.addEventListener('click', openEndingChoices));
  }});
}

function startArenaBoss(id) {
  const boss = BOSSES.find(b => b.id === id);
  if (!boss) return;
  if (combat.active) { ui.toast('<b>IN THE RING</b> · Finish this fight first.', 'warn'); return; }
  if (!canChallengeBoss(id)) {
    ui.toast(`<b>LOCKED</b> · ${bossRequirement(id)}`, 'warn');
    return;
  }
  const def = NPCS.find(n => n.boss === id || n.id === id);
  const npc = def ? npcs.byId.get(def.id) : null;
  if (!npc) { ui.toast('<b>NO CHALLENGER</b> · The ring is empty.', 'warn'); return; }
  ui.closePanel();
  (async () => {
    gameMode = 'ending';
    await ui.fade(true, 520);
    player.teleport(world.arena.x, world.arena.z + 9, 0);
    npc.group.position.set(world.arena.x, 0, world.arena.z - 6);
    npc.x = world.arena.x; npc.z = world.arena.z - 6;
    npc.group.visible = true;
    npc.frozen = false;
    npcs.setFrozen(npc, false);
    await new Promise(r => setTimeout(r, 250));
    await ui.fade(false, 520);
    gameMode = 'play';
    showBossIntro(boss, npc, { arena:true });
  })();
}

function showBossIntro(boss, npc, opts = {}) {
  gameMode = 'ending';
  player.moveInput(0, 0);
  (async () => {
    await ui.cinematic(boss.title, boss.name, boss.intro, 3400);
    startFight(npc, boss, opts);
  })();
}

function startFight(npc, boss = null, opts = {}) {
  if (!npc || combat.active) { if (!combat.active) gameMode = 'play'; return; }
  if (state.player.health <= 0) state.player.health = 45;
  gameMode = 'combat';
  player.moveInput(0, 0);
  player.crouching = false;
  ui.hidePrompt();
  ui.setCombatCrosshair(true);
  const ok = combat.start(npc, {
    boss,
    arena: !!opts.arena,
    onEnd: (result, enemy, b) => handleFightEnd(result, enemy, b)
  });
  if (!ok) { gameMode = 'play'; ui.toast('<b>NOT NOW</b> · The moment closes.', 'warn'); }
}

function handleFightEnd(result, enemy, boss) {
  gameMode = 'play';
  const p = state.player;
  if (result === 'win') {
    state.stats.wins++;
    state.stats.fights++;
    p.health = clamp(combat.playerHP || 40, 1, 100);
    p.mood = clamp(p.mood + 10, 0, 100);
    if (boss) {
      onBossDefeated(boss, enemy);
    } else {
      p.reputation = clamp(p.reputation + 8, -100, 1000);
      p.xp += 18; p.money += 30; checkLevel();
      const r = relOf(enemy);
      r.fights++; r.wins++; r.affinity = clamp(r.affinity + 5, 0, 100); r.grudge = clamp(r.grudge + 4, 0, 100);
      ui.toast('<b>STREET WIN</b> · +$30 · +8 REP. Somebody in the crowd writes your name down.', '');
    }
  } else {
    state.stats.losses++;
    state.stats.fights++;
    p.health = 35;
    p.money = Math.max(0, p.money - Math.min(60, Math.floor(p.money * .08)));
    state.time.minutes += 180;
    const clinic = BUSINESSES.find(b => b.id === 'free_clinic');
    player.teleport(clinic.entry.x, clinic.entry.z, Math.PI);
    ui.toast('<b>KNOCKED OUT</b> · You wake up at the free clinic. Your wallet is lighter. The nurse does not ask.', 'warn');
    if (boss) {
      const r = relOf(enemy);
      r.fights++; r.losses++;
      ui.toast(`<b>${boss.name}</b> · “Come back when the city knows your name.”`, 'warn');
    }
  }
  p.stamina = 100;
  saveGame(true);
  refreshQuest();
  updateStoryVisibility();
}

function onBossDefeated(boss, npc) {
  const f = state.flags;
  const p = state.player;
  if (!f.bossesDefeated.includes(boss.id)) f.bossesDefeated.push(boss.id);
  p.reputation = clamp(p.reputation + 28 + Math.round(boss.hp * .08), -100, 1000);
  p.xp += 55 + Math.round(boss.hp * .15);
  p.money += 120 + boss.hp;
  p.skillPoints = (p.skillPoints || 0) + 1;
  checkLevel();
  if (npc) {
    const r = relOf(npc);
    r.fights++; r.wins++; r.affinity = clamp(r.affinity + 12, 0, 100); r.trust = clamp(r.trust + 6, 0, 100);
    r.status = statusFor(r);
    addMemory(npc, 'lost to you in the ring');
    r.grudge = clamp(r.grudge + 3, 0, 100);
  }
  ui.showEvent('KNOCKOUT · ' + boss.name, boss.win);
  ui.toast(`<b>ROUND CLEARED</b> · ${boss.name} · +1 skill point · +$${120 + boss.hp}`, '');

  if (boss.id === 'barista') {
    state.weirdness = clamp(state.weirdness + .14, 0, 1);
    if (state.quest.stage === 2) setQuestStage(3);
    revealTruth('barista');
  }
  if (boss.id === 'raincoat') {
    f.raincoatFound = true;
    if (!f.artifacts.includes('raincoat_button')) f.artifacts.push('raincoat_button');
    addItem('raincoat_button', 1);
    state.weirdness = clamp(state.weirdness + .16, 0, 1);
    if (state.quest.stage === 4) setQuestStage(5);
    revealTruth('raincoat');
  }
  if (boss.id === 'mirror') {
    f.mirrorDefeated = true;
    if (!f.artifacts.includes('mirror_shard')) f.artifacts.push('mirror_shard');
    addItem('mirror_shard', 1);
    state.weirdness = clamp(state.weirdness + .14, 0, 1);
    if (state.quest.stage === 5) setQuestStage(6);
    setTimeout(() => ui.cinematic('THE GRID', 'A CITY FROM ABOVE', 'For one second you see it: blocks of test rooms, a loading screen disguised as weather, a cursor where the sun should be.'), 1200);
  }
  if (boss.id === 'mayor') {
    state.weirdness = clamp(state.weirdness + .08, 0, 1);
    if (!f.artifacts.includes('cassette')) f.artifacts.push('cassette');
    addItem('cassette', 1);
  }
  if (boss.id === 'future') {
    f.futureDefeated = true;
    if (!f.artifacts.includes('cassette')) f.artifacts.push('cassette');
    addItem('cassette', 1);
    state.weirdness = 1;
    setQuestStage(7);
    setTimeout(() => {
      ui.cinematic('FINAL ROUND', 'THE HAND ON THE CONTROLS', 'They fall. The crowd does not move. Somewhere beneath the ring, a server fan spins up. The screen asks you a question.');
      setTimeout(openEndingChoices, 3200);
    }, 900);
  }

  const challengers = ['ferryman','hiker','mechanic','student','oldman'].filter(id => f.bossesDefeated.includes(id));
  if (state.quest.stage === 3 && challengers.length >= 3) {
    setQuestStage(4);
    setWeather('storm');
    state.stats.storms++;
    setTimeout(() => {
      ui.cinematic('CHAPTER 05', 'THE RAIN THAT REMEMBERS', 'The forecast breaks. Every screen in Bellingham shows a yellow raincoat standing at Boulevard Park.');
      ui.showEvent('BAROMETRIC FAILURE', 'The storm is not weather. It is an invitation.');
      ui.toast('<b>NEW OBJECTIVE</b> · Find the yellow raincoat at Boulevard Park during the storm.', 'warn');
    }, 1200);
  }

  f.allBosses = BOSSES.every(b => f.bossesDefeated.includes(b.id));
  if (f.allBosses) ui.toast('<b>ALL TEN NAMES</b> · The city has run out of challengers. The screen has not.', 'warn');
  state.weirdness = clamp(state.weirdness, 0, 1);
  world.setWeirdness(state.weirdness);
  npcs.setWeirdness(state.weirdness);
  refreshQuest();
  updateStoryVisibility();
  saveGame(true);
}

// --------------------------
// story reveal / alternate reality
// --------------------------
function updateStoryVisibility() {
  if (!world || !state) return;
  const stage = state.quest.stage || 0;
  const floor = [.1, .15, .22, .34, .46, .6, .76, .92][Math.min(stage, 7)] ?? .1;
  if ((state.weirdness || 0) < floor) state.weirdness = floor;
  state.weirdness = clamp(state.weirdness, 0, 1);
  world.setWeirdness(state.weirdness);
  npcs.setWeirdness(state.weirdness);
  const rc = npcs.byId.get('raincoat');
  if (rc) rc.group.visible = stage >= 4 && !state.flags.raincoatFound && world.weather === 'storm';
  if (state.flags.truthRevealed && !world.interactables.some(i => i.id === 'thin_door')) {
    world.interactables.push({
      id:'thin_door', label:'The Thin Door', sub:'A PHONE BOOTH THAT IS NOT ONE',
      x:-66, z:70, radius:4.6, action:'alternate', type:'place'
    });
  }
}

function revealTruth(source = '') {
  const f = state.flags;
  if (f.truthRevealed) return;
  f.truthRevealed = true;
  state.weirdness = clamp(Math.max(state.weirdness, .56), 0, 1);
  world.setWeirdness(state.weirdness);
  npcs.setWeirdness(state.weirdness);
  updateStoryVisibility();
  const lines = {
    barista: 'Mara wipes the counter. The counter wipes back. For half a second every window on Railroad Avenue shows the same room: a chair, a keyboard, and someone watching you fight.',
    raincoat: 'The coat collapses into water. The water writes a word on the dock. The word is your name, spelled the way a machine would spell it.',
    default: 'The city stutters. A building forgets which side of the street it belongs on. A pedestrian repeats the same sentence, then apologizes in a voice that is not theirs.'
  };
  setTimeout(() => {
    ui.cinematic('SIGNAL FOUND', 'BELLINGHAM IS A TEST', lines[source] || lines.default);
    ui.showEvent('THE SIMULATION', 'The city is an experiment designed to find the strongest human fighter. You are a variable.');
    ui.toast('<b>TRUTH REVEALED</b> · The phone booth on Railroad Ave is thinner than it looks.', 'warn');
    ui.toast('<b>NEW</b> · Alternate Bellingham is reachable through the thin door.', 'warn');
  }, 900);
  saveGame(true);
}

function toggleAlternate() {
  if (!state.flags.truthRevealed) {
    ui.toast('<b>A PHONE BOOTH</b> · The receiver is warm. Nobody is on the line. Not yet.', '');
    return;
  }
  alternate = !alternate;
  if (alternate) {
    world.setOcean(true);
    state.weirdness = clamp(Math.max(state.weirdness, .9), 0, 1);
    world.setWeirdness(state.weirdness);
    ui.showEvent('ALTERNATE BELLINGHAM', 'The bay is downtown. The street signs are in a language made of street signs. The buildings are the same, but they are facing the wrong way.');
    ui.toast('<b>THIN DOOR</b> · You are in the version of the city that watches the other version.', 'warn');
  } else {
    world.setOcean(false);
    state.weirdness = clamp(state.weirdness - .06, .1, 1);
    world.setWeirdness(state.weirdness);
    ui.showEvent('BELLINGHAM', 'The bay goes back where it belongs. A gull screams at you in relief.');
    ui.toast('<b>THIN DOOR</b> · You step back into the version that pretends to be normal.', '');
  }
  audio.special();
  saveGame(true);
}

// --------------------------
// random events
// --------------------------
function updateEvents(dt) {
  if (gameMode !== 'play') return;
  eventTimer -= dt;
  if (eventTimer <= 0) {
    const weird = state.weirdness || .1;
    eventTimer = Math.max(18, 58 + Math.random() * 70 - weird * 42);
    triggerRandomEvent();
  }
}

function triggerRandomEvent() {
  const weird = state.weirdness || .1;
  const pool = EVENTS.concat(ENCOUNTERS).filter(e => e.weird <= weird + .22);
  const list = pool.length ? pool : EVENTS.slice(0, 4);
  let total = 0;
  for (const e of list) total += e.weight;
  let r = Math.random() * total;
  let ev = list[0];
  for (const e of list) { r -= e.weight; if (r <= 0) { ev = e; break; } }
  eventCount++;
  state.stats.events++;
  ui.showEvent(ev.title, ev.sub);
  state.weirdness = clamp(state.weirdness + ev.weird * .012, 0, 1);
  world.setWeirdness(state.weirdness);
  audio.speak();
  switch (ev.id) {
    case 'frozen': {
      const near = npcs.ambient.find(n => Math.hypot(n.x - player.x, n.z - player.z) < 40);
      if (near) { npcs.setFrozen(near, true); setTimeout(() => npcs.setFrozen(near, false), 12000); }
      break;
    }
    case 'repeat': npcs.repeatDialogue(); break;
    case 'ocean': {
      world.setOcean(true);
      setTimeout(() => { if (!alternate) world.setOcean(false); }, 16000);
      break;
    }
    case 'building': {
      const b = world.buildingGroups[Math.floor(Math.random() * world.buildingGroups.length)];
      if (b) { b.rotation.y += (Math.random() < .5 ? -1 : 1) * .012; }
      break;
    }
    case 'double': {
      if (!world.doublePlayer) {
        const g = player.arms.clone(true);
        world.doublePlayer = g;
      }
      break;
    }
    case 'bus': {
      const stop = world.interactables.find(i => i.id === 'bus_stop');
      if (stop) ui.subtitle('The bus at the stop has no number. The door is open. The driver is not looking at you.', 4200);
      break;
    }
    case 'rainup': setWeather('storm'); break;
    case 'crowd': {
      for (const n of npcs.ambient) {
        if (Math.hypot(n.x - player.x, n.z - player.z) < 22) {
          n.facing = Math.atan2(player.x - n.x, player.z - n.z);
          n.group.rotation.y = n.facing;
        }
      }
      break;
    }
    case 'table': {
      if (state.flags.quietTable) ui.subtitle('Three people in gray suits nod at you. One of them is wearing your watch.', 4200);
      break;
    }
    case 'puddle': break;
    default: break;
  }
  if (state.weirdness > .6) audio.thunder();
}

// --------------------------
// phone
// --------------------------
function openPhone(tab = 'status') {
  if (gameMode === 'combat') return;
  gameMode = 'panel';
  player.moveInput(0, 0);
  const tabs = [
    { id:'status', label:'STATUS' },
    { id:'bag', label:'BAG' },
    { id:'contacts', label:'CONTACTS' },
    { id:'quests', label:'QUESTS' },
    { id:'style', label:'STYLE' },
    { id:'skills', label:'SKILLS' },
    { id:'journal', label:'JOURNAL' }
  ];
  const titles = { status:'Status', bag:'Bag', contacts:'Contacts', quests:'Quests', style:'Style', skills:'Skills', journal:'Journal' };
  ui.openPanel({
    kicker:'B//U PHONE · NO SIGNAL', title:titles[tab] || 'Phone',
    tabs: tabs.map(t => ({ id:t.id, label:t.label, action:() => openPhone(t.id) })),
    active: tab,
    html: buildPhoneBody(tab),
    className: 'phone',
    onMount: body => bindPhone(body, tab)
  });
}

function needBar(label, val, color = 'teal') {
  const v = clamp(val || 0, 0, 100);
  return `<div class="phone-need"><span>${label}</span><i><em class="${color}" style="width:${v}%"></em></i><b>${Math.round(v)}</b></div>`;
}

function buildPhoneBody(tab) {
  const p = state.player;
  const f = state.flags;
  if (tab === 'status') {
    const rank = ui.rank(p.reputation || 0);
    const style = STYLES[p.style] || STYLES.street;
    return `<div class="phone-status">
      <div class="phone-id"><span class="phone-avatar">${esc((p.name || 'R').split(' ').map(x => x[0]).join('').slice(0,2))}</span><div><h3>${esc(p.name)}</h3><p>${esc(p.job)} · ${esc(p.outfit)} · ${esc(p.hair)}</p></div><span class="phone-rank">${esc(rank)}</span></div>
      <div class="phone-cols">
        <div><div class="panel-section-title">VITALS</div>
          ${needBar('HEALTH', p.health, 'red')}
          ${needBar('STAMINA', p.stamina)}
          ${needBar('HUNGER', p.hunger, 'amber')}
          ${needBar('ENERGY', p.energy)}
          ${needBar('HYGIENE', p.hygiene)}
          ${needBar('MOOD', p.mood, 'violet')}
        </div>
        <div><div class="panel-section-title">RECORD</div>
          <div class="panel-stat"><span>WALLET</span><b>${fmt(p.money)}</b></div>
          <div class="panel-stat"><span>LEVEL</span><b>${p.level} · ${p.xp} XP</b></div>
          <div class="panel-stat"><span>SKILL POINTS</span><b class="good">${p.skillPoints || 0}</b></div>
          <div class="panel-stat"><span>FIGHTS</span><b>${state.stats.wins}W · ${state.stats.losses}L</b></div>
          <div class="panel-stat"><span>SHIFTS</span><b>${state.stats.shifts}</b></div>
          <div class="panel-stat"><span>STYLE</span><b>${esc(style.name)}</b></div>
          <div class="panel-stat"><span>RENT DUE</span><b>${p.homeOwned ? 'OWNED' : p.rentDue + ' DAYS'}</b></div>
          <div class="panel-stat"><span>DAY</span><b>${state.time.day + 1}</b></div>
        </div>
      </div>
      <div class="panel-section-title">CURRENT OBJECTIVE</div>
      <div class="phone-objective"><b>${esc(QUESTS[state.quest.stage]?.title || 'A Normal Life')}</b><span>${esc(ui.objective?.objective || QUESTS[state.quest.stage]?.objective || '')}</span></div>
      <p class="panel-note">${f.truthRevealed ? 'The phone has no carrier. It has never had a carrier. It still gets messages.' : 'One unread message from a number with no area code. You have not opened it.'}</p>
    </div>`;
  }
  if (tab === 'bag') {
    const items = state.inventory.length ? state.inventory.map(i => {
      const it = ITEMS[i.id] || { name:i.id, desc:'', type:'misc' };
      return `<div class="panel-card"><span class="tag">${esc((it.type || 'misc').toUpperCase())} ×${i.qty}</span><h3>${esc(it.name)}</h3><p>${esc(it.desc || '')}</p><button class="mini-btn" data-use="${esc(i.id)}">${it.type === 'gift' ? 'GIFT' : 'USE'}</button></div>`;
    }).join('') : '<div class="panel-empty">Your bag is empty. The city already took its cut.</div>';
    const arts = ['token','raincoat_button','mirror_shard','cassette'].map(id => {
      const got = f.artifacts.includes(id) || state.inventory.some(i => i.id === id);
      return `<div class="panel-card ${got ? '' : 'locked'}"><span class="tag" style="${got ? '' : 'color:#5b6260;border-color:#2b3331'}">${got ? 'ARTIFACT' : 'MISSING'}</span><h3>${esc(ITEMS[id]?.name || id)}</h3><p>${esc(ITEMS[id]?.desc || '')}</p></div>`;
    }).join('');
    return `<div class="panel-section-title">CARRIED</div><div class="panel-grid">${items}</div>
      <div class="panel-section-title">IMPOSSIBLE THINGS · ${f.artifacts.length} / 3</div><div class="panel-grid">${arts}</div>
      <p class="panel-note">Artifacts are the only objects the simulation has failed to overwrite. It hates that.</p>`;
  }
  if (tab === 'contacts') {
    const rows = NPCS.map(n => {
      const r = state.relationships[n.id] || {};
      if (!r.met) return '';
      const st = statusFor(r);
      const aff = clamp(r.affinity || 0, 0, 100), rom = clamp(r.romance || 0, 0, 100), gr = clamp(r.grudge || 0, 0, 100);
      return `<div class="phone-contact"><div class="phone-avatar small" style="--pc:${n.palette.accent}">${esc(n.name.split(' ').map(x => x[0]).join('').slice(0,2))}</div>
        <div class="phone-contact-main"><b>${esc(n.name)}</b><span>${esc(n.tag || n.role)} · ${esc(st)}</span>
          <div class="phone-bars"><i><em style="width:${aff}%"></em></i><i class="rom"><em style="width:${rom}%"></em></i>${gr ? `<i class="gr"><em style="width:${gr}%"></em></i>` : ''}</div>
        </div>
        <button class="mini-btn" data-text="${n.id}">TEXT</button></div>`;
    }).filter(Boolean).join('');
    return `<div class="panel-section-title">KNOWN IN BELLINGHAM</div>
      ${rows || '<div class="panel-empty">No contacts yet. Talk to someone. Anyone. The barista is a good start.</div>'}
      <p class="panel-note">Teal: affinity. Violet: romance. Red: grudge. All romance and intimacy in this story is between adults, consensual, and non-graphic.</p>`;
  }
  if (tab === 'quests') {
    const main = QUESTS[state.quest.stage] || QUESTS[0];
    const sides = SIDE_QUESTS.map(q => {
      const done = sideQuestDone(q.id);
      return `<div class="panel-row"><div><h3>${esc(q.title)} ${done ? '· DONE' : ''}</h3><p>${esc(q.desc)}</p></div><span class="phone-reward">${esc(q.reward || '')}</span></div>`;
    }).join('');
    return `<div class="panel-section-title">MAIN · ${esc(main.chapter)}</div>
      <div class="phone-objective"><b>${esc(main.title)}</b><span>${esc(ui.objective?.objective || main.objective)}</span></div>
      <div class="panel-section-title">SIDE QUESTS</div>${sides}
      <div class="panel-section-title">HIDDEN CHALLENGES</div>
      <div class="panel-row"><div><h3>The Ten Names</h3><p>Defeat every fighter in the undercurrent.</p></div><span class="phone-reward">${f.bossesDefeated.length} / ${BOSSES.length}</span></div>
      <div class="panel-row"><div><h3>Three Impossible Things</h3><p>Collect the brass token, the raincoat button, and the mirror shard.</p></div><span class="phone-reward">${f.artifacts.length} / 3</span></div>
      <div class="panel-row"><div><h3>The Quiet Table</h3><p>Take Dax's seat under Terminal 9.</p></div><span class="phone-reward">${f.quietTable ? 'SEATED' : 'UNKNOWN'}</span></div>
      <div class="panel-row"><div><h3>The Thin Door</h3><p>Step into the alternate version of Bellingham.</p></div><span class="phone-reward">${f.alternateSeen ? 'SEEN' : f.truthRevealed ? 'OPEN' : 'LOCKED'}</span></div>`;
  }
  if (tab === 'style') {
    const styles = Object.entries(STYLES).map(([id, s]) => {
      const owned = p.styles.includes(id);
      return `<div class="panel-card ${owned ? 'clickable' : 'locked'}" ${owned ? `data-style="${id}"` : ''}><span class="tag" style="color:${s.color};border-color:${s.color}55">${owned ? (p.style === id ? 'EQUIPPED' : 'KNOWN') : 'LOCKED'}</span><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p><span class="price">${esc(s.special)}</span><span class="meta">${esc(s.unlock)}</span></div>`;
    }).join('');
    const outfits = OUTFITS.map(o => `<button class="mini-btn ${p.outfit === o ? 'active' : ''}" data-outfit="${esc(o)}">${esc(o)}</button>`).join('');
    const hairs = HAIRSTYLES.map(o => `<button class="mini-btn ${p.hair === o ? 'active' : ''}" data-hair="${esc(o)}">${esc(o)}</button>`).join('');
    const inks = TATTOOS.map(o => `<button class="mini-btn ${p.tattoo === o ? 'active' : ''}" data-tattoo="${esc(o)}">${esc(o)}</button>`).join('');
    return `<div class="panel-section-title">FIGHTING STYLE</div><div class="panel-grid">${styles}</div>
      <div class="panel-section-title">WARDROBE</div><div class="style-chips">${outfits}</div>
      <div class="panel-section-title">HAIR</div><div class="style-chips">${hairs}</div>
      <div class="panel-section-title">TATTOOS</div><div class="style-chips">${inks}</div>
      <p class="panel-note">Cosmetics are free to change. Fighting styles must be learned at the gym, dojo, or salvage yard.</p>`;
  }
  if (tab === 'skills') {
    const keys = [
      ['strength', 'STRENGTH', 'More damage with every strike.'],
      ['endurance', 'ENDURANCE', 'More stamina recovery and punishment absorbed.'],
      ['charisma', 'CHARISMA', 'Better prices, warmer conversations, fewer closed doors.'],
      ['reflex', 'REFLEX', 'Wider dodge and counter windows.']
    ];
    return `<div class="phone-skill-head"><span>SKILL POINTS AVAILABLE</span><b>${p.skillPoints || 0}</b></div>
      <div class="panel-grid">${keys.map(([k, name, desc]) => `<div class="panel-card"><span class="tag">${esc(name)}</span><h3>${p[k] || 1}</h3><p>${esc(desc)}</p><button class="mini-btn" data-skill="${k}" ${ (p.skillPoints || 0) < 1 ? 'disabled' : ''}>SPEND 1 POINT</button></div>`).join('')}</div>
      <p class="panel-note">You earn skill points by leveling up, completing training milestones, and defeating names in the undercurrent.</p>`;
  }
  // journal
  const bosses = BOSSES.map(b => {
    const done = f.bossesDefeated.includes(b.id);
    return `<div class="panel-card ${done ? '' : 'locked'}"><span class="tag" style="color:${done ? b.accent : '#5b6260'};border-color:${done ? b.accent + '55' : '#2b3331'}">${done ? 'DEFEATED' : 'UNKNOWN'}</span><h3>${done ? esc(b.name) : '???'}</h3><p>${done ? esc(b.lore) : 'A name the city has not spoken to you yet.'}</p></div>`;
  }).join('');
  const endings = ENDINGS.map(e => `<div class="panel-row"><div><h3>${esc(e.title)}</h3><p>${esc(e.req)}</p></div><span class="phone-reward">${f.endings.includes(e.id) ? 'UNLOCKED' : '—'}</span></div>`).join('');
  return `<div class="panel-section-title">THE TEN NAMES · ${f.bossesDefeated.length} / 10</div><div class="panel-grid">${bosses}</div>
    <div class="panel-section-title">THE RECORD</div>
    <div class="panel-stat"><span>DAYS IN BELLINGHAM</span><b>${state.time.day + 1}</b></div>
    <div class="panel-stat"><span>FIGHTS</span><b>${state.stats.fights}</b></div>
    <div class="panel-stat"><span>RANDOM EVENTS WITNESSED</span><b>${state.stats.events}</b></div>
    <div class="panel-stat"><span>STORMS</span><b>${state.stats.storms}</b></div>
    <div class="panel-stat"><span>TRUTH</span><b class="${f.truthRevealed ? 'good' : 'bad'}">${f.truthRevealed ? 'REVEALED' : 'HIDDEN'}</b></div>
    <div class="panel-stat"><span>SIMULATION CONTROL</span><b>${Math.round((state.weirdness || .1) * 100)}%</b></div>
    <div class="panel-section-title">ENDINGS</div>${endings}
    <p class="panel-note">There are five ways this can end. The city is patient. You do not have to choose any of them yet.</p>`;
}

function sideQuestDone(id) {
  const p = state.player;
  switch (id) {
    case 'rent': return p.homeOwned || p.rentDue > 3;
    case 'first_shift': return !!state.flags.workedShift;
    case 'gym_rat': return (state.stats.training.gym || 0) >= 3;
    case 'quiet_table': return !!state.flags.quietTable;
    case 'bookmark': return !!state.flags.bookDelivered;
    case 'stormwatch': return (state.stats.storms || 0) >= 3;
    case 'knockout': return (state.stats.wins || 0) >= 5;
    case 'artifacts': return state.flags.artifacts.length >= 3;
    default: return false;
  }
}

function bindPhone(body, tab) {
  body.querySelectorAll('[data-use]').forEach(el => el.addEventListener('click', () => useItem(el.dataset.use)));
  body.querySelectorAll('[data-style]').forEach(el => el.addEventListener('click', () => setPlayerStyle(el.dataset.style)));
  body.querySelectorAll('[data-outfit]').forEach(el => el.addEventListener('click', () => { state.player.outfit = el.dataset.outfit; openPhone('style'); saveGame(true); }));
  body.querySelectorAll('[data-hair]').forEach(el => el.addEventListener('click', () => { state.player.hair = el.dataset.hair; openPhone('style'); saveGame(true); }));
  body.querySelectorAll('[data-tattoo]').forEach(el => el.addEventListener('click', () => { state.player.tattoo = el.dataset.tattoo; openPhone('style'); saveGame(true); }));
  body.querySelectorAll('[data-skill]').forEach(el => el.addEventListener('click', () => spendSkill(el.dataset.skill)));
  body.querySelectorAll('[data-text]').forEach(el => el.addEventListener('click', () => textContact(el.dataset.text)));
}

function setPlayerStyle(id) {
  if (!STYLES[id]) return;
  if (!state.player.styles.includes(id)) { ui.toast('<b>LOCKED</b> · Learn this style first.', 'warn'); return; }
  state.player.style = id;
  ui.setStyle(id);
  combat.style = STYLES[id];
  audio.ui();
  ui.toast(`<b>STYLE</b> · ${STYLES[id].name} · ${STYLES[id].special}`, '');
  openPhone('style');
  saveGame(true);
}

function spendSkill(key) {
  const p = state.player;
  if ((p.skillPoints || 0) < 1) { ui.toast('<b>NO POINTS</b> · Earn more in the ring.', 'warn'); return; }
  p.skillPoints--;
  p[key] = (p[key] || 1) + 1;
  audio.cash();
  ui.toast(`<b>SKILL UP</b> · ${key.toUpperCase()} ${p[key]}`, '');
  openPhone('skills');
  saveGame(true);
}

function textContact(id) {
  const r = state.relationships[id];
  if (!r) return;
  const day = state.time.day;
  if (r.lastText === day) { ui.toast('<b>ALREADY TEXTED</b> · They are not ignoring you. Probably.', ''); return; }
  r.lastText = day;
  r.affinity = clamp(r.affinity + 3, 0, 100);
  r.trust = clamp(r.trust + 1, 0, 100);
  const npc = NPCS.find(n => n.id === id);
  const lines = [
    'They reply with a photo of the rain on their window.',
    'They reply with three dots, then a joke that does not quite land.',
    'They reply immediately. Too immediately. You decide not to think about it.',
    'They send a voice note. You can hear the bar behind them.',
    'They reply with a single word: “later.” It sounds like a promise.'
  ];
  ui.toast(`<b>${esc(npc?.name || id)}</b> · ${lines[Math.floor(Math.random() * lines.length)]}`, '');
  openPhone('contacts');
  saveGame(true);
}

// --------------------------
// endings
// --------------------------
function openEndingChoices() {
  if (gameMode === 'combat') return;
  gameMode = 'ending';
  player.moveInput(0, 0);
  const f = state.flags;
  const allBosses = BOSSES.every(b => f.bossesDefeated.includes(b.id));
  const maxRomance = Math.max(0, ...Object.values(state.relationships).map(r => r.romance || 0));
  const opts = [
    { id:'escape', title:'ESCAPE THE SIMULATION', desc:'Board the bus that is not on the schedule. Leave Bellingham and never find out who wins.', ok:f.artifacts.includes('token') && (state.relationships.wren?.affinity || 0) >= 15, req:'Brass Bus Token · Wren friendship · less than 50% control' },
    { id:'champion', title:'BECOME CHAMPION', desc:'Take the belt, the money, and the key to the city. Let everyone see you.', ok:allBosses, req:'Defeat all ten bosses · high reputation' },
    { id:'shutdown', title:'SHUT IT DOWN', desc:'Find the server room beneath Terminal 9. Pull the brass lever. Let the city exhale.', ok:f.artifacts.length >= 3 && f.mirrorDefeated && f.truthRevealed, req:'Three artifacts · Mirror defeated · truth revealed' },
    { id:'control', title:'TAKE CONTROL', desc:'Sit in the chair. Edit one small thing. Then another. Then the rain.', ok:(f.darkRep || 0) > 0 && f.quietTable && f.futureDefeated, req:'Quiet Table alliance · dark reputation · Future Player defeated' },
    { id:'stay', title:'STAY IN BELLINGHAM', desc:'Walk home in the rain. Pretend nothing happened. It is not a happy ending. It is a life.', ok:maxRomance >= 60, req:'Any relationship above 60 · choose to forget' }
  ];
  if (!opts.some(o => o.ok)) opts[4].ok = true;
  const body = `<p>The Future Player is gone. The crowd has not moved. Above the ring, the screen is showing five versions of the same city.</p>
    <div class="ending-list">${opts.map(o => `<div class="ending-option ${o.ok ? '' : 'locked'}"><div><b>${esc(o.title)}</b><span>${esc(o.desc)}</span><em>${esc(o.req)}</em></div><span class="ending-state">${o.ok ? 'AVAILABLE' : 'LOCKED'}</span></div>`).join('')}</div>
    <p class="modal-quote">Every ending is a choice about what you owe a place that made you.</p>`;
  ui.modal({
    kicker:'ENDGAME · TERMINAL 9', title:'WHAT DOES BELLINGHAM BECOME?',
    body,
    actions: opts.map(o => ({ label:o.title, id:o.id, primary:o.ok, disabled:!o.ok })).concat([{ label:'NOT YET', id:'cancel' }]),
    onAction: (a) => {
      if (a === 'cancel') { ui.closeModal(); gameMode = 'play'; return; }
      const o = opts.find(x => x.id === a);
      if (!o?.ok) { ui.toast('<b>LOCKED</b> · ' + o.req, 'warn'); return; }
      chooseEnding(a);
    }
  });
}

function chooseEnding(id) {
  const e = ENDINGS.find(x => x.id === id);
  if (!e) return;
  ui.closeModal();
  if (!state.flags.endings.includes(id)) state.flags.endings.push(id);
  saveGame(true);
  (async () => {
    gameMode = 'ending';
    await ui.cinematic(e.kicker, e.title, e.text.slice(0, 130) + '…', 3200);
    await ui.fade(true, 900);
    gameMode = 'modal';
    ui.modal({
      kicker:e.kicker, title:e.title,
      body:`<p class="ending-copy">${esc(e.text)}</p><p class="modal-quote">${esc(e.req)}</p><p class="ending-copy">Ending recorded. The city remembers this version of you.</p>`,
      actions:[
        { label:'KEEP LIVING IN BELLINGHAM', id:'continue', primary:true },
        { label:'TITLE SCREEN', id:'title' }
      ],
      onAction: (a) => {
        ui.closeModal();
        if (a === 'title') { returnToMenu(); return; }
        gameMode = 'play';
        player.teleport(player.x, player.z, player.yaw);
        ui.toast('<b>THE CITY CONTINUES</b> · You can still walk, work, love, and fight. The ending is a door, not a wall.', '');
        saveGame(true);
        refreshQuest();
      }
    });
    await ui.fade(false, 800);
  })();
}

function returnToMenu() {
  saveGame(true);
  gameMode = 'menu';
  ui.hideHUD();
  ui.hideTouch();
  ui.closePanel();
  ui.closeModal();
  ui.showPause(false);
  ui.showSettings(false);
  ui.toggleMap(false);
  ui.showMenu(hasSave());
  try { document.exitPointerLock?.(); } catch {}
}

// --------------------------
// settings / pause / map
// --------------------------
let settingsReturn = 'play';
let everLocked = false;

function openSettings(returnTo = 'play') {
  settingsReturn = returnTo;
  if (returnTo !== 'menu') gameMode = 'settings';
  $('set-sens').value = state.settings?.sens ?? 1;
  $('set-volume').value = state.settings?.volume ?? .55;
  $('set-invert').checked = !!state.settings?.invert;
  $('set-motion').checked = !!state.settings?.motion;
  ui.showSettings(true);
  try { document.exitPointerLock?.(); } catch {}
}

function closeSettings() {
  ui.showSettings(false);
  if (settingsReturn === 'menu') { gameMode = 'menu'; return; }
  if (settingsReturn === 'pause') { gameMode = 'pause'; ui.showPause(true); return; }
  gameMode = 'play';
  requestLock();
}

function pauseGame() {
  if (gameMode !== 'play') return;
  gameMode = 'pause';
  ui.showPause(true);
  try { document.exitPointerLock?.(); } catch {}
}

function resumeGame() {
  ui.showPause(false);
  gameMode = 'play';
  requestLock();
}

function toggleMapKey() {
  if (ui.mapOpen) { ui.toggleMap(false); if (gameMode === 'map') gameMode = 'play'; return; }
  if (gameMode !== 'play') return;
  gameMode = 'map';
  ui.toggleMap(true);
  try { document.exitPointerLock?.(); } catch {}
}

function handleEscape() {
  if (ui.dialogueOpen) { closeDialogue(); return; }
  if (ui.panelOpen) { closePanel(); return; }
  if (ui.mapOpen) { ui.toggleMap(false); if (gameMode === 'map') gameMode = 'play'; return; }
  if (gameMode === 'settings') { closeSettings(); return; }
  if (gameMode === 'pause') { resumeGame(); return; }
  if (gameMode === 'play') { pauseGame(); return; }
}

// --------------------------
// bindings
// --------------------------
const MOVE_KEYS = { KeyW:'forward', KeyS:'back', KeyA:'left', KeyD:'right' };

function bindEvents() {
  $('btn-start').addEventListener('click', () => { if (!$('btn-start').disabled) requireConsent(() => startGame(false)); });
  $('btn-continue').addEventListener('click', () => requireConsent(() => startGame(true)));
  $('btn-menu-settings').addEventListener('click', () => openSettings('menu'));

  $('dialogue-close').addEventListener('click', closeDialogue);
  $('panel-close').addEventListener('click', closePanel);
  $('map-close').addEventListener('click', () => { ui.toggleMap(false); if (gameMode === 'map') gameMode = 'play'; });
  $('pause-resume').addEventListener('click', resumeGame);
  $('pause-settings').addEventListener('click', () => { ui.showPause(false); openSettings('pause'); });
  $('pause-menu').addEventListener('click', () => { saveGame(true); returnToMenu(); });
  $('set-resume').addEventListener('click', closeSettings);
  $('set-reset').addEventListener('click', () => {
    ui.modal({
      kicker:'SYSTEM', title:'ERASE THIS BELLINGHAM?',
      body:'<p>This deletes the save and starts from the first Monday. The rain will not remember you.</p>',
      actions:[{ label:'ERASE SAVE', id:'yes', primary:true }, { label:'CANCEL', id:'no' }],
      onAction: (a) => {
        if (a === 'yes') { try { localStorage.removeItem(SAVE_KEY); } catch {} location.reload(); }
        else ui.closeModal();
      }
    });
  });

  const sens = $('set-sens');
  sens?.addEventListener('input', () => {
    state.settings.sens = parseFloat(sens.value);
    if (player) player.lookSensitivity = state.settings.sens;
  });
  const vol = $('set-volume');
  vol?.addEventListener('input', () => {
    state.settings.volume = parseFloat(vol.value);
    audio.setVolume(state.settings.volume);
  });
  $('set-invert')?.addEventListener('change', (e) => {
    state.settings.invert = e.target.checked;
    if (player) player.invert = e.target.checked;
  });
  $('set-motion')?.addEventListener('change', (e) => {
    state.settings.motion = e.target.checked;
    document.body.classList.toggle('reduced-motion', e.target.checked);
  });

  $('look-hint').addEventListener('click', requestLock);
  canvas.addEventListener('click', () => {
    if (isTouch) return;
    if (gameMode === 'play' || gameMode === 'combat') {
      if (document.pointerLockElement !== canvas) requestLock();
    }
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('mousedown', (e) => {
    if (gameMode !== 'combat') return;
    if (!isTouch && document.pointerLockElement !== canvas) { requestLock(); return; }
    if (e.button === 0) combat.punch();
    else if (e.button === 2) combat.kick();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      everLocked = true;
      ui.hideLookHint();
    } else if (everLocked && !isTouch && gameMode === 'play') {
      pauseGame();
    }
  });
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== canvas) return;
    if (gameMode !== 'play' && gameMode !== 'combat') return;
    player.look(e.movementX || 0, e.movementY || 0);
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab' && gameMode !== 'menu') e.preventDefault();
    if (gameMode === 'timing') {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); timingHit(); }
      return;
    }
    if (e.code === 'Escape') { e.preventDefault(); handleEscape(); return; }
    if (gameMode === 'play') {
      if (MOVE_KEYS[e.code]) { player.input[MOVE_KEYS[e.code]] = 1; e.preventDefault(); }
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.input.sprint = true;
      else if (e.code === 'ControlLeft' || e.code === 'ControlRight') player.input.crouch = true;
      else if (e.code === 'Space') { e.preventDefault(); player.jump(); }
      else if (e.code === 'KeyE') interact();
      else if (e.code === 'KeyF' && player.driving) player.exitCar();
      else if (e.code === 'Tab') openPhone();
      else if (e.code === 'KeyM') toggleMapKey();
    } else if (gameMode === 'combat') {
      if (MOVE_KEYS[e.code]) { player.input[MOVE_KEYS[e.code]] = 1; e.preventDefault(); }
      else if (e.code === 'Space') { e.preventDefault(); combat.dodge(); }
      else if (e.code === 'KeyQ') combat.setBlock(true);
      else if (e.code === 'KeyJ') combat.punch();
      else if (e.code === 'KeyK') combat.kick();
      else if (e.code === 'KeyE') combat.grapple();
      else if (e.code === 'KeyR') combat.specialAttack();
      else if (e.code === 'KeyC') combat.finisher();
      else if (e.code === 'KeyF') combat.environment();
    } else if (gameMode === 'menu' && e.code === 'Enter') {
      requireConsent(() => startGame(false));
    }
  });

  window.addEventListener('keyup', (e) => {
    if (MOVE_KEYS[e.code] && player) player.input[MOVE_KEYS[e.code]] = 0;
    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && player) player.input.sprint = false;
    if ((e.code === 'ControlLeft' || e.code === 'ControlRight') && player) player.input.crouch = false;
    if (e.code === 'KeyQ' && combat) combat.setBlock(false);
  });

  window.addEventListener('blur', () => {
    if (!player) return;
    player.input.forward = player.input.back = player.input.left = player.input.right = 0;
    player.input.sprint = false;
    player.input.crouch = false;
    if (combat) combat.setBlock(false);
  });

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden && gameStarted) saveGame(true); });
  window.addEventListener('beforeunload', () => { if (gameStarted) saveGame(true); });
}

// --------------------------
// touch controls
// --------------------------
function setupTouch() {
  if (!isTouch) return;
  document.body.classList.add('is-touch');
  const stick = $('touch-stick');
  const knob = stick?.querySelector('i');
  let stickId = null;
  const resetStick = () => {
    stickId = null;
    if (player) player.moveInput(0, 0);
    if (knob) knob.style.transform = '';
  };
  const moveStick = (e) => {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) / (r.width / 2);
    let dy = (e.clientY - cy) / (r.height / 2);
    const m = Math.hypot(dx, dy);
    if (m > 1) { dx /= m; dy /= m; }
    if (player) player.moveInput(dx, dy);
    if (knob) knob.style.transform = `translate(${dx * 24}px,${dy * 24}px)`;
  };
  if (stick) {
    stick.addEventListener('pointerdown', (e) => {
      stickId = e.pointerId;
      try { stick.setPointerCapture(e.pointerId); } catch {}
      moveStick(e);
      e.preventDefault();
    });
    stick.addEventListener('pointermove', (e) => { if (stickId === e.pointerId) { moveStick(e); e.preventDefault(); } });
    stick.addEventListener('pointerup', resetStick);
    stick.addEventListener('pointercancel', resetStick);
    stick.addEventListener('lostpointercapture', resetStick);
  }

  const look = $('touch-look');
  let lookId = null, lastX = 0, lastY = 0;
  if (look) {
    look.addEventListener('pointerdown', (e) => {
      lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
      try { look.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    });
    look.addEventListener('pointermove', (e) => {
      if (lookId !== e.pointerId) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      if (player && (gameMode === 'play' || gameMode === 'combat')) player.look(dx * 1.7, dy * 1.7);
      e.preventDefault();
    });
    const endLook = () => { lookId = null; };
    look.addEventListener('pointerup', endLook);
    look.addEventListener('pointercancel', endLook);
  }

  document.querySelectorAll('[data-touch]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); touchAction(btn.dataset.touch, btn); });
  });
}

function touchAction(action, btn) {
  switch (action) {
    case 'interact': if (gameMode === 'play') interact(); break;
    case 'jump': if (gameMode === 'play' && player) player.jump(); break;
    case 'phone': if (gameMode === 'play') openPhone(); break;
    case 'sprint':
      touchSprint = !touchSprint;
      if (player) player.input.sprint = touchSprint;
      btn?.classList.toggle('on', touchSprint);
      break;
    case 'punch': if (gameMode === 'combat') combat.punch(); break;
    case 'kick': if (gameMode === 'combat') combat.kick(); break;
    case 'block':
      if (gameMode === 'combat') {
        combat.setBlock(!combat.blocking);
        btn?.classList.toggle('on', combat.blocking);
      }
      break;
    case 'dodge': if (gameMode === 'combat') combat.dodge(); break;
    case 'special': if (gameMode === 'combat') combat.specialAttack(); break;
    default: break;
  }
}

// --------------------------
// debug / test hooks
// --------------------------
window.__BELLINGHAM = {
  get state() { return state; },
  get player() { return player; },
  get world() { return world; },
  get npcs() { return npcs; },
  get ui() { return ui; },
  get combat() { return combat; },
  get mode() { return gameMode; },
  startGame, saveGame, refreshQuest, setQuestStage, updateStoryVisibility,
  teleport: (x, z, yaw = 0) => { player.teleport(x, z, yaw); saveGame(true); },
  openPhone, openArena, openTransit, startArenaBoss, showBossIntro,
  triggerRandomEvent, revealTruth, toggleAlternate, openEndingChoices,
  chooseEnding, startTimingGame, timingHit,
  addItem, useItem, talkTo, openBusiness, openHome, closePanel,
  closeModal: () => ui?.closeModal(),
  setMode: (m) => { gameMode = m; },
  setWeather: (k) => setWeather(k),
  forceBoss: (id) => { const def = NPCS.find(n => n.boss === id || n.id === id); const npc = def && npcs.byId.get(def.id); if (npc) startArenaBoss(id); },
  winFight: () => { if (combat.active) combat.win(); },
  instantWin: () => {
    if (!combat.active) return false;
    if (!combat.endResult) combat.win();
    combat.endTimer = 0;
    combat.finishCombat();
    return true;
  },
  instantLose: () => {
    if (!combat.active) return false;
    if (!combat.endResult) combat.lose();
    combat.endTimer = 0;
    combat.finishCombat();
    return true;
  }
};

// --------------------------
// go
// --------------------------
boot();
