import * as THREE from '../vendor/three.module.js';
import { NPCS, BUSINESSES } from './data.js';
import { mulberry32 } from './world.js';

const TAU = Math.PI * 2;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

function nameTexture(name, role, color) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,384,96);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(4,8,9,.58)';
  ctx.fillRect(30, 12, 324, 64);
  ctx.fillStyle = color || '#e9e4d8';
  ctx.fillRect(30, 12, 324, 2);
  ctx.font = '400 32px Bebas, sans-serif';
  ctx.fillStyle = '#e9e4d8';
  ctx.fillText(name.toUpperCase(), 192, 46);
  ctx.font = '400 12px Plex, monospace';
  ctx.fillStyle = 'rgba(127,227,210,.9)';
  ctx.fillText(role.toUpperCase(), 192, 65);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32,32,2,32,32,30);
  g.addColorStop(0,'rgba(0,0,0,.55)'); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}

const shadowTex = shadowTexture();

function makeHuman(def, opts = {}) {
  const p = def.palette;
  const boss = opts.boss;
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color:p.skin, roughness:.85 });
  const shirt = new THREE.MeshStandardMaterial({ color:p.shirt, roughness:.75 });
  const pants = new THREE.MeshStandardMaterial({ color:p.pants, roughness:.82 });
  const hair = new THREE.MeshStandardMaterial({ color:p.hair, roughness:.9 });
  const accent = new THREE.MeshStandardMaterial({ color:p.accent, roughness:.55, metalness:.2, emissive:new THREE.Color(p.accent).multiplyScalar(.06) });
  const dark = new THREE.MeshStandardMaterial({ color:0x121718, roughness:.8 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .55, 4, 8), shirt);
  torso.position.y = 1.18; torso.castShadow = true; g.add(torso);
  const hip = new THREE.Mesh(new THREE.BoxGeometry(.52,.26,.3), pants); hip.position.y = .86; g.add(hip);

  const head = new THREE.Group(); head.position.y = 1.7;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.19, 12, 10), skin); head.add(skull);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(.195, 10, 8, 0, TAU, 0, Math.PI * .55), hair); hairCap.position.y = .02; head.add(hairCap);
  if (boss === 'barista') {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(.1,8,6), hair); bun.position.set(0,.21,-.07); head.add(bun);
  }
  if (boss === 'mayor') {
    const hair2 = new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.12), hair); hair2.position.set(0,.15,-.1); head.add(hair2);
  }
  if (boss === 'oldman') {
    const beard = new THREE.Mesh(new THREE.ConeGeometry(.11,.24,6), new THREE.MeshStandardMaterial({ color:0xd8d3c6, roughness:1 }));
    beard.position.set(0,-.17,.13); beard.rotation.x = .15; head.add(beard);
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: boss === 'mirror' || boss === 'future' ? 0xff4338 : 0x101415, toneMapped:false });
  for (const x of [-.065,.065]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.018,5,4), eyeMat); e.position.set(x,.02,.18); head.add(e); }
  g.add(head);

  const mkArm = (side) => {
    const pivot = new THREE.Group(); pivot.position.set(side * .36, 1.42, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(.075,.38,3,6), shirt); upper.position.y = -.21; pivot.add(upper);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.085,7,5), skin); hand.position.y = -.46; pivot.add(hand);
    g.add(pivot); return pivot;
  };
  const leftArm = mkArm(-1), rightArm = mkArm(1);
  const mkLeg = (side) => {
    const pivot = new THREE.Group(); pivot.position.set(side * .15, .82, 0);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.09,.55,3,6), pants); leg.position.y = -.32; pivot.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(.17,.11,.3), dark); shoe.position.set(0,-.66,.06); pivot.add(shoe);
    g.add(pivot); return pivot;
  };
  const leftLeg = mkLeg(-1), rightLeg = mkLeg(1);

  // accessories
  if (boss === 'barista') {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(.48,.72,.06), new THREE.MeshStandardMaterial({ color:0x29231f, roughness:.9 })); apron.position.set(0,1.02,.22); g.add(apron);
  }
  if (boss === 'ferryman') {
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.34,.44,1.18,8), new THREE.MeshStandardMaterial({ color:0x1e3438, roughness:.9 })); coat.position.y = 1.0; g.add(coat);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.12,10), new THREE.MeshStandardMaterial({ color:0x1b282a, roughness:.9 })); hat.position.y = 1.92; g.add(hat);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.03,12), new THREE.MeshStandardMaterial({ color:0x1b282a, roughness:.9 })); brim.position.y = 1.88; g.add(brim);
  }
  if (boss === 'hiker') {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(.4,.55,.22), new THREE.MeshStandardMaterial({ color:0x4a3b28, roughness:.95 })); pack.position.set(0,1.2,-.24); g.add(pack);
    const rope = new THREE.Mesh(new THREE.TorusGeometry(.2,.03,6,12), new THREE.MeshStandardMaterial({ color:0xd0a358 })); rope.position.set(.38,1.08,.03); rope.rotation.y = .3; g.add(rope);
  }
  if (boss === 'mechanic') {
    const overalls = new THREE.Mesh(new THREE.BoxGeometry(.46,.8,.08), new THREE.MeshStandardMaterial({ color:0x2d3841, roughness:.9 })); overalls.position.set(0,1.02,.21); g.add(overalls);
    const wrench = new THREE.Mesh(new THREE.BoxGeometry(.06,.55,.06), new THREE.MeshStandardMaterial({ color:0x8c9490, metalness:.8, roughness:.3 })); wrench.position.set(.42,.85,.05); wrench.rotation.z = -.25; g.add(wrench);
  }
  if (boss === 'student') {
    const gi = new THREE.Mesh(new THREE.BoxGeometry(.55,.72,.34), new THREE.MeshStandardMaterial({ color:0xd8d2c4, roughness:.85 })); gi.position.y = 1.18; g.add(gi);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(.58,.1,.37), new THREE.MeshStandardMaterial({ color:0x5a2c2c })); belt.position.y = .88; g.add(belt);
  }
  if (boss === 'oldman') {
    const cane = new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,1.5,6), new THREE.MeshStandardMaterial({ color:0x5a4432 })); cane.position.set(.43,.73,.08); cane.rotation.z = -.07; g.add(cane);
  }
  if (boss === 'raincoat') {
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.32,.5,1.35,8), new THREE.MeshStandardMaterial({ color:0xd4b432, roughness:.65 })); coat.position.y = 1.0; g.add(coat);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(.28,10,8,0,TAU,0,Math.PI*.62), new THREE.MeshStandardMaterial({ color:0xd4b432, roughness:.7 })); hood.position.y = 1.79; g.add(hood);
    const face = new THREE.Mesh(new THREE.SphereGeometry(.17,8,6), new THREE.MeshBasicMaterial({ color:0x050707 })); face.position.set(0,1.73,.08); g.add(face);
  }
  if (boss === 'mayor') {
    const sash = new THREE.Mesh(new THREE.BoxGeometry(.1,.76,.03), new THREE.MeshStandardMaterial({ color:0xff4338, roughness:.5, emissive:0x3a0807 })); sash.position.set(0,1.16,.24); sash.rotation.z = .36; g.add(sash);
  }
  if (boss === 'mirror') {
    const mat = new THREE.MeshStandardMaterial({ color:0xa9b8b6, metalness:.9, roughness:.12, emissive:0x0d2524 });
    g.traverse(o => { if (o.isMesh) { o.material = mat; } });
    const eyes = new THREE.MeshBasicMaterial({ color:0x7fe3d2, toneMapped:false });
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(.03,5,4), eyes); e1.position.set(-.065,1.72,.19); g.add(e1);
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(.03,5,4), eyes); e2.position.set(.065,1.72,.19); g.add(e2);
  }
  if (boss === 'future') {
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.35,.47,1.3,8), new THREE.MeshStandardMaterial({ color:0x0d1213, roughness:.6, metalness:.3 })); coat.position.y = 1.0; g.add(coat);
    const glow = new THREE.PointLight(0xff4338, 3, 6, 2); glow.position.set(0,1.75,.2); g.add(glow);
  }
  if (def.id === 'dax') {
    const chain = new THREE.Mesh(new THREE.TorusGeometry(.09,.012,4,10), new THREE.MeshStandardMaterial({ color:0xd0b36c, metalness:.9, roughness:.25 })); chain.position.set(0,1.48,.22); g.add(chain);
  }
  if (def.id === 'sasha') {
    const guitar = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.08,10), new THREE.MeshStandardMaterial({ color:0x4b2c26 })); body.rotation.x = Math.PI/2; guitar.add(body);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(.07,.6,.05), new THREE.MeshStandardMaterial({ color:0x2d2018 })); neck.position.y = .37; guitar.add(neck);
    guitar.position.set(.44,.9,-.1); guitar.rotation.z = -.35; g.add(guitar);
  }
  if (def.id === 'nadia') {
    const book = new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.07), new THREE.MeshStandardMaterial({ color:0x7a4c3c })); book.position.set(.35,1.0,.15); book.rotation.z = .2; g.add(book);
  }

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .7), new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, opacity:.6 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .02; g.add(shadow);

  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map:nameTexture(def.name, def.tag || def.role, p.accent), transparent:true, depthWrite:false, opacity:.9 }));
  label.position.y = 2.22; label.scale.set(3.2, .8, 1); g.add(label);

  g.scale.setScalar((def.height || 1.72) / 1.72);
  return { group:g, torso, head, leftArm, rightArm, leftLeg, rightLeg, label, shadow, palette:p };
}

