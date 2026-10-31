// ---------------------------------------------------------------------------
// Procedural cats. Every character in Catterfall is built from this kit:
// stylised, bipedal, expressive, and assembled from vertex-coloured primitives
// so the whole kingdom can be drawn with very few materials.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BREEDS, FURS, EYES, ITEMS } from '../core/data.js';

const catMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.0 });
const catMaterialSoft = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1.0, metalness: 0.0 });
const eyeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xaebbc1, metalness: 0.85, roughness: 0.32, flatShading: true });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x5c666b, metalness: 0.7, roughness: 0.45, flatShading: true });
const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3c28, roughness: 0.9, flatShading: true });
const clothMaterials = new Map();
const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
const clawMaterial = new THREE.MeshStandardMaterial({ color: 0xe8dfcf, roughness: 0.5, metalness: 0.1 });

const C = (hex) => new THREE.Color(hex);
function cloth(color) {
  if (!clothMaterials.has(color)) clothMaterials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true, side: THREE.DoubleSide }));
  return clothMaterials.get(color);
}

function paint(geo, hex) {
  const c = C(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

function part(list, geo, hex, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  geo.scale(scale[0], scale[1], scale[2]);
  if (rot[0] || rot[1] || rot[2]) geo.rotateX(rot[0]), geo.rotateY(rot[1]), geo.rotateZ(rot[2]);
  geo.translate(pos[0], pos[1], pos[2]);
  paint(geo, hex);
  list.push(geo);
  return geo;
}

function sphere(list, hex, pos, r, seg = 8, scale = [1, 1, 1], rot = [0, 0, 0]) {
  return part(list, new THREE.SphereGeometry(r, seg, Math.max(5, seg - 2)), hex, pos, rot, scale);
}
function capsule(list, hex, pos, r, len, scale = [1, 1, 1], rot = [0, 0, 0]) {
  return part(list, new THREE.CapsuleGeometry(r, len, 3, 7), hex, pos, rot, scale);
}
function box(list, hex, pos, size, rot = [0, 0, 0]) {
  return part(list, new THREE.BoxGeometry(size[0], size[1], size[2]), hex, pos, rot);
}
function cone(list, hex, pos, r, h, seg = 5, rot = [0, 0, 0], scale = [1, 1, 1]) {
  return part(list, new THREE.ConeGeometry(r, h, seg), hex, pos, rot, scale);
}
function cyl(list, hex, pos, rt, rb, h, seg = 7, rot = [0, 0, 0]) {
  return part(list, new THREE.CylinderGeometry(rt, rb, h, seg), hex, pos, rot);
}
function merge(list) {
  if (!list.length) return null;
  const g = mergeGeometries(list, false);
  list.forEach(x => x.dispose());
  return g;
}

// ---------------------------------------------------------------------------
function buildSword(itemId) {
  const g = new THREE.Group();
  const bladeMat = itemId === 'oathBlade' ? new THREE.MeshStandardMaterial({ color: 0xd9c07a, metalness: 0.9, roughness: 0.22, emissive: 0x4a3611, emissiveIntensity: 0.4, flatShading: true }) : metalMaterial;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.78, 0.016), bladeMat);
  blade.position.y = 0.48;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.046, 0.14, 4), bladeMat);
  tip.position.y = 0.94; tip.rotation.y = Math.PI / 4;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.05), darkMetal);
  guard.position.y = 0.08;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.22, 6), leatherMaterial);
  grip.position.y = -0.05;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 5), darkMetal);
  pommel.position.y = -0.18;
  g.add(blade, tip, guard, grip, pommel);
  return g;
}
function buildAxe() {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.92, 6), leatherMaterial);
  shaft.position.y = 0.4;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.3), metalMaterial);
  head.position.set(0, 0.82, 0.1);
  const edge = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0xbfe9ff, metalness: 0.8, roughness: 0.2, emissive: 0x1b4b66, emissiveIntensity: 0.5, flatShading: true }));
  edge.rotation.z = Math.PI / 2; edge.rotation.y = Math.PI / 4; edge.position.set(0, 0.82, 0.26); edge.scale.set(0.5, 1, 1);
  g.add(shaft, head, edge);
  return g;
}
function buildStaff() {
  const g = new THREE.Group();
  const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 1.4, 6), leatherMaterial);
  wood.position.y = 0.55;
  const claw = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 5, 8, Math.PI * 1.4), darkMetal);
  claw.position.y = 1.25; claw.rotation.z = -0.2;
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffa54a, emissive: 0xff7a22, emissiveIntensity: 1.4, roughness: 0.3 }));
  orb.position.y = 1.27;
  g.add(wood, claw, orb);
  g.userData.orb = orb;
  return g;
}
function buildClaws() {
  const g = new THREE.Group();
  for (let i = -1; i <= 1; i++) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.13, 4), clawMaterial);
    claw.position.set(i * 0.035, 0.04, 0.02); claw.rotation.x = Math.PI * 0.6;
    g.add(claw);
  }
  return g;
}
function buildBow() {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, a = -1.1 + t * 2.2;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.34, Math.sin(a) * 0.55, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const limb = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.018, 4, false), leatherMaterial);
  const stringGeo = new THREE.BufferGeometry().setFromPoints([pts[0], new THREE.Vector3(-0.04, 0, 0), pts[10]]);
  const string = new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: 0xd8d2c0, transparent: true, opacity: 0.7 }));
  g.add(limb, string);
  return g;
}
function buildShield() {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 7), new THREE.MeshStandardMaterial({ color: 0x6f5a3d, roughness: 0.8, flatShading: true }));
  face.rotation.x = Math.PI / 2;
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), metalMaterial);
  boss.position.z = 0.04; boss.scale.z = 0.4;
  g.add(face, boss);
  return g;
}

