import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Terrain, makeSky, makeStars, makeClouds, WATER_LEVEL, riverX } from './terrain.js';
import {
  Batch, MATS, makeHouse, makeLonghouse, makeTower, makeWallSegment, makeGatehouse,
  makeMarketStall, makeWell, makeDock, makeBoat, makeFence, makeBarn, makeWindmill,
  makeShrine, makeRuin, makeMineEntrance, makeCaveMouth, makeFrostDoor, makeBanditCamp,
  makeSignpost, makeStatue, makeBridge, makeChest, makeLamp, makeBrazier, makeCrate, makeBarrel,
  makeGlowTexture, addBanner, makeFireplace,
} from './buildings.js';
import { buildInterior, interiorSpawn } from './interiors.js';
import { LANDMARKS } from '../core/data.js';
import { clamp, smoothstep, makeRng } from '../core/noise.js';

const paint = (geo, hex) => {
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
};

function pineGeometry() {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.22, 0.36, 3.2, 5); trunk.translate(0, 1.6, 0); paint(trunk, '#4a3524'); parts.push(trunk);
  const layers = [
    { y: 2.4, r: 2.6, h: 3.2, col: '#294238' },
    { y: 4.5, r: 2.1, h: 2.9, col: '#2d4a3d' },
    { y: 6.4, r: 1.55, h: 2.6, col: '#315144' },
    { y: 8.1, r: 1.0, h: 2.2, col: '#365a4b' },
  ];
  for (const l of layers) {
    const cone = new THREE.ConeGeometry(l.r, l.h, 7); cone.translate(0, l.y, 0); paint(cone, l.col); parts.push(cone);
    const snow = new THREE.ConeGeometry(l.r * 0.82, l.h * 0.48, 7); snow.translate(0, l.y + l.h * 0.22, 0); paint(snow, '#e6edf1'); parts.push(snow);
  }
  return mergeGeometries(parts, false);
}
function bareGeometry() {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.18, 0.34, 5.2, 5); trunk.translate(0, 2.6, 0); paint(trunk, '#4b3a2b'); parts.push(trunk);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.CylinderGeometry(0.05, 0.13, 2.6, 4);
    b.translate(0, 1.3, 0);
    b.rotateZ(0.7 + (i % 3) * 0.22); b.rotateY(i * 1.25);
    b.translate(0, 2.8 + (i % 3) * 0.6, 0);
    paint(b, '#4b3a2b'); parts.push(b);
  }
  return mergeGeometries(parts, false);
}
function rockGeometry() {
  const parts = [];
  const r = new THREE.DodecahedronGeometry(1.5, 0); r.scale(1.3, 0.8, 1.1); r.translate(0, 0.7, 0); paint(r, '#6a7077'); parts.push(r);
  const cap = new THREE.DodecahedronGeometry(1.1, 0); cap.scale(1.25, 0.3, 1.1); cap.translate(0, 1.35, 0); paint(cap, '#e2eaef'); parts.push(cap);
  return mergeGeometries(parts, false);
}
function bushGeometry() {
  const parts = [];
  const b = new THREE.IcosahedronGeometry(0.9, 0); b.scale(1.4, 0.8, 1.2); b.translate(0, 0.5, 0); paint(b, '#4f5c45'); parts.push(b);
  const s = new THREE.IcosahedronGeometry(0.75, 0); s.scale(1.3, 0.35, 1.1); s.translate(0, 0.95, 0); paint(s, '#dfe8ed'); parts.push(s);
  return mergeGeometries(parts, false);
}
function grassGeometry() {
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.ConeGeometry(0.1, 0.9, 3);
    g.rotateZ(0.2 + i * 0.2); g.rotateY(i * 2.1); g.translate((i - 1) * 0.2, 0.45, 0);
    paint(g, '#9d9a72'); parts.push(g);
  }
  return mergeGeometries(parts, false);
}

export class World {
  constructor(scene, seed = 91731) {
    this.scene = scene;
    this.seed = seed;
    this.rng = makeRng(seed + 44);
    this.terrain = new Terrain(seed);
    this.group = new THREE.Group();
    this.group.name = 'outdoor';
    scene.add(this.group);
    this.colliders = [];
    this.interactables = [];
    this.chests = [];
    this.animated = [];
    this.batch = new Batch();
    this.interiors = new Map();
    this.activeInterior = null;
    this.activeInteriorId = null;
    this.returnPosition = null;
    this.lastArea = null;
    this.roadPoints = [];
    this.build();
  }

  // -------------------------------------------------------------------------
  addCollider(x, z, hx, hz, ry = 0, circle = false) {
    this.colliders.push({ x, z, hx, hz, ry, circle });
  }
  addInteractable(o) {
    if (o.y === undefined) o.y = this.terrain.heightAt(o.x, o.z) + 1;
    o.radius = o.radius || 3;
    this.interactables.push(o);
    return o;
  }
  addChest(x, z, items, id, y = null) {
    const chest = makeChest(this, x, z, y);
    chest.items = items; chest.id = id;
    this.chests.push(chest);
    this.addInteractable({ id: 'chest_' + id, x, z, y: chest.y + 0.8, radius: 2.6, label: 'Open chest', icon: 'chest', chest, action: (g) => g.openChest(chest) });
    return chest;
  }
  addGlow(x, y, z, color = 0xffc477, scale = 2) {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.set(x, y, z); glow.scale.set(scale, scale, 1);
    this.group.add(glow);
  }