const SCHEDULE_TARGETS = {
  bar:{x:-50,z:36}, club:{x:80,z:70}, lake:{x:300,z:68}, dojo:{x:-158,z:-96},
  home:null, work:null
};

export class NPCSystem {
  constructor(scene, world, state) {
    this.scene = scene;
    this.world = world;
    this.state = state;
    this.npcs = [];
    this.ambient = [];
    this.byId = new Map();
    this.rng = mulberry32(773311);
    this.frozen = new Set();
    this.followers = [];
    this.lastScheduleTick = -1;
    this.clock = 0;
    this.spawned = false;
  }

  build() {
    for (const def of NPCS) {
      const model = makeHuman(def, { boss:def.boss });
      const npc = {
        ...def, model, group:model.group, homePos:def.home, workPos:def.work,
        x:def.work.x, z:def.work.z, targetX:def.work.x, targetZ:def.work.z,
        walkPhase:this.rng()*TAU, speed:.8 + this.rng()*.4, mode:'idle', facing:0,
        visible:true, lastDist:999, talkCount:0, fightCount:0
      };
      model.group.position.set(npc.x, 0, npc.z);
      this.scene.add(model.group);
      this.npcs.push(npc); this.byId.set(npc.id, npc);
    }
    this.buildAmbient(38);
    this.spawned = true;
    this.updateSchedule(true);
  }