// ---------------------------------------------------------------------------
export function createCat(opts = {}) {
  const breed = BREEDS.find(b => b.id === opts.breed) || BREEDS[2];
  const fur = FURS.find(f => f.id === opts.fur) || FURS[0];
  const eye = EYES.find(e => e.id === opts.eye) || EYES[0];
  const scale = (opts.scale || 1) * breed.scale;
  const isPlayer = !!opts.isPlayer;

  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const rig = new THREE.Group();
  root.add(rig);

  const base = fur.base, hi = fur.hi, dark = fur.dark;
  const sock = breed.socks ? '#e9e4d8' : hi;
  const pointDark = breed.darkPoints ? dark : base;

  // --- body + hips + neck -------------------------------------------------
  const bodyParts = [];
  sphere(bodyParts, base, [0, 1.06, 0], 0.3, 9, [1.16, 1.05, 0.92]);
  sphere(bodyParts, base, [0, 0.84, 0], 0.27, 9, [1.1, 0.8, 0.95]);
  sphere(bodyParts, hi, [0, 1.1, 0.16], 0.21, 8, [0.9, 0.95, 0.5]); // chest fluff
  if (breed.fluff > 1.1) {
    sphere(bodyParts, hi, [0, 1.33, 0.02], 0.22, 8, [1.15, 0.55, 1.0]); // neck ruff
    sphere(bodyParts, hi, [0, 0.9, -0.2], 0.2, 8, [1.2, 0.8, 0.7]);
  }
  if (breed.stripes) {
    for (let i = 0; i < 3; i++) {
      box(bodyParts, dark, [0, 1.16 - i * 0.14, 0.285], [0.36 - i * 0.04, 0.035, 0.02], [0, 0, (i % 2 ? 0.08 : -0.08)]);
    }
    box(bodyParts, dark, [0.18, 1.3, 0.14], [0.08, 0.2, 0.04], [0, 0, 0.3]);
    box(bodyParts, dark, [-0.18, 1.3, 0.14], [0.08, 0.2, 0.04], [0, 0, -0.3]);
  }
  if (breed.patches) {
    sphere(bodyParts, '#e9e2d2', [-0.17, 1.1, 0.17], 0.17, 7, [0.8, 1.1, 0.5]);
    sphere(bodyParts, '#3a3130', [0.19, 0.97, 0.16], 0.15, 7, [0.9, 0.8, 0.5]);
    sphere(bodyParts, '#c96b3a', [0.08, 1.28, 0.12], 0.13, 7, [1, 0.7, 0.5]);
  }
  const bodyMesh = new THREE.Mesh(merge(bodyParts), catMaterial);
  bodyMesh.castShadow = true; bodyMesh.receiveShadow = true;
  rig.add(bodyMesh);

  // --- head ---------------------------------------------------------------
  const head = new THREE.Group();
  head.position.set(0, 1.5, 0.01);
  rig.add(head);
  const headParts = [];
  sphere(headParts, base, [0, 0.04, 0], 0.285, 10, [1, 0.95, 0.92]);
  sphere(headParts, hi, [0, -0.01, 0.2], 0.15, 8, [1.2, 0.68, 0.85]); // muzzle
  sphere(headParts, hi, [0.15, -0.02, 0.15], 0.1, 7, [0.9, 0.75, 0.7]);
  sphere(headParts, hi, [-0.15, -0.02, 0.15], 0.1, 7, [0.9, 0.75, 0.7]);
  sphere(headParts, '#2a1a18', [0, 0.02, 0.318], 0.042, 6, [1.15, 0.75, 0.6]); // nose
  box(headParts, dark, [0, -0.075, 0.315], [0.018, 0.055, 0.02]); // mouth line
  // cheek fluff
  if (breed.fluff > 1.0) {
    cone(headParts, hi, [0.25, -0.03, 0.08], 0.09, 0.2, 4, [0, 0, -1.1]);
    cone(headParts, hi, [-0.25, -0.03, 0.08], 0.09, 0.2, 4, [0, 0, 1.1]);
  }
  // ears
  const earX = 0.17, earY = 0.29;
  cone(headParts, pointDark, [earX, earY, -0.01], 0.135, 0.27, 4, [0, 0.4, -0.22]);
  cone(headParts, pointDark, [-earX, earY, -0.01], 0.135, 0.27, 4, [0, -0.4, 0.22]);
  cone(headParts, '#d68f8b', [earX - 0.005, earY - 0.015, 0.035], 0.08, 0.16, 4, [0, 0.4, -0.22]);
  cone(headParts, '#d68f8b', [-earX + 0.005, earY - 0.015, 0.035], 0.08, 0.16, 4, [0, -0.4, 0.22]);
  if (breed.tufts) {
    cone(headParts, hi, [earX + 0.03, earY + 0.13, 0], 0.035, 0.12, 4, [0, 0, -0.35]);
    cone(headParts, hi, [-earX - 0.03, earY + 0.13, 0], 0.035, 0.12, 4, [0, 0, 0.35]);
  }
  // brow patches
  box(headParts, dark, [0.12, 0.135, 0.255], [0.1, 0.022, 0.02], [0, 0, -0.2]);
  box(headParts, dark, [-0.12, 0.135, 0.255], [0.1, 0.022, 0.02], [0, 0, 0.2]);
  if (breed.darkPoints) {
    sphere(headParts, dark, [0, 0.02, 0.27], 0.11, 7, [1.25, 0.9, 0.45]);
    cone(headParts, dark, [earX, earY, -0.01], 0.14, 0.28, 4, [0, 0.4, -0.22]);
    cone(headParts, dark, [-earX, earY, -0.01], 0.14, 0.28, 4, [0, -0.4, 0.22]);
  }
  const headMesh = new THREE.Mesh(merge(headParts), catMaterial);
  headMesh.castShadow = true;
  head.add(headMesh);

  // eyes (unlit, expressive)
  const eyeGeoList = [];
  sphere(eyeGeoList, eye.color, [0.112, 0.08, 0.252], 0.068, 7, [1, 1.18, 0.42]);
  sphere(eyeGeoList, eye.color, [-0.112, 0.08, 0.252], 0.068, 7, [1, 1.18, 0.42]);
  box(eyeGeoList, '#0b0b0d', [0.112, 0.08, 0.282], [0.018, 0.09, 0.012]);
  box(eyeGeoList, '#0b0b0d', [-0.112, 0.08, 0.282], [0.018, 0.09, 0.012]);
  sphere(eyeGeoList, '#ffffff', [0.132, 0.112, 0.288], 0.014, 5, [1, 1, 0.4]);
  sphere(eyeGeoList, '#ffffff', [-0.092, 0.112, 0.288], 0.014, 5, [1, 1, 0.4]);
  const eyeMesh = new THREE.Mesh(merge(eyeGeoList), eyeMaterial);
  head.add(eyeMesh);

  // whiskers
  const wPts = [];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = -0.03 + i * 0.035;
      wPts.push(new THREE.Vector3(s * 0.15, y, 0.3));
      wPts.push(new THREE.Vector3(s * (0.4 + i * 0.03), y + 0.03 - i * 0.02, 0.24 + i * 0.015));
    }
  }
  const whiskers = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wPts), whiskerMaterial);
  head.add(whiskers);

  // mouth (visible when talking)
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: 0x401f22 }));
  mouth.scale.set(1, 0.5, 0.4); mouth.position.set(0, -0.075, 0.318); mouth.visible = false;
  head.add(mouth);

  // --- arms ---------------------------------------------------------------
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.33, 1.28, 0);
    const parts = [];
    capsule(parts, base, [0, -0.16, 0], 0.085, 0.2, [1, 1, 0.95]);
    capsule(parts, side > 0 ? base : hi, [0, -0.4, 0.025], 0.07, 0.19, [1, 1, 0.95]);
    sphere(parts, sock, [0, -0.57, 0.04], 0.09, 7, [1, 0.8, 1.05]);
    for (let i = -1; i <= 1; i++) {
      const claw = new THREE.ConeGeometry(0.011, 0.055, 4);
      claw.rotateX(Math.PI * 0.55); claw.translate(i * 0.026, -0.61, 0.13);
      paint(claw, '#efe8da'); parts.push(claw);
    }
    const mesh = new THREE.Mesh(merge(parts), catMaterial);
    mesh.castShadow = true;
    pivot.add(mesh);
    rig.add(pivot);
    return pivot;
  }
  const armR = makeArm(1), armL = makeArm(-1);
  armR.rotation.z = -0.12; armL.rotation.z = 0.12;

  // --- legs ---------------------------------------------------------------
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.155, 0.86, 0);
    const parts = [];
    capsule(parts, base, [0, -0.19, 0.01], 0.11, 0.2, [1, 1, 0.95]);
    capsule(parts, base, [0, -0.46, 0.03], 0.08, 0.21, [1, 1, 0.9]);
    sphere(parts, sock, [0, -0.71, 0.075], 0.1, 7, [1, 0.62, 1.5]);
    const mesh = new THREE.Mesh(merge(parts), catMaterial);
    mesh.castShadow = true;
    pivot.add(mesh);
    rig.add(pivot);
    return pivot;
  }
  const legR = makeLeg(1), legL = makeLeg(-1);

  // --- tail ---------------------------------------------------------------
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.88, -0.22);
  rig.add(tailPivot);
  const tailParts = [];
  const tw = breed.fluff * 1.0;
  capsule(tailParts, base, [0, 0.02, -0.12], 0.06 * tw, 0.2, [1, 1, 1], [0.7, 0, 0]);
  capsule(tailParts, base, [0, 0.16, -0.3], 0.055 * tw, 0.18, [1, 1, 1], [1.05, 0, 0]);
  capsule(tailParts, pointDark, [0, 0.36, -0.42], 0.05 * tw, 0.17, [1, 1, 1], [1.4, 0, 0]);
  sphere(tailParts, pointDark, [0, 0.5, -0.47], 0.06 * tw, 6, [1, 1.2, 1]);
  const tailMesh = new THREE.Mesh(merge(tailParts), catMaterial);
  tailMesh.castShadow = true;
  tailPivot.add(tailMesh);

  // --- gear ---------------------------------------------------------------
  const gear = new THREE.Group();
  rig.add(gear);
  let armorMesh = null, weaponMesh = null, weaponItem = null, bowMesh = null, scarfMesh = null;
  const handAnchor = new THREE.Group();
  handAnchor.position.set(0, -0.57, 0.05);
  armR.add(handAnchor);
  const backAnchor = new THREE.Group();
  backAnchor.position.set(-0.02, 1.16, -0.28);
  backAnchor.rotation.z = 0.3;
  rig.add(backAnchor);

  function setWeapon(itemId) {
    if (weaponMesh) { handAnchor.remove(weaponMesh); weaponMesh = null; }
    weaponItem = itemId ? ITEMS[itemId] : null;
    if (!itemId) return;
    if (itemId === 'frostAxe') weaponMesh = buildAxe();
    else if (itemId === 'oakStaff') weaponMesh = buildStaff();
    else if (itemId === 'clawWraps') weaponMesh = buildClaws();
    else weaponMesh = buildSword(itemId);
    if (weaponMesh) {
      weaponMesh.position.set(0, 0, 0);
      weaponMesh.rotation.set(-0.15, 0, 0);
      handAnchor.add(weaponMesh);
    }
  }
  function setArmor(itemId) {
    if (armorMesh) { gear.remove(armorMesh); armorMesh = null; }
    const item = ITEMS[itemId];
    if (!item || item.type !== 'armor') return;
    const parts = [];
    if (itemId === 'mageRobe') {
      const col = '#6d4a86';
      cyl(parts, col, [0, 0.72, 0], 0.28, 0.46, 0.66, 8);
      box(parts, '#c8a4e0', [0, 1.08, 0.21], [0.38, 0.1, 0.06]);
      cone(parts, '#4e3562', [0.33, 1.3, 0], 0.13, 0.3, 5, [0, 0, -0.3]);
      cone(parts, '#4e3562', [-0.33, 1.3, 0], 0.13, 0.3, 5, [0, 0, 0.3]);
      for (const s of [-1, 1]) { box(parts, '#d6b36a', [s * 0.3, 0.72, 0.08], [0.02, 0.5, 0.02]); }
    } else {
      const col = itemId === 'wardenArmor' ? '#7d9aa8' : itemId === 'ironArmor' ? '#8a9397' : '#6b4b32';
      const trim = itemId === 'wardenArmor' ? '#cfe6ef' : '#b08d5a';
      sphere(parts, col, [0, 1.08, 0.02], 0.31, 8, [1.05, 0.9, 1.0]);
      box(parts, trim, [0, 0.98, 0.26], [0.5, 0.06, 0.03]);
      sphere(parts, col, [0.33, 1.3, 0], 0.13, 6, [1, 0.7, 1]);
      sphere(parts, col, [-0.33, 1.3, 0], 0.13, 6, [1, 0.7, 1]);
      if (itemId === 'wardenArmor') {
        cone(parts, trim, [0, 1.36, 0.06], 0.06, 0.16, 5);
      }
      cyl(parts, '#4a3322', [0, 0.88, 0], 0.29, 0.3, 0.08, 8);
    }
    armorMesh = new THREE.Mesh(merge(parts), catMaterial);
    armorMesh.castShadow = true;
    gear.add(armorMesh);
  }
  function setBow(itemId) {
    if (bowMesh) { backAnchor.remove(bowMesh); bowMesh = null; }
    if (!itemId) return;
    bowMesh = buildBow();
    bowMesh.scale.setScalar(1.15);
    bowMesh.position.set(0, 0.1, -0.04);
    bowMesh.rotation.set(0, 0.2, Math.PI * 0.55);
    backAnchor.add(bowMesh);
  }
  function setScarf(color) {
    if (scarfMesh) { gear.remove(scarfMesh); scarfMesh = null; }
    if (!color) return;
    const parts = [];
    cyl(parts, color, [0, 1.34, 0.01], 0.23, 0.25, 0.09, 9);
    box(parts, color, [0.1, 1.18, 0.24], [0.12, 0.32, 0.03], [0.1, 0, 0.16]);
    scarfMesh = new THREE.Mesh(merge(parts), catMaterial);
    gear.add(scarfMesh);
  }

  // -----------------------------------------------------------------------
  const anim = {
    phase: Math.random() * 10, t: Math.random() * 10,
    attack: 0, hurt: 0, cast: 0, talk: 0, dead: 0, sit: 0, sleep: 0,
    blink: 2 + Math.random() * 4, blinkT: 0, speed: 0, block: 0, aim: 0,
  };

  const cat = {
    root, rig, head, bodyMesh, headMesh, eyeMesh, mouth, armR, armL, legR, legL,
    tailPivot, gear, handAnchor, backAnchor, anim, scale,
    breed, fur, eye, isPlayer,
    weaponItem: null, armorItem: null, bowItem: null,
    setWeapon, setArmor, setBow, setScarf,
    setAppearance(o) {
      // rebuild is handled by creator using a fresh cat
    },
    playAttack() { anim.attack = 0.42; },
    playCast() { anim.cast = 0.55; },
    playHurt() { anim.hurt = 0.3; },
    playTalk() { anim.talk = 0.16; },
    die() { anim.dead = 1; },
    revive() { anim.dead = 0; },
    setVisible(v) { root.visible = v; },
    update(dt, s = {}) {
      anim.t += dt;
      anim.attack = Math.max(0, anim.attack - dt);
      anim.hurt = Math.max(0, anim.hurt - dt);
      anim.cast = Math.max(0, anim.cast - dt);
      anim.talk = Math.max(0, anim.talk - dt);
      anim.blink -= dt;
      if (anim.blink <= 0) { anim.blinkT = 0.13; anim.blink = 2.2 + Math.random() * 4.5; }
      anim.blinkT = Math.max(0, anim.blinkT - dt);

      const speed = s.speed || 0;
      const moving = speed > 0.15;
      const run = THREE.MathUtils.clamp((speed - 3.8) / 4.5, 0, 1);
      anim.speed = speed;
      const sitTarget = s.sitting ? 1 : 0;
      anim.sit += (sitTarget - anim.sit) * Math.min(1, dt * 5);
      const sleepTarget = s.sleeping ? 1 : 0;
      anim.sleep += (sleepTarget - anim.sleep) * Math.min(1, dt * 4);
      const blockTarget = s.blocking ? 1 : 0;
      anim.block += (blockTarget - anim.block) * Math.min(1, dt * 10);
      const aimTarget = s.aiming ? 1 : 0;
      anim.aim += (aimTarget - anim.aim) * Math.min(1, dt * 8);

      if (moving) anim.phase += dt * (4.5 + speed * 1.15);
      const ph = anim.phase;
      const swing = moving ? Math.sin(ph) : 0;
      const swing2 = moving ? Math.cos(ph) : 0;
      const gait = THREE.MathUtils.clamp(speed / 4.2, 0.35, 1.25);

      // legs
      legR.rotation.x = swing * 0.72 * gait - anim.sit * 1.45;
      legL.rotation.x = -swing * 0.72 * gait - anim.sit * 1.45;
      legR.rotation.z = anim.sit * 0.16;
      legL.rotation.z = -anim.sit * 0.16;
      legR.position.y = 0.86 + Math.max(0, swing2) * 0.035 * gait - anim.sit * 0.22;
      legL.position.y = 0.86 + Math.max(0, -swing2) * 0.035 * gait - anim.sit * 0.22;

      // arms
      let armSwing = -swing * 0.55 * gait;
      if (anim.sit > 0.2) armSwing = -0.5 * anim.sit;
      let armRrot = armSwing;
      let armLrot = -armSwing;
      if (anim.attack > 0) {
        const p = 1 - anim.attack / 0.42;
        const arc = Math.sin(p * Math.PI);
        armRrot = -0.7 - arc * 2.1;
        armR.rotation.z = -0.12 - arc * 0.25;
      } else {
        armR.rotation.z = -0.12 - anim.block * 0.55;
      }
      armR.rotation.x = armRrot - anim.cast * 1.3 - anim.aim * 0.65 + anim.sleep * 0.35;
      armL.rotation.x = armLrot - anim.cast * 0.4 - anim.aim * 1.35 + anim.sleep * 0.35;
      armL.rotation.z = 0.12 + anim.block * 0.35;

      // body bob, lean, breathing
      const bob = moving ? Math.abs(swing) * 0.045 * gait : Math.sin(anim.t * 1.6) * 0.012;
      rig.position.y = bob - anim.sit * 0.34 - anim.sleep * 0.05;
      rig.rotation.x = run * 0.12 - anim.sit * 0.1 + anim.sleep * 0.18;
      rig.rotation.z = moving ? swing2 * 0.025 : 0;
      bodyMesh.scale.set(1, 1 + Math.sin(anim.t * 1.6) * 0.012, 1);
      rig.position.z = anim.sleep * -0.06;

      // head
      head.rotation.x = -run * 0.1 + anim.sleep * 0.35 + anim.hurt * 0.3;
      head.rotation.y = s.lookYaw || 0;
      head.rotation.z = Math.sin(anim.t * 0.7) * 0.02 + (s.tilt || 0);
      head.position.y = 1.5 + anim.sit * 0.02;

      // tail
      const tailSpeed = moving ? 5.5 : 1.4;
      tailPivot.rotation.y = Math.sin(anim.t * tailSpeed) * (moving ? 0.22 : 0.4) * (1 - anim.sleep * 0.7);
      tailPivot.rotation.x = (moving ? -0.15 - run * 0.35 : 0.05) + anim.sit * 0.4 + anim.sleep * 0.2;
      tailPivot.rotation.z = Math.cos(anim.t * 1.1) * 0.12;

      // eyes / expression
      const blink = anim.blinkT > 0 ? 0.08 : 1;
      eyeMesh.scale.y = blink * (1 - anim.sleep * 0.9);
      mouth.visible = anim.talk > 0 || (s.talking && Math.sin(anim.t * 9) > 0.2);
      mouth.scale.y = 0.5 + Math.abs(Math.sin(anim.t * 11)) * 0.5;
      mouth.scale.x = 1 + Math.sin(anim.t * 5) * 0.1;

      // death
      if (anim.dead) {
        rig.rotation.z += (1.45 - rig.rotation.z) * Math.min(1, dt * 4);
        rig.position.y += (-0.05 - rig.position.y) * Math.min(1, dt * 4);
      }

      if (weaponMesh && weaponMesh.userData.orb) weaponMesh.userData.orb.scale.setScalar(1 + Math.sin(anim.t * 4) * 0.12);
    },
  };

  root.userData.cat = cat;
  if (opts.weapon) setWeapon(opts.weapon);
  if (opts.armor) setArmor(opts.armor);
  if (opts.bow) setBow(opts.bow);
  if (opts.scarf) setScarf(opts.scarf);

  return cat;
}

export function randomCatLook(rng, overrides = {}) {
  const breed = overrides.breed ? BREEDS.find(b => b.id === overrides.breed) : rng.pick(BREEDS);
  const fur = overrides.fur ? FURS.find(f => f.id === overrides.fur) : rng.pick(FURS);
  const eye = overrides.eye ? EYES.find(e => e.id === overrides.eye) : rng.pick(EYES);
  return { breed: breed.id, fur: fur.id, eye: eye.id, scale: overrides.scale || 1 };
}

export function catAvatarStyle(cat, el) {
  if (!el) return;
  const furId = typeof cat.fur === 'string' ? cat.fur : cat.fur?.id;
  const eyeId = typeof cat.eye === 'string' ? cat.eye : cat.eye?.id;
  const fur = FURS.find(f => f.id === furId) || FURS[0];
  const eye = EYES.find(e => e.id === eyeId) || EYES[0];
  el.style.setProperty('--fur', fur.base);
  el.style.setProperty('--fur-hi', fur.hi);
  el.style.setProperty('--eye', eye.color);
}

export { catMaterial, metalMaterial };