  // -------------------------------------------------------------------------
  build() {
    const t = this.terrain;
    this.terrainMesh = t.buildMesh(); this.group.add(this.terrainMesh);
    this.water = t.buildWater(); this.group.add(this.water);
    this.roads = t.buildRoads(); this.group.add(this.roads);
    this.roadPoints = t.roadPoints || [];

    const sky = makeSky(); this.sky = sky.mesh; this.skyUniforms = sky.uniforms; this.group.add(this.sky);
    this.stars = makeStars(this.rng); this.group.add(this.stars);
    this.clouds = makeClouds(this.rng); this.group.add(this.clouds);

    this.hemi = new THREE.HemisphereLight(0xcfe2ef, 0x4e4a3e, 1.35);
    this.scene.add(this.hemi);
    this.ambient = new THREE.AmbientLight(0x8fa6b8, 0.25);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight(0xffe1b0, 2.1);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.left = -55; this.sun.shadow.camera.right = 55;
    this.sun.shadow.camera.top = 55; this.sun.shadow.camera.bottom = -55;
    this.sun.shadow.camera.near = 1; this.sun.shadow.camera.far = 260;
    this.sun.shadow.bias = -0.0007;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.moonLight = new THREE.DirectionalLight(0x8fb4e8, 0.0);
    this.scene.add(this.moonLight);

    // Moon visual
    const moon = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 12), new THREE.MeshBasicMaterial({ color: 0xdde8f2, fog: false }));
    moon.position.set(-400, 500, -600);
    this.group.add(moon); this.moon = moon;

    this.scene.fog = new THREE.FogExp2(0xbfd0d8, 0.0025);

    this.buildCities();
    this.buildWilds();
    this.buildDungeonMouths();
    this.buildNature();
    this.buildBridges();
    this.batch.build(this.group);
    this.buildBirds();
    this.finalize();
    this.setTime(9.2);
  }

  // -------------------------------------------------------------------------
  buildCities() {
    const w = this;
    const rng = this.rng;
    // ==== PAWMOUTH ====
    {
      const cx = 175, cz = 306;
      makeHouse(w, { x: 200, z: 288, ry: -0.25, width: 8, depth: 10, style: 'wood', name: 'Enter Gull\'s House', enter: 'cottage' });
      makeHouse(w, { x: 210, z: 328, ry: 0.2, width: 9, depth: 9, style: 'plaster', name: 'Enter Mittens\' House' });
      makeHouse(w, { x: 162, z: 352, ry: 0.7, width: 8, depth: 10, style: 'wood', name: 'Enter the Fisher\'s House' });
      makeHouse(w, { x: 198, z: 272, ry: -0.6, width: 7, depth: 8, style: 'wood', name: 'Enter the Net Mender\'s House' });
      makeHouse(w, { x: 146, z: 330, ry: 1.35, width: 8, depth: 9, style: 'plaster', name: 'Enter the Salty Whisker' });
      makeWell(w, 180, 315);
      makeDock(w, 150, 300, Math.PI / 2, 30);
      makeDock(w, 152, 278, Math.PI / 2, 18);
      makeBoat(w, 123, 302, 0.1);
      makeBoat(w, 118, 322, -0.2);
      makeBoat(w, 128, 276, 0.3);
      makeFence(w, 192, 346, 0.2, 20);
      makeFence(w, 226, 304, Math.PI / 2, 18);
      makeSignpost(w, 190, 352, 'PAWMOUTH');
      makeSignpost(w, 160, 270, 'WHISKERHOLD  ›');
      makeLamp(w, 172, 320); makeLamp(w, 195, 312); makeLamp(w, 186, 296);
      makeMarketStall(w, 190, 318, 0.2, 'clothRed');
      makeCrate(w, 160, 310, 0, 0.8); makeCrate(w, 161, 311, 0, 0.6); makeBarrel(w, 158, 308, 0);
      makeCrate(w, 152, 298, 1.45, 0.7); makeCrate(w, 153, 299, 1.45, 0.5);
      // fish drying racks
      for (let i = 0; i < 3; i++) {
        w.batch.box('woodDark', [160 + i * 4, w.terrain.heightAt(160 + i * 4, 340) + 1.2, 340], [0.12, 2.4, 0.12]);
        w.batch.box('wood', [160 + i * 4, w.terrain.heightAt(160 + i * 4, 340) + 2.2, 340], [3.8, 0.08, 0.08]);
        for (let j = 0; j < 4; j++) w.batch.sphere('bone', [159 + i * 4 + j * 0.8, w.terrain.heightAt(160 + i * 4, 340) + 1.7, 340], 0.16, 5, [1, 0.4, 0.6]);
      }
      // fishing spot at dock end
      w.addInteractable({ id: 'fish_pawsmouth', x: 128, z: 300, y: WATER_LEVEL + 1.2, radius: 3.5, label: 'Fish from the dock', icon: 'fish', action: (g) => g.fish() });
      // bounty board
      w.batch.box('woodDark', [206, w.terrain.heightAt(206, 312) + 1.3, 312], [0.2, 2.6, 0.2]);
      w.batch.box('wood', [206, w.terrain.heightAt(206, 312) + 2.1, 312], [2.6, 1.5, 0.14], [0, 0.3, 0]);
      w.batch.box('clothCream', [206.1, w.terrain.heightAt(206, 312) + 2.1, 312.09], [2.2, 1.15, 0.05], [0, 0.3, 0]);
    }

    // ==== WHISKERHOLD ====
    {
      const cx = -280, cz = -160;
      // walls (rect -375..-185, -240..-80)
      const wallH = 8.5;
      const southZ = -80, northZ = -240, westX = -375, eastX = -185;
      makeWallSegment(w, -332, southZ, 76, 0, wallH, 2.8);
      makeWallSegment(w, -228, southZ, 76, 0, wallH, 2.8);
      makeGatehouse(w, -280, southZ, 0, 12, 12);
      makeWallSegment(w, cx, northZ, 190, 0, wallH, 2.8);
      makeWallSegment(w, westX, cz, 160, Math.PI / 2, wallH, 2.8);
      makeWallSegment(w, eastX, cz, 160, Math.PI / 2, wallH, 2.8);
      for (const [x, z] of [[westX, southZ], [eastX, southZ], [westX, northZ], [eastX, northZ]]) makeTower(w, x, z, 5, 17, true);
      for (const [x, z] of [[westX, -160], [eastX, -160], [cx, northZ]]) makeTower(w, x, z, 4, 14, true);
      // gate banners
      addBanner(w, -286, w.terrain.heightAt(-286, southZ) + 9.5, southZ + 2.7, 2.6, 6, 'clothTeal');
      addBanner(w, -274, w.terrain.heightAt(-274, southZ) + 9.5, southZ + 2.7, 2.6, 6, 'clothTeal');
      // main street
      for (let i = 0; i < 14; i++) {
        const z = -86 - i * 6;
        w.batch.box('stoneLight', [cx, w.terrain.heightAt(cx, z) + 0.08, z], [7, 0.12, 5.8], [0, 0.04, 0]);
      }
      // keep / hall
      makeLonghouse(w, { x: -280, z: -218, ry: 0, width: 22, depth: 20, name: 'Enter the Hall of Nine Bells', enter: 'castlehall' });
      makeTower(w, -300, -218, 3.5, 14, true); makeTower(w, -260, -218, 3.5, 14, true);
      // tavern & shop
      makeLonghouse(w, { x: -332, z: -154, ry: 0.1, width: 14, depth: 16, name: 'Enter The Leaky Whisker', enter: 'tavern' });
      makeHouse(w, { x: -230, z: -160, ry: -0.1, width: 11, depth: 10, style: 'plaster', name: 'Enter Nine Lives Goods', enter: 'shop' });
      // houses
      const houses = [
        [-352, -112, 0.2, 9, 10, 'wood'], [-314, -112, -0.1, 8, 9, 'plaster'],
        [-352, -196, -0.2, 8, 10, 'plaster'], [-216, -196, 0.15, 9, 10, 'wood'],
        [-218, -112, -0.3, 8, 8, 'wood'], [-258, -110, 0.3, 7, 8, 'plaster'],
        [-352, -70, 0, 8, 8, 'wood'], [-208, -70, 0, 8, 8, 'plaster'],
      ];
      for (const [x, z, ry, ww, dd, st] of houses) makeHouse(w, { x, z, ry, width: ww, depth: dd, style: st, name: 'Enter the house', enter: st === 'plaster' && x === -352 ? 'cottage' : null });
      // market plaza
      makeStatue(w, -280, -130, 0.1);
      makeWell(w, -248, -136);
      makeMarketStall(w, -298, -146, 0.4, 'clothRed');
      makeMarketStall(w, -264, -146, -0.3, 'clothTeal');
      makeMarketStall(w, -310, -126, 1.1, 'clothBlue');
      for (let i = 0; i < 8; i++) makeLamp(w, -280 + (i % 2 ? 18 : -18), -100 - Math.floor(i / 2) * 24);
      makeCrate(w, -330, -142, 0, 0.8); makeBarrel(w, -326, -140, 0); makeBarrel(w, -325, -142, 0);
      makeCrate(w, -234, -150, 0, 0.7);
      makeSignpost(w, -280, -92, 'WHISKERHOLD');
      makeSignpost(w, -282, -250, 'HIGHPaw  ›');
      // banners on keep
      addBanner(w, -292, w.terrain.heightAt(-292, -208) + 13, -208, 2.6, 6, 'clothTeal');
      addBanner(w, -268, w.terrain.heightAt(-268, -208) + 13, -208, 2.6, 6, 'clothTeal');
    }

    // ==== HIGHPaw KEEP ====
    {
      const x = 238, z = -292;
      const y = this.terrain.heightAt(x, z);
      // wall ring
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const px = x + Math.cos(a) * 44, pz = z + Math.sin(a) * 44;
        makeWallSegment(w, px, pz, 34, -a + Math.PI / 2, 9, 2.8);
      }
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 + Math.PI / 4;
        makeTower(w, x + Math.cos(a) * 44, z + Math.sin(a) * 44, 4.5, 16, true);
      }
      makeGatehouse(w, x, z + 46, 0, 12, 12);
      makeLonghouse(w, { x, z: z - 8, ry: 0, width: 26, depth: 24, name: 'Enter Highpaw Hall', enter: 'castlehall' });
      makeTower(w, x - 18, z - 20, 4, 18, true); makeTower(w, x + 18, z - 20, 4, 18, true);
      makeTower(w, x - 18, z + 6, 3.5, 14, true); makeTower(w, x + 18, z + 6, 3.5, 14, true);
      makeStatue(w, x, z + 30, 0);
      makeWell(w, x + 22, z + 22);
      for (let i = 0; i < 6; i++) makeLamp(w, x - 20 + (i % 2) * 40, z + 14 + Math.floor(i / 2) * 12);
      addBanner(w, x - 9, y + 13, z + 2, 2.8, 6.5, 'clothRed');
      addBanner(w, x + 9, y + 13, z + 2, 2.8, 6.5, 'clothRed');
      makeSignpost(w, x, z + 54, 'HIGHPaw KEEP');
    }

    // ==== HEARTHWHISKER ====
    {
      const x = -392, z = 138;
      makeBarn(w, x - 24, z - 20, 0.2);
      makeWindmill(w, x + 34, z - 28);
      makeHouse(w, { x: x + 6, z: z + 12, ry: 0.3, width: 10, depth: 12, style: 'plaster', name: 'Enter the Farmhouse', enter: 'cottage' });
      makeHouse(w, { x: x - 18, z: z + 20, ry: -0.4, width: 8, depth: 9, style: 'wood', name: 'Enter the Bunkhouse' });
      makeHouse(w, { x: x + 28, z: z + 18, ry: 0.8, width: 8, depth: 9, style: 'wood', name: 'Enter the Grain Store' });
      makeWell(w, x + 2, z + 2);
      // fields
      for (let fx = 0; fx < 4; fx++) for (let fz = 0; fz < 3; fz++) {
        const px = x - 44 + fx * 11, pz = z + 34 + fz * 10;
        const py = this.terrain.heightAt(px, pz);
        this.batch.box('dirt', [px, py + 0.08, pz], [9, 0.16, 7]);
        for (let i = 0; i < 4; i++) this.batch.sphere('clothCream', [px - 3 + i * 2, py + 0.3, pz], 0.3, 5, [1, 0.5, 1]);
      }
      makeFence(w, x - 44, z + 58, 0, 40); makeFence(w, x - 44, z + 58, Math.PI / 2, 30);
      makeFence(w, x + 12, z + 58, 0, 34);
      // scarecrow
      this.batch.box('woodDark', [x - 20, this.terrain.heightAt(x - 20, z + 42) + 1.4, z + 42], [0.15, 2.8, 0.15]);
      this.batch.box('woodDark', [x - 20, this.terrain.heightAt(x - 20, z + 42) + 2.2, z + 42], [2.2, 0.12, 0.12]);
      this.batch.sphere('clothCream', [x - 20, this.terrain.heightAt(x - 20, z + 42) + 2.6, z + 42], 0.45, 6);
      this.batch.cone('clothRed', [x - 20, this.terrain.heightAt(x - 20, z + 42) + 3.15, z + 42], 0.55, 0.6, 5);
      makeSignpost(w, x + 2, z + 62, 'HEARTHWHISKER');
      makeCrate(w, x + 20, z + 4, 0, 0.8); makeBarrel(w, x + 22, z + 5, 0);
    }

    // ==== FROSTPELT ====
    {
      const x = 352, z = 206;
      makeHouse(w, { x: x - 18, z: z - 8, ry: 0.4, width: 9, depth: 10, style: 'wood', name: 'Enter the Apothecary', enter: 'cottage' });
      makeHouse(w, { x: x + 14, z: z + 12, ry: -0.3, width: 8, depth: 9, style: 'plaster', name: 'Enter the Hunter\'s Lodge' });
      makeHouse(w, { x: x - 10, z: z + 20, ry: 0.2, width: 8, depth: 10, style: 'wood', name: 'Enter the Furrier' });
      makeHouse(w, { x: x + 24, z: z - 18, ry: -0.6, width: 7, depth: 8, style: 'wood', name: 'Enter the Storehouse' });
      makeTower(w, x + 36, z - 26, 3.5, 15, true);
      makeWell(w, x + 2, z + 6);
      makeFence(w, x - 30, z + 32, 0, 30); makeFence(w, x - 30, z + 32, Math.PI / 2, 18);
      for (let i = 0; i < 4; i++) makeLamp(w, x - 14 + i * 10, z + 2);
      makeSignpost(w, x + 2, z + 34, 'FROSTPELT');
      makeCrate(w, x + 20, z + 4, 0, 0.8); makeCrate(w, x + 21, z + 5, 0, 0.6); makeBarrel(w, x + 18, z + 2, 0);
    }

    // ==== SHRINE ====
    makeShrine(w);

    // ==== BANDIT CAMP ====
    makeBanditCamp(w, 258, 72);
    this.addChest(266, 66, ['lute', 'gold', 'healthPotion'], 'bandit_lute');
    this.addInteractable({ id: 'bandit_orders', x: 252, z: 68, y: this.terrain.heightAt(252, 68) + 1.2, radius: 2.2, label: 'Read muddy orders', icon: 'scroll', action: (g) => g.readNote('The orders are smudged. You can make out: “Dig where the snow does not melt. The Hollow pay double.”') });
    makeSignpost(w, 240, 60, 'SCARWOOD');

    // ==== EXTRA CHESTS / HIDDEN PLACES ====
    this.addChest(-300, 268, ['gold', 'healthPotion', 'fish'], 'lake_chest');
    this.addChest(-462, -30, ['manaPotion', 'cheese', 'gold'], 'forest_chest');
    this.addChest(320, 350, ['staminaPotion', 'healthPotion', 'gold'], 'mountain_chest');
    // hidden cave
    makeCaveMouth(w, -500, 24);
    this.addInteractable({ id: 'enter_secrets', x: -500, z: 24, y: this.terrain.heightAt(-500, 24) + 1.4, radius: 4.5, label: 'Enter a hidden cave', icon: 'cave', action: (g) => g.world.enterInterior('secrets', g) });
    // secret door in city wall? a small alcove
    this.addChest(-374, -200, ['gold', 'manaPotion', 'healthPotion'], 'city_secret');

    // ==== SHRINE REST / CITY SHRINES ====
    this.addInteractable({ id: 'city_shrine', x: -280, z: -130, y: this.terrain.heightAt(-280, -130) + 1.6, radius: 3.5, label: 'Touch the statue of the First Cat', icon: 'shrine', action: (g) => g.restAtShrine('Whiskerhold', -280, -122, this.terrain.heightAt(-280, -122)) });
  }

  // -------------------------------------------------------------------------
  buildWilds() {
    // small hunting camps, standing stones and scenic props
    const rng = this.rng;
    const spots = [
      { x: -120, z: -40, t: 'camp' }, { x: 80, z: -360, t: 'camp' },
      { x: -470, z: 300, t: 'stones' }, { x: 300, z: 380, t: 'stones' },
      { x: 40, z: -240, t: 'stones' }, { x: -200, z: 400, t: 'camp' },
    ];
    for (const s of spots) {
      const y = this.terrain.heightAt(s.x, s.z);
      if (s.t === 'camp') {
        for (let i = 0; i < 4; i++) {
          const a = i / 4 * Math.PI * 2;
          this.batch.box('stoneDark', [s.x + Math.cos(a) * 0.9, y + 0.2, s.z + Math.sin(a) * 0.9], [0.5, 0.35, 0.5], [0, a, 0]);
        }
        this.batch.box('woodDark', [s.x, y + 0.2, s.z], [1.4, 0.2, 1.4], [0, 0.6, 0]);
        makeCrate(this, s.x + 2, y, s.z + 1, 0.6);
      } else {
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2;
          const px = s.x + Math.cos(a) * 6, pz = s.z + Math.sin(a) * 6;
          const py = this.terrain.heightAt(px, pz);
          this.batch.box('stoneDark', [px, py + 1.8, pz], [1.1, 3.6, 0.8], [0, -a, 0.03]);
          this.batch.box('crystal', [px - Math.sin(a) * 0.42, py + 2.2, pz - Math.cos(a) * 0.42], [0.08, 0.6, 0.35], [0, -a, 0]);
        }
      }
    }
    // frozen waterfall / scenic arch near lake
    const wx = -350, wz = 250;
    const wy = this.terrain.heightAt(wx, wz);
    for (let i = 0; i < 8; i++) this.batch.cone('ice', [wx + (i - 4) * 0.8, wy + 1.2, wz], 0.35, 2.4, 5, [0.1, i, 0.15]);
    // stone circle at lake shore
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const px = -300 + Math.cos(a) * 20, pz = 300 + Math.sin(a) * 20;
      const py = this.terrain.heightAt(px, pz);
      this.batch.box('stoneDark', [px, py + 2.2, pz], [1.3, 4.4, 1.0], [0, -a, 0.04]);
    }
  }

  buildDungeonMouths() {
    // Pawbarrow ruin entrance
    makeRuin(this, -360, -344, 1.3);
    this.addInteractable({ id: 'enter_pawbarrow', x: -360, z: -338, y: this.terrain.heightAt(-360, -338) + 1.4, radius: 5, label: 'Descend into Sunken Pawbarrow', icon: 'ruin', action: (g) => g.world.enterInterior('pawbarrow', g) });
    this.addChest(-338, -330, ['gold', 'cheese', 'healthPotion'], 'pawbarrow_out');
    // Cinderdeep
    makeMineEntrance(this, 392, -356, Math.PI);
    // Frostfang
    makeFrostDoor(this, -40, -590);
    // Whispering cave
    makeCaveMouth(this, -126, 336);
    // signposts
    makeSignpost(this, -360, -320, 'SUNKEN PAWBARROW');
    makeSignpost(this, 392, -332, 'CINDERDEEP');
    makeSignpost(this, -40, -566, 'FROSTFANG');
    makeSignpost(this, -126, 352, 'WHISPERING CAVE');
  }

  // -------------------------------------------------------------------------
  buildNature() {
    const rng = this.rng;
    const nearRoad = (x, z, r = 5) => {
      for (let i = 0; i < this.roadPoints.length; i += 2) {
        const p = this.roadPoints[i];
        if (Math.abs(p.x - x) < r && Math.abs(p.z - z) < r) return true;
      }
      return false;
    };
    const pineGeo = pineGeometry();
    const bareGeo = bareGeometry();
    const rockGeo = rockGeometry();
    const bushGeo = bushGeometry();
    const grassGeo = grassGeometry();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0, flatShading: true });
    const pines = [], bares = [], rocks = [], bushes = [], grasses = [];
    let attempts = 0;
    while (pines.length + bares.length < 1500 && attempts < 22000) {
      attempts++;
      const x = rng.range(-660, 660), z = rng.range(-660, 660);
      const h = this.terrain.heightAt(x, z);
      if (h < WATER_LEVEL + 0.8 || h > 58) continue;
      const slope = this.terrain.slopeAt(x, z);
      if (slope > 0.72) continue;
      if (this.terrain.isNearLandmark(x, z, -8)) continue;
      if (nearRoad(x, z, 5.5)) continue;
      const forest = smoothstep(0.36, 0.62, 0.55 + (Math.sin(x * 0.017) + Math.cos(z * 0.013)) * 0.12);
      const density = forest * (0.5 + Math.sin(x * 0.041 + z * 0.023) * 0.25);
      if (rng.next() > density * 1.5) continue;
      const s = rng.range(0.55, 1.35);
      const item = { x, z, y: h - 0.15, s, ry: rng.next() * Math.PI * 2 };
      if (rng.chance(0.78)) pines.push(item); else bares.push(item);
    }
    for (let i = 0; i < 460; i++) {
      const x = rng.range(-660, 660), z = rng.range(-660, 660);
      const h = this.terrain.heightAt(x, z);
      if (h < WATER_LEVEL + 0.3 || this.terrain.isNearLandmark(x, z, -4)) continue;
      rocks.push({ x, z, y: h - 0.2, s: rng.range(0.5, 2.2), ry: rng.next() * 6.28 });
    }
    for (let i = 0; i < 620; i++) {
      const x = rng.range(-660, 660), z = rng.range(-660, 660);
      const h = this.terrain.heightAt(x, z);
      if (h < WATER_LEVEL + 0.4 || h > 55 || this.terrain.isNearLandmark(x, z, -5) || nearRoad(x, z, 4)) continue;
      bushes.push({ x, z, y: h - 0.1, s: rng.range(0.6, 1.5), ry: rng.next() * 6.28 });
    }
    for (let i = 0; i < 1600; i++) {
      const x = rng.range(-660, 660), z = rng.range(-660, 660);
      const h = this.terrain.heightAt(x, z);
      if (h < WATER_LEVEL + 0.5 || h > 50 || this.terrain.isNearLandmark(x, z, -10) || nearRoad(x, z, 3)) continue;
      grasses.push({ x, z, y: h - 0.05, s: rng.range(0.5, 1.2), ry: rng.next() * 6.28 });
    }
    const makeInstances = (geo, list, cast = false) => {
      if (!list.length) return null;
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        dummy.position.set(it.x, it.y, it.z);
        dummy.rotation.set(0, it.ry, 0);
        dummy.scale.setScalar(it.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = cast; mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      return mesh;
    };
    this.pines = makeInstances(pineGeo, pines, false);
    this.bares = makeInstances(bareGeo, bares, false);
    this.rocks = makeInstances(rockGeo, rocks, false);
    this.bushes = makeInstances(bushGeo, bushes, false);
    this.grasses = makeInstances(grassGeo, grasses, false);
    this.natureCount = pines.length + bares.length;
  }

  buildBridges() {
    const crossings = [
      { z: 270, ry: Math.PI / 2 }, { z: 170, ry: Math.PI / 2 }, { z: 30, ry: Math.PI / 2 },
      { z: -160, ry: Math.PI / 2 }, { z: -340, ry: Math.PI / 2 }, { z: 306, ry: Math.PI / 2 },
    ];
    for (const c of crossings) {
      const x = riverX(c.z);
      makeBridge(this, x, c.z, c.ry, 34);
    }
  }

  buildBirds() {
    this.birds = [];
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([-0.6, 0, 0, 0, 0.1, 0.2, 0, 0, 0, 0.6, 0, 0, 0, 0.1, 0.2, 0, 0, 0]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    const mat = new THREE.MeshBasicMaterial({ color: 0x27333a, side: THREE.DoubleSide });
    for (let i = 0; i < 26; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(0.8 + this.rng.next());
      const a = this.rng.next() * Math.PI * 2, r = this.rng.range(30, 200);
      mesh.position.set(Math.cos(a) * r, this.rng.range(30, 70), Math.sin(a) * r);
      mesh.userData = { a, r, y: mesh.position.y, speed: this.rng.range(0.05, 0.15), phase: this.rng.next() * 6 };
      this.group.add(mesh); this.birds.push(mesh);
    }
  }

  // -------------------------------------------------------------------------
  buildInteriorIfNeeded(id) {
    if (!this.interiors.has(id)) {
      const interior = buildInterior(id);
      interior.spawn = interiorSpawn(id);
      this.scene.add(interior.group);
      this.interiors.set(id, interior);
    }
    return this.interiors.get(id);
  }

  enterInterior(id, game) {
    if (this.activeInterior) return;
    const interior = this.buildInteriorIfNeeded(id);
    this.returnPosition = { x: game.player.position.x, z: game.player.position.z, yaw: game.player.yaw };
    this.activeInterior = interior;
    this.activeInteriorId = id;
    this.outdoorVisible(false);
    interior.group.visible = true;
    this.colliders = interior.colliders;
    this.interactables = interior.interactables;
    const sp = interior.spawn;
    game.player.teleport(sp.x, 0, sp.z, sp.yaw);
    game.player.velocity.set(0, 0, 0);
    game.setIndoor(true, interior);
    game.audio.playDoor();
    this.lastArea = interior.name;
    game.currentArea = { id, name: interior.name, sub: 'Shelter from the snow', interior: true };
    game.ui.showArea(interior.name, 'Shelter from the snow');
    game.npcs.setInterior(id);
    game.enemies?.setInterior?.(id);
    game.quests?.event?.('reach', id, 1);
  }

  exitInterior(game) {
    if (!this.activeInterior) return;
    const interior = this.activeInterior;
    interior.group.visible = false;
    this.activeInterior = null;
    this.activeInteriorId = null;
    this.outdoorVisible(true);
    this.colliders = this.outdoorColliders || [];
    this.interactables = this.outdoorInteractables || [];
    const rp = this.returnPosition || { x: 178, z: 346, yaw: Math.PI };
    game.player.teleport(rp.x, this.terrain.heightAt(rp.x, rp.z) + 0.1, rp.z, rp.yaw);
    game.player.velocity.set(0, 0, 0);
    game.setIndoor(false, null);
    game.audio.playDoor();
    game.npcs.setInterior(null);
    game.enemies?.setInterior?.(null);
    this.lastArea = null;
  }

  outdoorVisible(v) {
    this.group.visible = v;
    this.hemi.visible = v;
    this.ambient.visible = v;
    this.sun.visible = v;
    this.moonLight.visible = v;
    if (v) {
      this.colliders = this.outdoorColliders || [];
      this.interactables = this.outdoorInteractables || [];
    }
  }

  tryFrostDoor(game) {
    const inv = game.inventory;
    if (inv.has('emberRelic') && inv.has('silverBell')) {
      game.ui.toast('The Ember and Bell answer. The door remembers warmth.', 'magic');
      this.enterInterior('frostfang', game);
    } else {
      const missing = [];
      if (!inv.has('emberRelic')) missing.push('the First Ember');
      if (!inv.has('silverBell')) missing.push('the Silver Bell');
      game.ui.toast('Two sockets wait. You are missing ' + missing.join(' and ') + '.', 'bad');
      game.audio.playFail();
    }
  }

  // -------------------------------------------------------------------------
  setTime(hours) {
    this.hours = hours;
    const elev = Math.sin((hours - 6) / 24 * Math.PI * 2);
    const az = (hours - 6) / 24 * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(az) * 0.8, elev, Math.sin(az) * 0.5).normalize();
    this.sunDir = dir;
    this.skyUniforms.sunDir.value.copy(dir);
    const night = 1 - smoothstep(-0.14, 0.22, elev);
    this.night = night;
    this.skyUniforms.night.value = night;
    this.skyUniforms.time.value = performance.now() * 0.001;
    const dusk = 1 - Math.min(1, Math.abs(elev) / 0.35);
    const top = new THREE.Color('#1c4257').lerp(new THREE.Color('#090d18'), night);
    const horizon = new THREE.Color('#b9cdd6').lerp(new THREE.Color('#2a3448'), night);
    const bottom = new THREE.Color('#6d8794').lerp(new THREE.Color('#141a24'), night);
    this.skyUniforms.topColor.value.copy(top);
    this.skyUniforms.horizonColor.value.copy(horizon);
    this.skyUniforms.bottomColor.value.copy(bottom);
    this.skyUniforms.sunColor.value.set(dusk > 0.5 ? '#ff9b63' : '#ffe4b8');
    this.stars.material.opacity = night * 0.9;
    this.moon.position.set(-dir.x * 700, Math.max(120, -dir.y * 700 + 120), -dir.z * 700);
    this.moon.visible = night > 0.15;
    this.sun.intensity = Math.max(0, elev) * 2.6 + 0.05;
    this.sun.color.set(dusk > 0.55 ? 0xffa76b : 0xfff0d0);
    this.moonLight.intensity = night * 0.45;
    this.hemi.intensity = 0.55 + (1 - night) * 0.9;
    this.hemi.color.set(night > 0.5 ? 0x4f6a8a : 0xcfe2ef);
    this.hemi.groundColor.set(night > 0.5 ? 0x1a2028 : 0x4e4a3e);
    this.ambient.intensity = 0.16 + (1 - night) * 0.12;
    this.clouds.children.forEach(s => s.material.opacity = 0.5 * (1 - night * 0.8));
    if (this.water) this.water.material.color.set(night > 0.5 ? 0x183c4a : 0x2e5b6b);
    if (this.scene.fog) this.scene.fog.color.copy(new THREE.Color('#bfd0d8').lerp(new THREE.Color('#101826'), night));
    // windows glow at night
    MATS.window.emissiveIntensity = 0.25 + night * 2.8;
    // torch lights scale
    for (const a of this.animated) if (a.light) a.light.intensity = (a.type === 'flame' ? 9 : 12) * (0.45 + night * 0.9);
  }

  update(dt, game) {
    const t = performance.now() * 0.001;
    // The sky dome rides with the camera so its far side is never clipped.
    if (this.sky && game.camera) this.sky.position.copy(game.camera.position);
    if (this.waterTex) { this.waterTex.offset.x += dt * 0.004; this.waterTex.offset.y += dt * 0.002; }
    for (const a of this.animated) {
      if (a.type === 'flame') {
        a.obj.scale.y = 0.85 + Math.sin(t * 9 + a.baseY) * 0.15;
        a.obj.scale.x = 0.9 + Math.sin(t * 7.1 + a.baseY) * 0.08;
        a.obj.position.y = a.baseY + Math.sin(t * 5 + a.baseY) * 0.04;
        if (a.light) a.light.intensity = (9 + Math.sin(t * 13) * 2) * (0.45 + this.night * 0.9);
      } else if (a.type === 'relic') {
        a.obj.rotation.y += dt * 0.8;
        a.obj.position.y = a.baseY + Math.sin(t * 1.4) * 0.12;
        if (a.light) a.light.intensity = 12 + Math.sin(t * 2.2) * 3;
      } else if (a.type === 'wisp') {
        a.obj.position.y = 2 + Math.sin(t * 1.6) * 0.4;
        a.obj.position.x = 5 + Math.sin(t * 0.7) * 1.4;
      } else if (a.type === 'void') {
        a.obj.scale.setScalar(1 + Math.sin(t * 1.3) * 0.06);
        a.obj.rotation.y += dt * 0.2;
      } else if (a.type === 'windmill') {
        a.obj.rotation.z += dt * 0.5;
      }
    }
    if (this.birds) {
      for (const b of this.birds) {
        const u = b.userData;
        u.a += dt * u.speed * 0.4;
        b.position.x = Math.cos(u.a) * u.r;
        b.position.z = Math.sin(u.a) * u.r;
        b.position.y = u.y + Math.sin(t * 0.5 + u.phase) * 3;
        b.rotation.y = -u.a;
        b.visible = this.night < 0.6;
      }
    }
    // sun follows player for shadow coverage
    if (game.player) {
      const p = game.player.position;
      const off = this.sunDir ? this.sunDir.clone().multiplyScalar(110) : new THREE.Vector3(40, 90, 40);
      this.sun.position.set(p.x + off.x, p.y + Math.max(40, off.y), p.z + off.z);
      this.sun.target.position.set(p.x, p.y, p.z);
      this.sun.target.updateMatrixWorld();
      this.moonLight.position.set(p.x - off.x, p.y + 60, p.z - off.z);
      // area detection
      const area = this.locationAt(p.x, p.z);
      if (area && area.id !== this.lastArea) {
        this.lastArea = area.id;
        game.onAreaChange(area);
      }
    }
    for (const c of this.chests) {
      if (!c.opened) {
        c.glow.material.opacity = 0.25 + Math.sin(t * 2.4 + c.x) * 0.12;
      } else {
        c.glow.material.opacity = Math.max(0, c.glow.material.opacity - dt * 0.7);
        if (c.lidPivot) c.lidPivot.rotation.x = Math.min(1.9, c.lidPivot.rotation.x + dt * 4);
      }
    }
  }

  locationAt(x, z) {
    if (this.activeInterior) return { id: this.activeInterior.name, name: this.activeInterior.name, sub: 'Shelter from the snow', interior: true };
    let best = null;
    for (const key in LANDMARKS) {
      const l = LANDMARKS[key];
      if (l.radius < 30) continue;
      const d = Math.hypot(x - l.x, z - l.z);
      if (d < l.radius && (!best || d < best.d)) best = { id: key, name: l.name, sub: l.sub, d };
    }
    if (best) return best;
    if (z < -470) return { id: 'frostfang_approach', name: 'The Frostfang Approach', sub: 'The wind has teeth here' };
    if (x > 330) return { id: 'cinder_foothills', name: 'Cinderpeak Foothills', sub: 'Warm stone under cold snow' };
    if (x < -330) return { id: 'hearth_vale', name: 'Hearthwhisker Vale', sub: 'Turnip country' };
    if (z > 380) return { id: 'south_reach', name: 'The Pale Reach', sub: 'Snow, pines, and very opinionated crows' };
    return { id: 'catterfall', name: 'Catterfall', sub: 'The kingdom beneath the snow' };
  }

  groundHeight(x, z) {
    if (this.activeInterior) return 0;
    return this.terrain.heightAt(x, z);
  }

  collidesCircle(x, z, r = 0.4) {
    for (const c of this.colliders) {
      if (c.circle) {
        if (Math.hypot(x - c.x, z - c.z) < c.hx + r) return true;
      } else {
        const dx = x - c.x, dz = z - c.z;
        const cos = Math.cos(-c.ry || 0), sin = Math.sin(-c.ry || 0);
        const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
        const cx = Math.max(-c.hx, Math.min(c.hx, lx));
        const cz = Math.max(-c.hz, Math.min(c.hz, lz));
        if (Math.hypot(lx - cx, lz - cz) < r) return true;
      }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  collectOutdoorState() {
    this.outdoorColliders = this.outdoorColliders || this.colliders;
    this.outdoorInteractables = this.outdoorInteractables || this.interactables;
  }

  finalize() {
    this.outdoorColliders = this.colliders;
    this.outdoorInteractables = this.interactables;
  }
}