  buildAmbient(count) {
    const first = ['Avery','Bex','Cal','Dani','Em','Fin','Gia','Hal','Iris','Jules','Kai','Lena','Milo','Nia','Owen','Pax','Quinn','Rae','Sol','Tess','Uma','Vale','Wes','Xan','Yara','Zed'];
    const last = ['Park','Vale','Moss','Hale','Rook','Fen','Wynn','Cross','Bell','Marsh','North','Sato','Voss','Crane','Reed','Ward','Ash','Kim','Rourke'];
    const roles = ['Pedestrian','Barista','Student','Cyclist','Fisher','Nurse','Clerk','Musician','Cook','Landlord','Tourist','Busker','Dockworker','Teacher','Line Cook'];
    const palettes = [
      {skin:'#b98b6e',shirt:'#3a4b4c',pants:'#22292a',hair:'#231b19',accent:'#7fe3d2'},
      {skin:'#c49b7b',shirt:'#6b4a3a',pants:'#292c2e',hair:'#4a3326',accent:'#ffb35c'},
      {skin:'#8c5e46',shirt:'#4d5d47',pants:'#222627',hair:'#181616',accent:'#86c68f'},
      {skin:'#d3a488',shirt:'#3d3448',pants:'#24202a',hair:'#7e3e4c',accent:'#d9a6ff'},
      {skin:'#a77758',shirt:'#4a4b45',pants:'#252727',hair:'#2b2320',accent:'#e9e4d8'}
    ];
    for (let i = 0; i < count; i++) {
      const district = ['downtown','downtown','downtown','waterfront','fairhaven','campus','residential','industrial','hills'][i % 9];
      const center = this.world.districtMarkers.find(d => d.id === district) || this.world.districtMarkers[0];
      const x = center.x + (this.rng() - .5) * 75, z = center.z + (this.rng() - .5) * 65;
      const def = {
        id:'ambient_' + i, name:first[i % first.length] + ' ' + last[(i * 3) % last.length],
        age:19 + Math.floor(this.rng() * 45), role:roles[i % roles.length], tag:roles[i % roles.length].toUpperCase(),
        district, palette:palettes[i % palettes.length], height:1.58 + this.rng() * .3,
        romanceable:false, fighter:this.rng() < .22, secret:'Maybe a fighter. Maybe just tired.'
      };
      const model = makeHuman(def);
      const npc = {
        ...def, model, group:model.group, x, z, targetX:x, targetZ:z, homePos:{x,z}, workPos:{x,z},
        ambient:true, walkPhase:this.rng()*TAU, speed:.55 + this.rng()*.5, mode:'idle', facing:this.rng()*TAU,
        wanderTimer:this.rng()*5, visible:true
      };
      model.group.position.set(x, 0, z);
      this.scene.add(model.group);
      this.ambient.push(npc); this.byId.set(npc.id, npc);
    }
  }

