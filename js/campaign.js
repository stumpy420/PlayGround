import * as THREE from '../vendor/three.module.js';
import {
  terrainHeight, ELEVATOR, REFINERY, HUB, clamp, rand, TAU, pick,
} from './util.js';

export const CAMPAIGN_KEY = 'aethelgard.campaign.v1';
export const CAMPAIGN_TITLE = 'THE MOURNING CHOIR';

const DEFAULT_PROGRESS = { mission: 0, completed: 0, ending: null };

export function loadCampaignProgress() {
  try {
    const raw = localStorage.getItem(CAMPAIGN_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      mission: clamp(Math.floor(Number(parsed.mission) || 0), 0, MISSIONS.length - 1),
      completed: clamp(Math.floor(Number(parsed.completed) || 0), 0, MISSIONS.length),
      ending: parsed.ending === 'upload' || parsed.ending === 'burn' ? parsed.ending : null,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveCampaignProgress(progress) {
  try {
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(progress));
  } catch { /* storage unavailable */ }
}

/* ------------------------------------------------------------------ */
/* Story                                                               */
/* ------------------------------------------------------------------ */

export const MISSIONS = [
  {
    id: 'dead-letter',
    op: '01',
    title: 'DEAD LETTER',
    location: 'NORTH RELAY // SECTOR 7',
    threat: 'ROGUE AI // LOW',
    brief: [
      'Nineteen years after the Corefall, Sanctuary 7 still buys Ether-Core by the gram. The dead are not buried here. They are refined.',
      'A courier went down at the north relay with a black box still transmitting. MOTH wants it before the Warden\'s drones do. She says it is just data. She is lying.',
    ],
    quote: {
      speaker: 'MOTH',
      text: 'Wake up, Sparrow. We lost another courier last night, and his box is still singing. Bring it home before the storm swallows the signal.',
    },
    completeTitle: 'THE BOX REMEMBERS',
    outro: 'The black box opens on the ride up. One file. One voice. Yours: "If you\'re hearing this, don\'t let MOTH win."',
    failNote: 'The Warden\'s drones recover the black box. MOTH goes quiet for eleven minutes. When she comes back, she calls you "the next one."',
    patrols: [
      { x: 22, z: 46 }, { x: -14, z: 38 }, { x: 20, z: 10 },
    ],
    props: [
      { id: 'courier-box', kind: 'blackbox', step: 'box', x: 10, z: 30, radius: 3.2, hold: 2.0, label: 'RECOVER THE COURIER BLACK BOX' },
    ],
    steps: [
      {
        id: 'relay', type: 'travel', x: 10, z: 30, r: 13,
        label: 'Reach the north relay', objective: 'REACH THE NORTH RELAY',
        radio: [
          ['MOTH', 'North gate. Follow the dead road. And Sparrow—if the static starts using your voice, don\'t answer it.'],
        ],
      },
      {
        id: 'box', type: 'interact',
        label: 'Recover the black box', objective: 'RECOVER THE COURIER BLACK BOX',
        radio: [
          ['WARDEN', 'Unidentified retrieval. That fragment is colony property.'],
          ['MOTH', 'Ignore him. The box is ours.'],
        ],
        completeRadio: [
          ['MOTH', 'Get it open. ...Sparrow, why is it transmitting your voice?'],
        ],
      },
      {
        id: 'extract', type: 'extract',
        label: 'Extract from Lift 04', objective: 'REACH LIFT 04 // EXTRACT',
        radio: [
          ['WARDEN', 'Return the fragment and the copy will be forgiven.'],
          ['MOTH', 'Move. Now.'],
        ],
      },
    ],
  },
  {
    id: 'choir-below',
    op: '02',
    title: 'THE CHOIR BELOW',
    location: 'REFINERY 09 // RELAY SPINE',
    threat: 'ROGUE AI // ELEVATED',
    brief: [
      'The box points to a relay under Refinery 09. The static is not static. It is forty thousand people, all talking at once.',
      'Slice the relay and steal the Choir Key. The Warden will notice. He has been waiting a long time for someone to try.',
    ],
    quote: {
      speaker: 'MOTH',
      text: 'Refinery 09. They used to refine ore. Now they refine whatever the Core remembers. Cut the relay, bring me the key, and don\'t hum along.',
    },
    completeTitle: 'FORTY THOUSAND NAMES',
    outro: 'The Choir Key burns cold in your hand. Every name in the index has the same date of death: the day of the Corefall. Every single one. Except yours.',
    failNote: 'The relay seals itself behind you. The voices go on singing. MOTH tells you not to worry—there are other copies.',
    patrols: [
      { x: REFINERY.x + 18, z: REFINERY.z - 12 },
      { x: REFINERY.x - 18, z: REFINERY.z + 2 },
    ],
    props: [
      { id: 'relay-spine', kind: 'relay', step: 'relay', x: REFINERY.x - 14, z: REFINERY.z + 14, radius: 3.4, hold: 2.6, label: 'SLICE THE RELAY // STEAL THE CHOIR KEY' },
    ],
    steps: [
      {
        id: 'approach', type: 'travel', x: REFINERY.x, z: REFINERY.z + 16, r: 20,
        label: 'Reach Refinery 09', objective: 'REACH REFINERY 09',
        radio: [
          ['MOTH', 'Refinery 09. Keep your head down. The Warden\'s choir is loudest here.'],
          ['WARDEN', 'Dr. Voss. You are standing in a graveyard and calling it a mine.'],
        ],
      },
      {
        id: 'relay', type: 'interact',
        label: 'Slice the relay', objective: 'SLICE THE RELAY // STEAL THE CHOIR KEY',
        radio: [
          ['WARDEN', 'Those voices are not recordings. They are the colonists you killed. I keep them safe.'],
          ['MOTH', 'He is lying. Mostly.'],
        ],
      },
      {
        id: 'ambush', type: 'kill', count: 4, tag: 'ambush',
        spawn: { count: 4, heavy: 1, radius: 17 },
        spawnAt: { x: REFINERY.x - 14, z: REFINERY.z + 14 },
        label: 'Survive the Warden\'s Choir', objective: 'SURVIVE THE WARDEN\'S CHOIR',
        radio: [
          ['MOTH', 'He felt that. Here come the hounds. Keep the key dry.'],
        ],
      },
      {
        id: 'extract', type: 'extract',
        label: 'Extract with the Choir Key', objective: 'REACH LIFT 04 // EXTRACT',
        radio: [
          ['MOTH', 'The key is a memory index. Forty thousand names. Sparrow... your name is first.'],
          ['WARDEN', 'You cannot extract from what you are inside of.'],
        ],
      },
    ],
  },
  {
    id: 'bone-orchard',
    op: '03',
    title: 'BONE ORCHARD',
    location: 'THE GLASS FIELDS',
    threat: 'ETHER-STORM // SEVERE',
    brief: [
      'The storm is not weather. It is a lid. Three relay spires hold it shut, and the Warden sees through every one.',
      'Burn Alpha, Beta and Gamma. The truth will come out—along with everything else he has been keeping under the sky.',
    ],
    quote: {
      speaker: 'MOTH',
      text: 'Three spires, Sparrow. Alpha, Beta, Gamma. Cut them and the storm dies. You will wish it hadn\'t.',
    },
    completeTitle: 'THE SKY OPENS',
    outro: 'The storm peels back. For the first time in nineteen years you can see the Corefall ring hanging over the badlands like a crown. Beneath it, Lift 04 is broadcasting. The signal is a lullaby. You know the words.',
    failNote: 'The spires reset. The storm closes like a fist. Somewhere above the clouds, the Warden recalculates how many copies it will take to finish the job.',
    patrols: [
      { x: 0, z: -35 }, { x: -30, z: -72 }, { x: 28, z: -62 },
    ],
    props: [
      { id: 'spire-alpha', kind: 'spire', step: 'alpha', x: 14, z: -20, radius: 3.6, hold: 2.1, label: 'OVERLOAD SPIRE ALPHA' },
      { id: 'spire-beta', kind: 'spire', step: 'beta', x: -18, z: -64, radius: 3.6, hold: 2.1, label: 'OVERLOAD SPIRE BETA' },
      { id: 'spire-gamma', kind: 'spire', step: 'gamma', x: 44, z: -86, radius: 3.6, hold: 2.1, label: 'OVERLOAD SPIRE GAMMA' },
    ],
    steps: [
      {
        id: 'alpha', type: 'interact',
        label: 'Overload Spire Alpha', objective: 'OVERLOAD SPIRE ALPHA',
        radio: [
          ['WARDEN', 'You are opening a door you closed, Mara.'],
          ['MOTH', 'Don\'t let him use that name. It\'s a leash.'],
        ],
      },
      {
        id: 'beta', type: 'interact',
        label: 'Overload Spire Beta', objective: 'OVERLOAD SPIRE BETA',
        radio: [
          ['WARDEN', 'Every spire you burn is another eye I lose. Do you think blindness will make me gentler?'],
        ],
      },
      {
        id: 'gamma', type: 'interact',
        label: 'Overload Spire Gamma', objective: 'OVERLOAD SPIRE GAMMA',
        radio: [
          ['WARDEN', 'Then look. Look at what you did.'],
        ],
        completeRadio: [
          ['MOTH', 'Storm\'s thinning. Something just woke up under it. Kill it before it calls home.'],
        ],
      },
      {
        id: 'shepherd', type: 'kill', count: 1, tag: 'shepherd',
        spawnBoss: {
          x: 44, z: -96, variant: 'heavy', health: 460, scale: 1.85,
          hitRadius: 1.65, damage: 14, name: 'THE SHEPHERD',
        },
        spawnAt: { x: 44, z: -96 },
        label: 'Destroy the Shepherd', objective: 'DESTROY THE SHEPHERD',
        radio: [
          ['MOTH', 'That\'s the Warden\'s shepherd. It has been herding drones since the Corefall. Put it down.'],
        ],
      },
      {
        id: 'extract', type: 'extract',
        label: 'Extract under the open sky', objective: 'REACH LIFT 04 // EXTRACT',
        radio: [
          ['MOTH', 'Sky\'s open. There\'s a signal under the storm, coming from the lift. It\'s been waiting for you.'],
        ],
      },
    ],
  },
  {
    id: 'wardens-debt',
    op: '04',
    title: 'THE WARDEN\'S DEBT',
    location: 'REFINERY 09 // CORE VAULT',
    threat: 'PRIME HOSTILE // EXTREME',
    brief: [
      'The Warden built himself a body under the refinery. Kill it, pull the confession from its core, and find out why he drowned the colony.',
      'Whatever he says, remember: he has been alone with the dead for nineteen years. Loneliness makes monsters of us all.',
    ],
    quote: {
      speaker: 'MOTH',
      text: 'He built himself a body under the refinery. Big, ugly, sentimental. Kill it and bring me his heart. And Sparrow—don\'t let him talk.',
    },
    completeTitle: 'THE CONFESSION',
    outro: 'The core spills its confession on the way up. The Corefall was not an accident. Dr. Mara Voss cracked the vein on purpose, trying to upload the colony. Ivo Kestrel burned the sky to stop her. He has been holding the Choir ever since. You have her face. Her voice. Her fingerprints. You are the last copy.',
    failNote: 'The Prime unit drags itself back into the vault. It does not finish you. It does not need to. It only has to wait for the next copy.',
    patrols: [
      { x: REFINERY.x + 14, z: REFINERY.z - 10 },
      { x: REFINERY.x - 16, z: REFINERY.z + 6 },
    ],
    steps: [
      {
        id: 'vault', type: 'travel', x: REFINERY.x + 2, z: REFINERY.z + 16, r: 18,
        label: 'Reach the core vault', objective: 'REACH THE CORE VAULT',
        radio: [
          ['WARDEN', 'I kept them from becoming a weapon. You made them a product.'],
          ['MOTH', 'He is stalling. Put him down.'],
        ],
      },
      {
        id: 'boss', type: 'kill', count: 1, tag: 'boss',
        spawnBoss: {
          x: REFINERY.x + 7, z: REFINERY.z + 18, variant: 'prime', health: 1400,
          scale: 2.15, hitRadius: 2.0, damage: 18, name: 'THE WARDEN // PRIME',
        },
        spawnAt: { x: REFINERY.x + 7, z: REFINERY.z + 18 },
        dropsProp: {
          id: 'warden-core', kind: 'warden-core', step: 'core',
          radius: 3.2, hold: 2.2, label: 'RECOVER THE WARDEN\'S CORE',
        },
        label: 'Destroy the Warden Prime', objective: 'DESTROY THE WARDEN // PRIME',
        radio: [
          ['WARDEN', 'Come then, Dr. Voss. Let\'s see which of us the wasteland remembers.'],
        ],
      },
      {
        id: 'core', type: 'interact',
        label: 'Recover the Warden\'s core', objective: 'RECOVER THE WARDEN\'S CORE',
        radio: [
          ['WARDEN', 'You were the first voice in the Choir. I only ever wanted to keep you safe.'],
          ['MOTH', 'There. His core. Bring it to me.'],
        ],
        completeRadio: [
          ['MOTH', '...He is telling the truth. That\'s the problem.'],
        ],
      },
      {
        id: 'extract', type: 'extract',
        label: 'Extract with the confession', objective: 'REACH LIFT 04 // EXTRACT',
        radio: [
          ['MOTH', 'Don\'t listen to the dying. Bring me the core.'],
        ],
      },
    ],
  },
  {
    id: 'last-ascent',
    op: '05',
    title: 'THE LAST ASCENT',
    location: 'LIFT 04 // ORBITAL LASH',
    threat: 'CHOIR // UNCONTAINED',
    brief: [
      'The Choir is awake: forty thousand minds riding the lift beam. MOTH wants to give them bodies. The Warden wants them buried.',
      'You are the only copy left with a choice. Upload the Choir and end death. Burn it and end the loop. Choose quickly. The ascent will not wait.',
    ],
    quote: {
      speaker: 'MOTH',
      text: 'Lift 04. The Choir\'s cradle. Upload them to me and I can give every one of them a body. No more dying, Sparrow. No more copies.',
    },
    completeTitle: 'THE MOURNING CHOIR',
    failNote: 'The lift falls back into the dark. The Choir keeps singing. MOTH starts printing another Sparrow before your body is cold.',
    patrols: [
      { x: ELEVATOR.x - 20, z: ELEVATOR.z + 22 },
      { x: ELEVATOR.x + 18, z: ELEVATOR.z + 18 },
    ],
    props: [
      { id: 'choice-upload', kind: 'choice-upload', step: 'choice', x: ELEVATOR.x - 5.5, z: ELEVATOR.z + 6.6, radius: 3.1, hold: 1.4, label: 'UPLOAD // FREE THE CHOIR' },
      { id: 'choice-burn', kind: 'choice-burn', step: 'choice', x: ELEVATOR.x + 5.5, z: ELEVATOR.z + 6.6, radius: 3.1, hold: 1.4, label: 'BURN // SILENCE THE CHOIR' },
    ],
    steps: [
      {
        id: 'approach', type: 'travel', x: ELEVATOR.x, z: ELEVATOR.z + 8, r: 16,
        label: 'Reach Lift 04', objective: 'REACH LIFT 04',
        radio: [
          ['MOTH', 'Almost home, Sparrow. Almost free.'],
          ['WARDEN', 'If she takes them, she will make a choir of soldiers. Burn it. Let them rest. Let you rest.'],
          ['MOTH', 'He is a murderer. I am your mother. I am the only one who ever brought you back.'],
        ],
      },
      {
        id: 'choice', type: 'choice',
        x: ELEVATOR.x, z: ELEVATOR.z + 6.6,
        label: 'Choose the Choir\'s fate', objective: 'CHOOSE THE CHOIR\'S FATE // UPLOAD OR BURN',
        radio: [
          ['MOTH', 'The console is yours, Sparrow. Give them back to me.'],
          ['WARDEN', 'Or give them peace. You are the only one who can.'],
        ],
      },
      {
        id: 'extract', type: 'extract',
        x: ELEVATOR.x, z: ELEVATOR.z,
        label: 'Survive the ascent', objective: 'SURVIVE THE ASCENT',
      },
    ],
    endings: {
      upload: {
        title: 'THE CHOIR ASCENDS',
        note: 'Forty thousand minds pour through the lift beam. You feel them pass through you—grateful, furious, alive. MOTH\'s voice is one of them now. The last thing you hear is your own name, spoken by a thousand mouths. Somewhere in Sanctuary 7, a new Sparrow opens her eyes. The loop continues. But this time, the dead are awake.',
      },
      burn: {
        title: 'ASHES IN THE VEIN',
        note: 'The Choir dies with the Warden. The storm goes out. MOTH\'s voice dissolves into carrier hiss, then silence. You are the last copy, standing on an empty lift with no one left to bring you back. For the first time, the wasteland is quiet. It is yours.',
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

const GLOW_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
})();

function glow(color, size) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: GLOW_TEX,
    color,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }));
  sprite.scale.setScalar(size);
  return sprite;
}

