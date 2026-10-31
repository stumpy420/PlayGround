import * as THREE from 'three';
import { MATS, Batch, makeTable, makeCrate, makeBarrel, makeBrazier, makeFireplace, addBanner, makeChest } from './buildings.js';

function ctxFor(name) {
  const group = new THREE.Group();
  group.visible = false;
  const ctx = {
    name, group, batch: new Batch(), colliders: [], interactables: [], animated: [], chests: [], lights: [],
    addCollider(x, z, hx, hz, ry = 0, circle = false) { ctx.colliders.push({ x, z, hx, hz, ry, circle }); },
    addInteractable(o) { ctx.interactables.push(o); },
    addChest(x, z, items, id, y = 0.0) {
      const chest = makeChest({ group: ctx.group, terrain: { heightAt: () => y } }, x, z, y);
      chest.items = items; chest.id = id;
      ctx.chests.push(chest);
      ctx.addInteractable({ id: 'chest_' + id, x, z, y: y + 0.8, radius: 2.4, label: 'Open chest', icon: 'chest', chest, action: (g) => g.openChest(chest) });
      return chest;
    },
    finish() {
      ctx.batch.build(ctx.group);
      return ctx;
    },
  };
  return ctx;
}

// Floors, walls, ceilings ----------------------------------------------------
function floor(ctx, x, z, w, d, mat = 'stoneDark', y = 0) {
  ctx.batch.box(mat, [x, y - 0.15, z], [w, 0.3, d]);
}
function ceiling(ctx, x, z, w, d, y, mat = 'stoneDark') {
  ctx.batch.box(mat, [x, y, z], [w, 0.4, d]);
}
function wall(ctx, x, z, w, d, h, mat = 'stoneDark', y = 0) {
  ctx.batch.box(mat, [x, y + h / 2, z], [w, h, d]);
  ctx.addCollider(x, z, w / 2, d / 2);
}
function room(ctx, o) {
  const { x, z, w, d, h = 5.5, mat = 'stoneDark', floorMat = 'stone', ceil = true, doors = {}, y = 0 } = o;
  floor(ctx, x, z, w, d, floorMat, y);
  if (ceil) ceiling(ctx, x, z, w, d, y + h, mat);
  const t = 0.55;
  const sides = {
    n: { axis: 'x', pos: [x, z - d / 2], len: w },
    s: { axis: 'x', pos: [x, z + d / 2], len: w },
    w: { axis: 'z', pos: [x - w / 2, z], len: d },
    e: { axis: 'z', pos: [x + w / 2, z], len: d },
  };
  for (const key in sides) {
    const s = sides[key];
    const door = doors[key];
    if (!door) {
      if (s.axis === 'x') wall(ctx, s.pos[0], s.pos[1], s.len, t, h, mat, y);
      else wall(ctx, s.pos[0], s.pos[1], t, s.len, h, mat, y);
    } else {
      const dw = door.width || 4, off = door.offset || 0;
      const half = s.len / 2;
      const segs = [[-half, off - dw / 2], [off + dw / 2, half]];
      for (const [a, b] of segs) {
        if (b - a < 0.1) continue;
        const mid = (a + b) / 2, len = b - a;
        if (s.axis === 'x') wall(ctx, s.pos[0] + mid, s.pos[1], len, t, h, mat, y);
        else wall(ctx, s.pos[0], s.pos[1] + mid, t, len, h, mat, y);
      }
      // lintel
      if (s.axis === 'x') ctx.batch.box(mat, [s.pos[0] + off, y + h - 1.2, s.pos[1]], [dw, 2.4, t], [0, 0, 0]);
      else ctx.batch.box(mat, [s.pos[0], y + h - 1.2, s.pos[1] + off], [t, 2.4, dw], [0, 0, 0]);
    }
  }
}
function corridor(ctx, x1, z1, x2, z2, width = 4.5, h = 4.5, mat = 'stoneDark') {
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ry = Math.atan2(x2 - x1, z2 - z1);
  floor(ctx, cx, cz, width, len, 'stone', 0);
  ceiling(ctx, cx, cz, width, len, h, mat);
  const c = Math.cos(ry), s = Math.sin(ry);
  for (const side of [-1, 1]) {
    const px = cx + c * side * width / 2, pz = cz - s * side * width / 2;
    wall(ctx, px, pz, 0.55, len, h, mat);
  }
}
function torch(ctx, x, y, z, color = 0xffa35c) {
  ctx.batch.cyl('woodDark', [x, y + 0.4, z], 0.08, 0.1, 0.8, 5);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  flame.position.set(x, y + 1.0, z);
  ctx.group.add(flame);
  const light = new THREE.PointLight(color, 9, 15, 2);
  light.position.set(x, y + 1.2, z);
  ctx.group.add(light);
  ctx.lights.push(light);
  ctx.animated.push({ type: 'flame', obj: flame, light, baseY: y + 1.0 });
}
function propTable(ctx, x, z, y = 0, ry = 0) { makeTable(ctx, x, y, z, ry); }
function barrel(ctx, x, z, y = 0) { makeBarrel(ctx, x, y, z); }
function crate(ctx, x, z, y = 0, s = 0.7) { makeCrate(ctx, x, y, z, s); }
function exitDoor(ctx, x, z, y = 0, label = 'Leave') {
  ctx.batch.box('woodDark', [x, y + 1.6, z], [2.2, 3.2, 0.25]);
  ctx.batch.box('gold', [x, y + 1.5, z + 0.15], [0.14, 0.14, 0.1]);
  ctx.addInteractable({ id: 'exit_door', x, z, y: y + 1.3, radius: 3, label, icon: 'door', action: (g) => g.world.exitInterior(g) });
}