  targetFor(npc) {
    const h = (this.state.time.minutes || 480) / 60;
    if (npc.ambient) return { x:npc.homePos.x + Math.sin(this.clock * .2 + npc.walkPhase) * 8, z:npc.homePos.z + Math.cos(this.clock * .17 + npc.walkPhase) * 8 };
    const sched = npc.schedule || [];
    let target = 'work';
    for (const s of sched) if (h >= s.h) target = s.at;
    if (target === 'home') return npc.homePos;
    if (target === 'work') return npc.workPos;
    if (SCHEDULE_TARGETS[target]) return SCHEDULE_TARGETS[target];
    return npc.workPos;
  }

  updateSchedule(force = false) {
    const tick = Math.floor((this.state.time.minutes || 0) / 5);
    if (!force && tick === this.lastScheduleTick) return;
    this.lastScheduleTick = tick;
    for (const npc of this.npcs) {
      const t = this.targetFor(npc);
      npc.targetX = t.x; npc.targetZ = t.z;
    }
  }

  nearest(x, z, maxDist = 3.8) {
    let best = null, bd = maxDist;
    for (const npc of [...this.npcs, ...this.ambient]) {
      if (this.frozen.has(npc.id)) continue;
      const d = Math.hypot(npc.x - x, npc.z - z);
      if (d < bd) { bd = d; best = npc; }
    }
    return best;
  }

  byIdOrNull(id) { return this.byId.get(id) || null; }

  setFrozen(npcOrId, on = true) {
    const npc = typeof npcOrId === 'string' ? this.byId.get(npcOrId) : npcOrId;
    if (!npc) return;
    if (on) this.frozen.add(npc.id); else this.frozen.delete(npc.id);
    npc.frozen = on;
  }

  startFollow(npc, duration = 45) {
    if (!npc) return;
    npc.followUntil = this.clock + duration;
    this.followers.push(npc);
  }

  allActive() { return [...this.npcs, ...this.ambient]; }