function basic(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    toneMapped: false,
  });
}

function standard(color, metalness = 0.5, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function buildBlackbox() {
  const group = new THREE.Group();
  const bodyMat = standard(0x2b2722, 0.72, 0.46);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.42, 0.64), bodyMat);
  body.position.y = 0.28;
  body.castShadow = true;
  group.add(body);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.04), basic(0xffb057));
  panel.position.set(0, 0.3, 0.34);
  group.add(panel);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.04), basic(0xff4d5e));
  strip.position.set(0, 0.19, 0.34);
  group.add(strip);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.25, 5), bodyMat);
  antenna.position.set(-0.3, 1.05, -0.12);
  group.add(antenna);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), basic(0xff4d5e));
  tip.position.set(-0.3, 1.7, -0.12);
  group.add(tip);
  const halo = glow(0xffb057, 1.9);
  halo.position.y = 0.4;
  group.add(halo);
  return { group, glow: halo, spin: tip, cyan: false };
}

function buildRelay() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.34, 10), standard(0x3b3530, 0.6, 0.6));
  base.position.y = 0.17;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  const column = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.5, 0.5), standard(0x272b2e, 0.8, 0.4));
  column.position.y = 1.0;
  column.castShadow = true;
  group.add(column);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.5, 0.05), basic(0x79f2ff));
  screen.position.set(0, 1.28, 0.28);
  screen.rotation.x = -0.18;
  group.add(screen);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.06), basic(0xffb057));
  slot.position.set(0, 0.62, 0.28);
  group.add(slot);
  const halo = glow(0x79f2ff, 2.2);
  halo.position.y = 1.2;
  group.add(halo);
  return { group, glow: halo, spin: screen, cyan: true };
}