// ---------------------------------------------------------------------------
const BUILDERS = {
  tavern() {
    const ctx = ctxFor('The Leaky Whisker');
    const h = 7;
    room(ctx, { x: 0, z: 0, w: 24, d: 18, h, mat: 'woodDark', floorMat: 'wood', doors: { s: { width: 4 } } });
    // ceiling beams
    for (let i = -2; i <= 2; i++) ctx.batch.box('woodDark', [0, h - 0.35, i * 4], [24, 0.45, 0.45]);
    ctx.batch.box('woodDark', [0, h - 0.7, 0], [0.5, 0.5, 18]);
    // bar
    ctx.batch.box('woodLight', [-7, 1.1, -4], [12, 1.2, 2.0]);
    ctx.batch.box('woodDark', [-7, 0.55, -4], [12.4, 0.2, 2.4]);
    for (let i = -5; i <= 5; i += 2) barrel(ctx, -7 + i, -5.4, 0);
    // shelves + bottles
    for (let i = 0; i < 5; i++) {
      ctx.batch.box('woodDark', [-7, 3.2 + (i % 2) * 0.7, -8.4], [11, 0.14, 0.6]);
      for (let j = 0; j < 8; j++) ctx.batch.cyl(j % 2 ? 'clothTeal' : 'gold', [-12 + j * 1.4, 3.4 + (i % 2) * 0.7, -8.4], 0.08, 0.1, 0.3, 5);
    }
    makeFireplace(ctx, 8, 0, -8.2, 0);
    propTable(ctx, 4, 2); propTable(ctx, 9, 3, 0, 0.4); propTable(ctx, -1, 5, 0, -0.3);
    for (let i = 0; i < 5; i++) crate(ctx, 10.2, -5 + i * 1.6, 0, 0.6);
    // hearth rug
    ctx.batch.box('clothRed', [0, 0.03, 1.5], [8, 0.06, 6]);
    // chandelier
    ctx.batch.cyl('iron', [0, h - 1.6, 0], 0.06, 0.06, 2.2, 5);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      ctx.batch.sphere('gold', [Math.cos(a) * 1.2, h - 2.7, Math.sin(a) * 1.2], 0.12, 5);
    }
    const chand = new THREE.PointLight(0xffc57a, 14, 20, 2); chand.position.set(0, h - 2.6, 0); ctx.group.add(chand); ctx.lights.push(chand);
    torch(ctx, -11, 3, 0); torch(ctx, 11, 3, 1);
    // stage corner
    ctx.batch.box('woodLight', [-9, 0.35, 5.4], [5, 0.7, 4]);
    barrel(ctx, -11, 3.5, 0);
    exitDoor(ctx, 0, 8.6, 0, 'Leave the Leaky Whisker');
    return ctx.finish();
  },

  shop() {
    const ctx = ctxFor('Nine Lives Goods');
    const h = 6;
    room(ctx, { x: 0, z: 0, w: 18, d: 14, h, mat: 'woodDark', floorMat: 'wood', doors: { s: { width: 4 } } });
    // counter
    ctx.batch.box('woodLight', [0, 1.1, -2.5], [10, 1.2, 1.8]);
    ctx.batch.box('gold', [0, 1.74, -2.5], [10.2, 0.08, 1.9]);
    for (let i = 0; i < 6; i++) ctx.batch.box('woodDark', [-4.5 + i * 1.8, 0.5, -3.4], [1.4, 0.9, 0.3]);
    // shelves along walls
    for (let side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.batch.box('woodDark', [side * 8.4, 1.6 + i * 1.3, 0], [0.5, 0.15, 11]);
        for (let j = 0; j < 6; j++) {
          const mats = ['clothRed', 'clothTeal', 'gold', 'iron', 'clothBlue'];
          ctx.batch.box(mats[(i + j) % 5], [side * 8.2, 1.8 + i * 1.3, -4.5 + j * 1.7], [0.5, 0.5, 0.7]);
        }
      }
    }
    // hanging lanterns
    for (const [lx, lz] of [[-5, 3], [5, 3]]) {
      ctx.batch.cyl('iron', [lx, h - 1.2, lz], 0.05, 0.05, 1.8, 5);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 5), new THREE.MeshBasicMaterial({ color: 0xffd08a }));
      bulb.position.set(lx, h - 2.1, lz); ctx.group.add(bulb);
      const l = new THREE.PointLight(0xffc37a, 8, 14, 2); l.position.copy(bulb.position); ctx.group.add(l); ctx.lights.push(l);
    }
    crate(ctx, 7, -5, 0, 0.8); crate(ctx, 7.8, -4.2, 0, 0.6); barrel(ctx, -7, 5, 0);
    exitDoor(ctx, 0, 6.6, 0, 'Leave the shop');
    return ctx.finish();
  },

  castlehall() {
    const ctx = ctxFor('Highpaw Hall');
    const h = 12;
    room(ctx, { x: 0, z: 0, w: 30, d: 24, h, mat: 'stoneDark', floorMat: 'stone', doors: { s: { width: 5 } } });
    // columns
    for (const x of [-11, 11]) for (const z of [-8, 0, 8]) {
      ctx.batch.cyl('stone', [x, h / 2, z], 1.0, 1.3, h, 10);
      ctx.batch.box('stoneLight', [x, 0.4, z], [3.2, 0.8, 3.2]);
      ctx.addCollider(x, z, 1.3, 1.3);
    }
    // dais + throne
    ctx.batch.box('stone', [0, 0.5, -9], [12, 1.0, 6]);
    ctx.batch.box('stoneLight', [0, 1.1, -9], [10, 0.2, 4.6]);
    ctx.batch.box('gold', [0, 2.2, -10.2], [3.4, 2.4, 0.6]);
    ctx.batch.box('clothTeal', [0, 2.6, -9.9], [2.6, 2.8, 0.3]);
    ctx.batch.sphere('gold', [0, 4.1, -9.9], 0.55, 8, [1, 0.8, 0.4]);
    for (const s of [-1, 1]) {
      ctx.batch.cone('gold', [s * 1.4, 4.2, -10], 0.3, 1.2, 4, [0, 0, -s * 0.3]);
      addBanner(ctx, s * 6.5, 7.5, -11.6, 3, 7, 'clothTeal');
    }
    makeFireplace(ctx, -12, 0, 10.8, 0);
    makeFireplace(ctx, 12, 0, 10.8, 0);
    // long tables
    propTable(ctx, -5, 4, 0, 0); propTable(ctx, 5, 4, 0, 0);
    ctx.batch.box('clothRed', [0, 0.04, 1], [16, 0.05, 8]);
    // guards' racks
    ctx.batch.box('woodDark', [13.5, 1.4, -2], [0.3, 2.8, 6]);
    for (let i = 0; i < 4; i++) ctx.batch.box('iron', [13.3, 1.9, -4.4 + i * 1.6], [0.08, 2.6, 0.3], [0.2, 0, 0]);
    exitDoor(ctx, 0, 11.6, 0, 'Leave Highpaw Hall');
    return ctx.finish();
  },

  cottage() {
    const ctx = ctxFor('Crooked Cottage');
    const h = 5;
    room(ctx, { x: 0, z: 0, w: 14, d: 12, h, mat: 'woodDark', floorMat: 'wood', doors: { s: { width: 3.5 } } });
    makeFireplace(ctx, -5, 0, -5.4, 0);
    ctx.batch.box('clothBlue', [2, 0.55, -3], [3.2, 0.5, 4.4]); // bed
    ctx.batch.box('clothCream', [2, 0.85, -4.4], [2.6, 0.35, 1.2]);
    propTable(ctx, 4.5, 2.5, 0, 0.3);
    ctx.batch.box('woodDark', [4.5, 1.5, 2.5], [0.12, 0.6, 0.12]);
    ctx.batch.cyl('woodDark', [-2, 1.2, -5.6], 0.7, 0.7, 0.12, 8, [Math.PI / 2, 0, 0]);
    crate(ctx, 5.5, -4.5, 0, 0.8); barrel(ctx, -5.5, 3.8, 0);
    ctx.batch.box('clothRed', [0, 0.03, 2], [6, 0.05, 4]);
    torch(ctx, -6.4, 2.4, 2);
    exitDoor(ctx, 0, 5.6, 0, 'Leave the cottage');
    return ctx.finish();
  },

  pawbarrow() {
    const ctx = ctxFor('Sunken Pawbarrow');
    room(ctx, { x: 0, z: 8, w: 18, d: 14, h: 6, doors: { n: { width: 5 }, s: { width: 3 } } });
    // entry stairs / exit
    exitDoor(ctx, 0, 14.4, 0, 'Climb back to the surface');
    corridor(ctx, 0, 1, 0, -4, 5, 5);
    room(ctx, { x: 0, z: -16, w: 24, d: 20, h: 7, doors: { s: { width: 5 }, n: { width: 5 }, w: { width: 4 }, e: { width: 4 } } });
    // central hall pillars
    for (const x of [-7, 7]) for (const z of [-21, -11]) {
      ctx.batch.cyl('stone', [x, 3.5, z], 1.0, 1.3, 7, 8);
      ctx.batch.box('stoneLight', [x, 0.4, z], [3, 0.8, 3]);
      ctx.addCollider(x, z, 1.3, 1.3);
    }
    // west secret room
    corridor(ctx, -12, -16, -18, -16, 4, 4.5);
    room(ctx, { x: -26, z: -16, w: 12, d: 12, h: 5, doors: { e: { width: 4 } } });
    ctx.addChest(-28, -18, ['locket', 'healthPotion', 'gold'], 'pawbarrow_secret');
    // east room
    corridor(ctx, 12, -16, 18, -16, 4, 4.5);
    room(ctx, { x: 26, z: -16, w: 12, d: 12, h: 5, doors: { w: { width: 4 } } });
    ctx.addChest(28, -18, ['dreamHerb', 'manaPotion'], 'pawbarrow_east');
    // north relic hall
    corridor(ctx, 0, -26, 0, -32, 5, 5);
    room(ctx, { x: 0, z: -46, w: 24, d: 20, h: 9, doors: { s: { width: 5 } } });
    // relic pedestal
    ctx.batch.box('stone', [0, 0.6, -50], [4, 1.2, 4]);
    ctx.batch.box('stoneLight', [0, 1.3, -50], [3, 0.2, 3]);
    const relic = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshBasicMaterial({ color: 0xffb15c }));
    relic.position.set(0, 2.4, -50); ctx.group.add(relic);
    const rl = new THREE.PointLight(0xff9a4a, 16, 24, 2); rl.position.set(0, 2.8, -50); ctx.group.add(rl); ctx.lights.push(rl);
    ctx.animated.push({ type: 'relic', obj: relic, light: rl, baseY: 2.4 });
    ctx.addInteractable({ id: 'relic_ember', x: 0, z: -50, y: 2.4, radius: 3.4, label: 'Take the First Ember', icon: 'relic', action: (g) => g.takeRelic('emberRelic', 'The First Ember', relic, rl) });
    // bones, rubble
    for (let i = 0; i < 12; i++) {
      const x = -10 + (i * 7 % 20), z = -40 + (i * 5 % 12);
      ctx.batch.box('bone', [x, 0.1, z], [0.5, 0.15, 0.15], [0, i, 0]);
    }
    torch(ctx, -10, 3, -8); torch(ctx, 10, 3, -8); torch(ctx, -10, 3, -24); torch(ctx, 10, 3, -24);
    torch(ctx, 0, 4, -38); torch(ctx, -9, 3, -50); torch(ctx, 9, 3, -50);
    ctx.batch.box('clothTeal', [0, 0.04, -46], [16, 0.05, 12]);
    return ctx.finish();
  },

  cinderdeep() {
    const ctx = ctxFor('Cinderdeep Mine');
    room(ctx, { x: 0, z: 10, w: 16, d: 14, h: 5.5, mat: 'stoneDark', floorMat: 'dirt', doors: { n: { width: 5 }, s: { width: 3 } } });
    exitDoor(ctx, 0, 16.4, 0, 'Climb back to the surface');
    corridor(ctx, 0, 3, 0, -2, 5, 5, 'woodDark');
    // main cavern
    room(ctx, { x: 0, z: -16, w: 28, d: 22, h: 8, mat: 'stoneDark', floorMat: 'dirt', doors: { s: { width: 5 }, e: { width: 4 }, n: { width: 5 } } });
    // wooden supports
    for (const x of [-9, 9]) for (const z of [-24, -8]) {
      ctx.batch.box('woodDark', [x, 3.5, z], [0.5, 7, 0.5]);
      ctx.batch.box('woodDark', [x, 6.8, z], [0.4, 0.4, 8], [0.5, 0, 0]);
      ctx.addCollider(x, z, 0.4, 0.4);
    }
    // lava pool
    ctx.batch.box('lava', [4, 0.05, -12], [7, 0.12, 5]);
    const lavaLight = new THREE.PointLight(0xff5a1e, 14, 22, 2); lavaLight.position.set(4, 1.2, -12); ctx.group.add(lavaLight); ctx.lights.push(lavaLight);
    // crystals
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      const x = Math.cos(a) * 12, z = -16 + Math.sin(a) * 9;
      ctx.batch.cone('crystal', [x, 0.8, z], 0.35, 1.8, 5, [0.2, a, 0.3]);
    }
    // east side tunnel + room
    corridor(ctx, 14, -16, 21, -16, 4, 4.5, 'woodDark');
    room(ctx, { x: 28, z: -16, w: 14, d: 14, h: 5, mat: 'stoneDark', floorMat: 'dirt', doors: { w: { width: 4 } } });
    ctx.addChest(30, -19, ['frostAxe', 'healthPotion', 'gold'], 'cinder_side');
    // north boss arena
    corridor(ctx, 0, -27, 0, -34, 6, 5, 'woodDark');
    room(ctx, { x: 0, z: -50, w: 30, d: 24, h: 12, mat: 'stoneDark', floorMat: 'dirt', doors: { s: { width: 6 } } });
    // pillars
    for (const x of [-10, 10]) for (const z of [-58, -44]) {
      ctx.batch.cyl('stoneDark', [x, 5, z], 1.4, 1.8, 10, 8);
      ctx.addCollider(x, z, 1.8, 1.8);
    }
    // bell pedestal
    ctx.batch.box('stone', [0, 0.7, -58], [4.4, 1.4, 4.4]);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xd8e6ef, metalness: 0.9, roughness: 0.2, emissive: 0x2a4a5a, emissiveIntensity: 0.6 }));
    bell.position.set(0, 2.0, -58); ctx.group.add(bell);
    const bl = new THREE.PointLight(0xa8e2ff, 14, 24, 2); bl.position.set(0, 2.4, -58); ctx.group.add(bl); ctx.lights.push(bl);
    ctx.animated.push({ type: 'relic', obj: bell, light: bl, baseY: 2.0 });
    ctx.addInteractable({ id: 'relic_bell', x: 0, z: -58, y: 2.0, radius: 3.4, label: 'Take the Silver Bell', icon: 'bell', action: (g) => g.takeRelic('silverBell', 'The Silver Bell', bell, bl) });
    torch(ctx, -13, 4, -50); torch(ctx, 13, 4, -50); torch(ctx, 0, 5, -60);
    return ctx.finish();
  },

  frostfang() {
    const ctx = ctxFor('Frostfang Barrow');
    room(ctx, { x: 0, z: 10, w: 18, d: 16, h: 7, mat: 'stoneDark', floorMat: 'ice', doors: { n: { width: 5 }, s: { width: 3 } } });
    exitDoor(ctx, 0, 18.4, 0, 'Retreat from Frostfang');
    corridor(ctx, 0, 2, 0, -4, 5, 6, 'stoneDark');
    room(ctx, { x: 0, z: -18, w: 26, d: 24, h: 10, mat: 'stoneDark', floorMat: 'ice', doors: { s: { width: 5 }, n: { width: 6 } } });
    // ice pillars
    for (const x of [-8, 8]) for (const z of [-26, -10]) {
      ctx.batch.cyl('iceDeep', [x, 5, z], 0.8, 1.6, 10, 7);
      ctx.batch.cone('ice', [x, 10.6, z], 1.1, 2.2, 6);
      ctx.addCollider(x, z, 1.5, 1.5);
    }
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      ctx.batch.cone('crystal', [Math.cos(a) * 11, 0.7, -18 + Math.sin(a) * 9], 0.35, 2.4, 5, [0.1, a, 0.2]);
    }
    corridor(ctx, 0, -30, 0, -36, 6, 7, 'stoneDark');
    // final arena
    room(ctx, { x: 0, z: -54, w: 34, d: 30, h: 15, mat: 'stoneDark', floorMat: 'ice', doors: { s: { width: 6 } } });
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      ctx.batch.cone('crystal', [Math.cos(a) * 14, 1.2, -54 + Math.sin(a) * 12], 0.5, 3.5, 5, [0.1, a, 0.2]);
    }
    // throne of the Empty Bowl
    ctx.batch.box('stone', [0, 0.8, -67], [10, 1.6, 5]);
    ctx.batch.box('iceDeep', [0, 2.4, -68], [6, 3, 1.2]);
    const voidOrb = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 8), new THREE.MeshBasicMaterial({ color: 0x2b0f3a }));
    voidOrb.position.set(0, 5, -67); ctx.group.add(voidOrb);
    const vl = new THREE.PointLight(0x9b4dff, 20, 30, 2); vl.position.set(0, 5.5, -67); ctx.group.add(vl); ctx.lights.push(vl);
    ctx.animated.push({ type: 'void', obj: voidOrb, light: vl });
    torch(ctx, -12, 4, -18); torch(ctx, 12, 4, -18); torch(ctx, -13, 5, -54); torch(ctx, 13, 5, -54);
    return ctx.finish();
  },

  whispercave() {
    const ctx = ctxFor('Whispering Cave');
    room(ctx, { x: 0, z: 6, w: 18, d: 14, h: 5, mat: 'stoneDark', floorMat: 'dirt', doors: { n: { width: 4 }, s: { width: 3 } } });
    exitDoor(ctx, 0, 12.4, 0, 'Leave the cave');
    corridor(ctx, 0, -1, 0, -6, 4, 4, 'stoneDark');
    room(ctx, { x: 0, z: -18, w: 20, d: 18, h: 6, mat: 'stoneDark', floorMat: 'dirt', doors: { s: { width: 4 } } });
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2;
      ctx.batch.cone('crystal', [Math.cos(a) * 7, 0.6, -18 + Math.sin(a) * 6], 0.3, 1.5, 5, [0.2, a, 0.2]);
    }
    ctx.addChest(-4, -21, ['dreamHerb', 'healthPotion', 'gold'], 'whisper_herb');
    ctx.batch.box('stone', [5, 0.5, -20], [2, 1, 2]);
    const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.8 }));
    wisp.position.set(5, 2, -20); ctx.group.add(wisp);
    const wl = new THREE.PointLight(0x7fd7e8, 8, 14, 2); wl.position.set(5, 2.2, -20); ctx.group.add(wl); ctx.lights.push(wl);
    ctx.animated.push({ type: 'wisp', obj: wisp, light: wl });
    torch(ctx, -7, 2.5, 2); torch(ctx, 7, 2.5, -12);
    return ctx.finish();
  },

  secrets() {
    const ctx = ctxFor('The Hollow Hollow');
    room(ctx, { x: 0, z: 0, w: 16, d: 14, h: 4.5, mat: 'stoneDark', floorMat: 'dirt', doors: { s: { width: 3 } } });
    exitDoor(ctx, 0, 6.4, 0, 'Leave the hidden cave');
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      ctx.batch.cone('crystal', [Math.cos(a) * 6, 0.5, Math.sin(a) * 5], 0.22, 1.1, 5, [0.2, a, 0.3]);
    }
    ctx.addChest(0, -3, ['moonBow', 'wardenArmor', 'healthPotion', 'gold'], 'secret_chest');
    ctx.batch.box('stone', [0, 0.3, -5], [5, 0.6, 1.2]);
    ctx.batch.box('bone', [0, 0.8, -5], [0.5, 0.4, 0.5]);
    const gl = new THREE.PointLight(0x9fe8ff, 8, 18, 2); gl.position.set(0, 2.5, 0); ctx.group.add(gl); ctx.lights.push(gl);
    return ctx.finish();
  },
};

export function buildInterior(id) {
  const fn = BUILDERS[id];
  if (!fn) throw new Error('Unknown interior ' + id);
  return fn();
}

export function interiorSpawn(id) {
  if (id === 'tavern') return { x: 0, z: 7.2, yaw: Math.PI };
  if (id === 'shop') return { x: 0, z: 5.6, yaw: Math.PI };
  if (id === 'castlehall') return { x: 0, z: 10.2, yaw: Math.PI };
  if (id === 'cottage') return { x: 0, z: 4.6, yaw: Math.PI };
  if (id === 'pawbarrow') return { x: 0, z: 12.5, yaw: Math.PI };
  if (id === 'cinderdeep') return { x: 0, z: 14.5, yaw: Math.PI };
  if (id === 'frostfang') return { x: 0, z: 16.5, yaw: Math.PI };
  if (id === 'whispercave') return { x: 0, z: 10.5, yaw: Math.PI };
  if (id === 'secrets') return { x: 0, z: 4.5, yaw: Math.PI };
  return { x: 0, z: 5, yaw: Math.PI };
}