  update(dt, playerPos, elapsed) {
    this.clock = elapsed;
    this.updateSchedule();
    const p = playerPos;
    for (const npc of [...this.npcs, ...this.ambient]) {
      if (this.frozen.has(npc.id)) {
        this.animateIdle(npc, dt, true);
        continue;
      }
      let tx = npc.targetX, tz = npc.targetZ;
      if (npc.followUntil && npc.followUntil > this.clock) {
        tx = p.x - 2.2; tz = p.z + 2.2;
      }
      if (npc.ambient) {
        npc.wanderTimer -= dt;
        if (npc.wanderTimer <= 0) {
          npc.wanderTimer = 5 + this.rng() * 9;
          npc.targetX = npc.homePos.x + (this.rng() - .5) * 28;
          npc.targetZ = npc.homePos.z + (this.rng() - .5) * 28;
        }
        tx = npc.targetX; tz = npc.targetZ;
      }
      const dx = tx - npc.x, dz = tz - npc.z;
      const dist = Math.hypot(dx, dz);
      const playerDist = Math.hypot(p.x - npc.x, p.z - npc.z);
      // if far from player and far from schedule, snap to target to keep the city populated
      if (!npc.ambient && dist > 70 && playerDist > 110) {
        npc.x = tx + (this.rng() - .5) * 3; npc.z = tz + (this.rng() - .5) * 3;
        npc.group.position.set(npc.x, 0, npc.z);
      } else if (dist > 1.4) {
        const speed = npc.speed * (npc.followUntil && npc.followUntil > this.clock ? 1.8 : 1);
        const nx = dx / dist, nz = dz / dist;
        const nextX = npc.x + nx * speed * dt, nextZ = npc.z + nz * speed * dt;
        if (!this.world.isBlocked(nextX, nextZ, .3) || playerDist > 40) { npc.x = nextX; npc.z = nextZ; }
        else { npc.targetX += (this.rng() - .5) * 8; npc.targetZ += (this.rng() - .5) * 8; }
        npc.facing = Math.atan2(nx, nz);
        npc.mode = 'walk';
      } else {
        npc.mode = 'idle';
        npc.facing = Math.atan2(p.x - npc.x, p.z - npc.z);
      }
      npc.group.position.set(npc.x, 0, npc.z);
      npc.group.rotation.y = npc.facing;
      this.animateWalk(npc, dt, npc.mode === 'walk');
      const d = Math.hypot(p.x - npc.x, p.z - npc.z);
      npc.model.label.visible = d < 22 && !npc.ambient;
      npc.model.label.material.opacity = clamp(1 - (d - 12) / 10, 0, .95);
      // intoxication at night near bars
      if (!npc.ambient && (this.state.time.minutes > 20 * 60 || this.state.time.minutes < 3 * 60) && npc.id === 'theo') {
        npc.group.rotation.z = Math.sin(elapsed * 1.2) * .02;
      }
    }
    this.followers = this.followers.filter(f => f.followUntil && f.followUntil > this.clock);
  }

  animateWalk(npc, dt, moving) {
    const m = npc.model;
    if (moving) {
      npc.walkPhase += dt * 7;
      const s = Math.sin(npc.walkPhase);
      m.leftLeg.rotation.x = s * .55;
      m.rightLeg.rotation.x = -s * .55;
      m.leftArm.rotation.x = -s * .4;
      m.rightArm.rotation.x = s * .4;
      m.group.position.y = Math.abs(Math.sin(npc.walkPhase)) * .035;
    } else this.animateIdle(npc, dt, false);
  }

  animateIdle(npc, dt, frozen = false) {
    const m = npc.model;
    npc.walkPhase += dt * (frozen ? .2 : 1);
    const s = Math.sin(npc.walkPhase) * (frozen ? .01 : .025);
    m.leftLeg.rotation.x *= .9; m.rightLeg.rotation.x *= .9;
    m.leftArm.rotation.x = s; m.rightArm.rotation.x = -s;
    m.head.rotation.y = frozen ? 0 : Math.sin(npc.walkPhase * .4) * .16;
    m.group.position.y = 0;
  }

  playHit(npc) {
    const m = npc.model;
    npc.hitFlash = .22;
    m.torso.material.emissive = new THREE.Color(0xff2222);
    m.torso.material.emissiveIntensity = .5;
    setTimeout(() => { if (m.torso.material) { m.torso.material.emissive = new THREE.Color(0x000000); m.torso.material.emissiveIntensity = 0; } }, 160);
  }

  faceEachOther(a, b) {
    a.facing = Math.atan2(b.x - a.x, b.z - a.z);
    a.group.rotation.y = a.facing;
  }

  setWeirdness(v) {
    for (const npc of this.npcs) {
      if (v > .5 && npc.id === 'raincoat') npc.group.visible = this.world.weather === 'storm' || v > .75;
    }
  }

  hideAmbient(on) {
    for (const npc of this.ambient) npc.group.visible = !on;
  }

  repeatDialogue() {
    const npc = this.ambient[Math.floor(this.rng() * this.ambient.length)];
    if (!npc) return null;
    npc.repeatUntil = this.clock + 8;
    return npc;
  }
}