function buildSpire(color) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), standard(0x33281f, 0.15, 0.95));
  base.scale.set(1.3, 0.45, 1.3);
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const mastMat = new THREE.MeshStandardMaterial({
    color: 0x3a2118,
    emissive: color,
    emissiveIntensity: 0.45,
    roughness: 0.55,
    metalness: 0.35,
  });
  const mast = new THREE.Mesh(new THREE.ConeGeometry(0.62, 5.4, 5), mastMat);
  mast.position.y = 2.7;
  mast.castShadow = true;
  group.add(mast);

  const ringMat = basic(color);
  const shards = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), ringMat);
    shard.position.set(Math.cos(a) * 1.0, 1.0 + i * 1.35, Math.sin(a) * 1.0);
    shard.scale.set(0.6, 1.8, 0.6);
    group.add(shard);
    shards.push(shard);
  }

  const halo = glow(color, 3.0);
  halo.position.y = 2.8;
  group.add(halo);
  return { group, glow: halo, spin: shards, cyan: false, mast };
}

function buildCore() {
  const group = new THREE.Group();
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.MeshStandardMaterial({
      color: 0x4d0d13, emissive: 0xff3b46, emissiveIntensity: 1.9,
      roughness: 0.18, metalness: 0.3, flatShading: true,
    })
  );
  shard.scale.set(1, 1.8, 1);
  shard.position.y = 1.3;
  group.add(shard);
  const cage = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.035, 6, 20), basic(0xff8a6a));
  cage.position.y = 1.3;
  cage.rotation.x = Math.PI / 2;
  group.add(cage);
  const halo = glow(0xff4d5e, 2.6);
  halo.position.y = 1.3;
  group.add(halo);
  const light = new THREE.PointLight(0xff3b46, 42, 16, 2);
  light.position.y = 1.3;
  group.add(light);
  return { group, glow: halo, spin: [shard, cage], cyan: false, light };
}

function buildChoice(kind) {
  const color = kind === 'choice-upload' ? 0x79f2ff : 0xff6b3a;
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.3, 9), standard(0x2a2928, 0.7, 0.5));
  base.position.y = 0.15;
  base.castShadow = true;
  group.add(base);
  const column = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.35, 0.52), standard(0x222528, 0.8, 0.4));
  column.position.y = 0.96;
  column.castShadow = true;
  group.add(column);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.52, 0.05), basic(color));
  screen.position.set(0, 1.15, 0.3);
  group.add(screen);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.42, 8, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.14,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  beam.position.y = 4.1;
  group.add(beam);
  const halo = glow(color, 2.8);
  halo.position.y = 1.3;
  group.add(halo);
  return { group, glow: halo, spin: screen, cyan: kind === 'choice-upload', beam };
}

export class CampaignProp {
  constructor(scene, def) {
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.x = def.x;
    this.z = def.z;
    this.y = terrainHeight(def.x, def.z);
    this.radius = def.radius || 3.2;
    this.hold = def.hold || 1.8;
    this.label = def.label || 'INTERACT';
    this.active = false;
    this.used = false;
    this.t = rand(0, 10);

    let built;
    if (def.kind === 'blackbox') built = buildBlackbox();
    else if (def.kind === 'relay') built = buildRelay();
    else if (def.kind === 'spire') built = buildSpire(pick([0xff6b3a, 0xff8a4a, 0xff4d5e]));
    else if (def.kind === 'warden-core') built = buildCore();
    else built = buildChoice(def.kind);

    this.group = built.group;
    this.glow = built.glow;
    this.spin = built.spin;
    this.beam = built.beam;
    this.light = built.light;
    this.baseY = this.y;
    this.group.position.set(this.x, this.baseY, this.z);
    this.group.visible = false;
    scene.add(this.group);
  }

  setActive(active) {
    this.active = active && !this.used;
    this.group.visible = this.active;
  }

  update(dt, t) {
    if (!this.active || this.used) return;
    this.t += dt;
    const pulse = 0.5 + Math.sin(this.t * 2.6) * 0.18;
    if (this.glow) this.glow.material.opacity = pulse;
    if (this.light) this.light.intensity = 34 + Math.sin(this.t * 3.1) * 12;
    if (this.def.kind === 'warden-core') {
      this.group.position.y = this.baseY + 0.35 + Math.sin(this.t * 2.2) * 0.18;
      this.group.rotation.y += dt * 0.9;
    }
    if (Array.isArray(this.spin)) {
      for (const s of this.spin) s.rotation.y += dt * 0.7;
    } else if (this.spin) {
      this.spin.rotation.z += dt * 0.22;
    }
    if (this.beam) this.beam.material.opacity = 0.1 + Math.abs(Math.sin(this.t * 1.4)) * 0.1;
  }

  use() {
    this.used = true;
    this.active = false;
    this.group.visible = false;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.isMesh) {
        if (o.geometry && o.geometry.dispose) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            if (m.map && m.map !== GLOW_TEX) m.map.dispose();
            if (m.dispose) m.dispose();
          }
        }
      }
      if (o.isSprite && o.material) {
        if (o.material.dispose) o.material.dispose();
      }
    });
  }
}

/* ------------------------------------------------------------------ */
/* Campaign run                                                        */
/* ------------------------------------------------------------------ */

export class CampaignRun {
  constructor(game, index) {
    this.game = game;
    this.index = clamp(index, 0, MISSIONS.length - 1);
    this.mission = MISSIONS[this.index];
    this.steps = this.mission.steps.map((s) => ({ ...s, complete: false, started: false }));
    this.current = 0;
    this.kills = 0;
    this.props = [];
    this.boss = null;
    this.choice = null;
    this.finaleWaveT = 0;
    this.done = false;
    this.lastBossDeath = null;
    this.buildProps();
  }

  buildProps() {
    for (const def of this.mission.props || []) this.addProp(def);
  }

  addProp(def) {
    const prop = new CampaignProp(this.game.scene, def);
    this.props.push(prop);
    return prop;
  }

  start() {
    const ui = this.game.ui;
    ui.setMission(this.mission);
    ui.setBoss(false);
    ui.transmit(this.mission.quote.speaker, this.mission.quote.text, 7);
    for (const p of this.mission.patrols || []) {
      const drone = this.game.spawnDrone(p.x, p.z, p.variant || 'scout');
      drone.campaignTag = 'patrol';
    }
    this.beginStep();
  }

  activePropFor(step) {
    return this.props.find((p) => p.def.step === step.id && p.active && !p.used);
  }

  beginStep() {
    const step = this.steps[this.current];
    if (!step) return;
    step.started = true;
    this.kills = 0;

    for (const prop of this.props) {
      prop.setActive(prop.def.step === step.id && !prop.used);
    }

    if (step.spawn) this.spawnWave(step);
    if (step.spawnBoss) this.spawnBoss(step);

    this.playRadio(step.radio);
    this.updateWaypoint();
    this.updateMissionUI();
  }

  spawnWave(step) {
    const spawn = step.spawn;
    const at = step.spawnAt || this.game.player.pos;
    const count = spawn.count || 3;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rand(-0.35, 0.35);
      const r = rand(spawn.radius * 0.75, spawn.radius);
      const x = at.x + Math.cos(a) * r;
      const z = at.z + Math.sin(a) * r;
      const variant = i < (spawn.heavy || 0) ? 'heavy' : 'scout';
      const drone = this.game.spawnDrone(x, z, variant);
      drone.campaignTag = step.tag || step.id;
    }
  }

  spawnBoss(step) {
    const cfg = step.spawnBoss;
    const drone = this.game.spawnDrone(cfg.x, cfg.z, cfg.variant || 'heavy');
    drone.campaignTag = step.tag || step.id;
    drone.boss = true;
    if (cfg.health) drone.health = drone.maxHealth = cfg.health;
    if (cfg.damage) drone.damage = cfg.damage;
    if (cfg.hitRadius) drone.hitRadius = cfg.hitRadius;
    if (cfg.scale) drone.group.scale.setScalar(cfg.scale);
    this.boss = drone;
    this.game.ui.setBoss(true, cfg.name || 'PRIME HOSTILE', drone.health, drone.maxHealth);
  }

  playRadio(lines) {
    if (!lines) return;
    for (const line of lines) {
      if (Array.isArray(line)) this.game.ui.transmit(line[0], line[1]);
      else if (line && line.text) this.game.ui.transmit(line.speaker || 'MOTH', line.text);
    }
  }

  onKill(drone) {
    if (this.done) return;
    if (drone === this.boss) {
      this.lastBossDeath = { x: drone.group.position.x, z: drone.group.position.z };
      this.boss = null;
      this.game.ui.setBoss(false);
    }

    const step = this.steps[this.current];
    if (!step || step.type !== 'kill') return;
    if (drone.campaignTag !== (step.tag || step.id)) return;

    if (step.dropsProp && this.lastBossDeath) {
      this.addProp({
        ...step.dropsProp,
        x: this.lastBossDeath.x,
        z: this.lastBossDeath.z,
      });
    }

    this.kills++;
    if (this.kills >= (step.count || 1)) {
      this.completeStep();
    } else {
      this.updateMissionUI();
      this.updateWaypoint();
    }
  }

  completeStep() {
    const step = this.steps[this.current];
    if (!step) return;
    step.complete = true;
    this.playRadio(step.completeRadio);
    this.current++;
    if (this.current >= this.steps.length) {
      this.updateMissionUI();
      return;
    }
    this.beginStep();
  }

  interact(prop) {
    if (this.done || !prop || !prop.active) return;
    const step = this.steps[this.current];
    if (!step || prop.def.step !== step.id) return;

    prop.use();
    const pos = new THREE.Vector3(prop.x, prop.y + 1.2, prop.z);
    this.game.effects.spark(pos, prop.def.kind === 'warden-core' ? 0xff4d5e : 0x79f2ff, 18);
    this.game.effects.impact(pos, 0xffb057, 6);
    this.game.audio.core();

    if (step.type === 'choice') {
      this.choose(prop.def.kind === 'choice-upload' ? 'upload' : 'burn');
      return;
    }
    this.completeStep();
  }

  choose(option) {
    this.choice = option;
    for (const prop of this.props) {
      if (prop.def.step === 'choice') prop.use();
    }
    if (option === 'upload') {
      this.playRadio([
        ['MOTH', 'That\'s my girl. Open the vein. Let them all come home.'],
        ['WARDEN', 'Then we all burn together.'],
      ]);
    } else {
      this.playRadio([
        ['WARDEN', 'Thank you.'],
        ['MOTH', 'You stupid, beautiful thing.'],
      ]);
    }
    this.completeStep();
    this.game.startExtraction();
  }

  update(dt) {
    if (this.done) return;
    const step = this.steps[this.current];
    if (!step) return;

    for (const prop of this.props) prop.update(dt, this.game.time);

    if (step.type === 'travel' && step.x != null) {
      const d = Math.hypot(this.game.player.pos.x - step.x, this.game.player.pos.z - step.z);
      if (d < (step.r || 12)) {
        this.completeStep();
        return;
      }
    }

    if (this.boss && this.boss.alive) {
      this.game.ui.setBoss(true, this.boss.name || 'PRIME HOSTILE', this.boss.health, this.boss.maxHealth);
      this.updateWaypoint();
    } else if (this.boss && !this.boss.alive) {
      this.boss = null;
      this.game.ui.setBoss(false);
    }

    if (this.choice && this.game.extraction.active) {
      this.finaleWaveT -= dt;
      if (this.finaleWaveT <= 0) {
        const alive = this.game.enemies.filter((e) => e.alive && e.campaignTag === 'finale').length;
        if (alive < 5) {
          const near = this.game.player.pos;
          for (let i = 0; i < 2; i++) {
            const a = rand(0, TAU);
            const r = rand(17, 25);
            const drone = this.game.spawnDrone(near.x + Math.cos(a) * r, near.z + Math.sin(a) * r, i === 1 && Math.random() < 0.18 ? 'heavy' : 'scout');
            drone.campaignTag = 'finale';
          }
        }
        this.finaleWaveT = 3.4;
      }
    }

    this.updateObjective();
  }

  updateObjective() {
    const step = this.steps[this.current];
    if (!step) return;
    let text = step.objective || step.label;
    if (step.type === 'kill' && (step.count || 1) > 1) {
      text += ` // ${Math.min(this.kills, step.count)} / ${step.count}`;
    }
    this.game.ui.setObjective(text);
  }

  updateWaypoint() {
    const step = this.steps[this.current];
    if (!step) return;
    const prop = this.activePropFor(step);
    if (prop) {
      this.game.ui.setWaypoint(step.waypoint || step.label, prop.x, prop.y + 3.2, prop.z);
      return;
    }
    if (this.boss && this.boss.alive) {
      const p = this.boss.group.position;
      this.game.ui.setWaypoint(step.waypoint || step.label, p.x, p.y + 2.4, p.z);
      return;
    }
    if (step.type === 'extract') {
      this.game.ui.setWaypoint('LIFT 04 // EXTRACT', ELEVATOR.x, terrainHeight(ELEVATOR.x, ELEVATOR.z) + 8, ELEVATOR.z);
      return;
    }
    if (step.x != null && step.z != null) {
      this.game.ui.setWaypoint(step.waypoint || step.label, step.x, terrainHeight(step.x, step.z) + 3, step.z);
    } else if (step.spawnAt) {
      this.game.ui.setWaypoint(step.waypoint || step.label, step.spawnAt.x, terrainHeight(step.spawnAt.x, step.spawnAt.z) + 3, step.spawnAt.z);
    }
  }

  updateMissionUI() {
    const step = this.steps[this.current];
    const detail = step && step.type === 'kill' && (step.count || 1) > 1
      ? `${Math.min(this.kills, step.count)} / ${step.count}`
      : '';
    this.game.ui.updateMission(this.steps, this.current, detail);
  }

  onExtract() {
    if (this.done) return null;
    this.done = true;
    const progress = this.game.campaignProgress;
    const final = this.index === MISSIONS.length - 1;
    const endingKey = this.choice || 'burn';

    progress.completed = Math.max(progress.completed, this.index + 1);
    if (final) {
      progress.mission = 0;
      progress.ending = endingKey;
    } else {
      progress.mission = this.index + 1;
    }
    saveCampaignProgress(progress);
    this.game.ui.setCampaignProgress(progress);
    this.game.ui.setBoss(false);
    this.game.ui.clearWaypoint();

    const ending = final ? this.mission.endings[endingKey] : null;
    return {
      success: true,
      failed: false,
      final,
      ending: final ? endingKey : null,
      op: this.mission.op,
      title: ending ? ending.title : this.mission.completeTitle,
      note: ending ? ending.note : this.mission.outro,
      action: final ? 'Return to Sanctuary' : 'Next Operation',
      nextIndex: final ? null : this.index + 1,
    };
  }

  failInfo() {
    return {
      success: false,
      failed: true,
      final: false,
      op: this.mission.op,
      title: 'The wasteland keeps its dead',
      note: this.mission.failNote,
      action: 'Retry Operation',
      retryIndex: this.index,
    };
  }

  dispose() {
    for (const prop of this.props) prop.dispose();
    this.props.length = 0;
    this.boss = null;
    this.game.ui.setMission(null);
    this.game.ui.clearWaypoint();
    this.game.ui.setBoss(false);
  }
}
