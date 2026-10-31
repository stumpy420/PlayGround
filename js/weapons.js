import * as THREE from '../vendor/three.module.js';

/* ------------------------------------------------------------------ */
/* Shared materials                                                    */
/* ------------------------------------------------------------------ */

const MAT = {
  metal: new THREE.MeshStandardMaterial({ color: 0x3a424a, roughness: 0.34, metalness: 0.58 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: 0.42, metalness: 0.5 }),
  metalBright: new THREE.MeshStandardMaterial({ color: 0x555c63, roughness: 0.3, metalness: 0.72 }),
  polymer: new THREE.MeshStandardMaterial({ color: 0x292c30, roughness: 0.72, metalness: 0.08 }),
  polymerAlt: new THREE.MeshStandardMaterial({ color: 0x393a35, roughness: 0.8, metalness: 0.05 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x5a3e26, roughness: 0.86, metalness: 0.02 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.98 }),
  accent: new THREE.MeshStandardMaterial({
    color: 0xff8a2b,
    emissive: 0x8f3404,
    emissiveIntensity: 0.75,
    roughness: 0.42,
    metalness: 0.35,
  }),
  accentDim: new THREE.MeshStandardMaterial({ color: 0xb65b1f, roughness: 0.58, metalness: 0.3 }),
  void: new THREE.MeshBasicMaterial({ color: 0x050607 }),
  lens: new THREE.MeshBasicMaterial({
    color: 0x73d8f0,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  }),
  redDot: new THREE.MeshBasicMaterial({ color: 0xff3b46, toneMapped: false }),
  glove: new THREE.MeshStandardMaterial({ color: 0x2a231d, roughness: 0.9, metalness: 0.03 }),
  glovePanel: new THREE.MeshStandardMaterial({ color: 0x66503a, roughness: 0.8, metalness: 0.05 }),
  gloveSeam: new THREE.MeshStandardMaterial({ color: 0x171310, roughness: 0.98 }),
  sleeve: new THREE.MeshStandardMaterial({ color: 0x47483e, roughness: 0.96, metalness: 0.02 }),
  sleeveDark: new THREE.MeshStandardMaterial({ color: 0x30312b, roughness: 1 }),
  sleeveFold: new THREE.MeshStandardMaterial({ color: 0x3b3c34, roughness: 1 }),
  cuff: new THREE.MeshStandardMaterial({ color: 0x735d3c, roughness: 0.86, metalness: 0.04 }),
  shell: new THREE.MeshStandardMaterial({ color: 0x8b1f1c, roughness: 0.62, metalness: 0.18 }),
};

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function roundedBoxGeometry(w, h, d, radius = 0.01) {
  const bevel = Math.min(w, h, d) * 0.055;
  const sw = Math.max(0.001, w - bevel * 2);
  const sh = Math.max(0.001, h - bevel * 2);
  const sr = Math.max(
    0.0005,
    Math.min(radius - bevel, sw * 0.48, sh * 0.48)
  );
  const x = -sw / 2;
  const y = -sh / 2;

  const shape = new THREE.Shape();
  shape.moveTo(x + sr, y);
  shape.lineTo(x + sw - sr, y);
  shape.quadraticCurveTo(x + sw, y, x + sw, y + sr);
  shape.lineTo(x + sw, y + sh - sr);
  shape.quadraticCurveTo(x + sw, y + sh, x + sw - sr, y + sh);
  shape.lineTo(x + sr, y + sh);
  shape.quadraticCurveTo(x, y + sh, x, y + sh - sr);
  shape.lineTo(x, y + sr);
  shape.quadraticCurveTo(x, y, x + sr, y);

  const depth = Math.max(0.001, d - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

function addMesh(group, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function addBox(group, w, h, d, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  return addMesh(group, new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
}

function addRoundedBox(group, w, h, d, radius, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  return addMesh(group, roundedBoxGeometry(w, h, d, radius), mat, x, y, z, rx, ry, rz);
}

function addCylinder(group, radiusTop, radiusBottom, length, segments, mat, x = 0, y = 0, z = 0, axis = 'y') {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, length, segments, 1),
    mat
  );
  mesh.position.set(x, y, z);
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  else if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  group.add(mesh);
  return mesh;
}

function addLimb(group, from, to, rFrom, rTo, mat, sides = 10) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTo, rFrom, len, sides, 1),
    mat
  );
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
  group.add(mesh);
  return mesh;
}

function addJoint(group, point, radius, mat) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 9), mat);
  mesh.position.copy(point);
  mesh.scale.set(1, 0.88, 1);
  group.add(mesh);
  return mesh;
}

function addCapsuleBetween(group, from, to, radius, mat, sides = 9) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = Math.max(0.001, dir.length() - radius * 2);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 3, sides), mat);
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
  group.add(mesh);
  return mesh;
}

function addRing(group, from, to, t, radius, tube, mat) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 16), mat);
  ring.position.copy(from).lerp(to, t);
  ring.quaternion.setFromUnitVectors(Z_AXIS, dir.normalize());
  group.add(ring);
  return ring;
}

function addRail(group, zRear, zFront, y, mat = MAT.metalDark) {
  const len = zRear - zFront;
  addBox(group, 0.034, 0.012, len, mat, 0, y, (zRear + zFront) * 0.5);
  for (let z = zRear - 0.021; z > zFront + 0.01; z -= 0.043) {
    addBox(group, 0.044, 0.007, 0.018, MAT.metal, 0, y + 0.009, z);
  }
}

function addSideScrew(group, x, y, z, radius = 0.0045) {
  addCylinder(group, radius, radius, 0.006, 10, MAT.metalBright, x, y, z, 'x');
}

function addSlingLoop(group, x, y, z, radius = 0.012) {
  const loop = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.0028, 5, 12), MAT.metalDark);
  loop.position.set(x, y, z);
  loop.rotation.y = Math.PI / 2;
  group.add(loop);
  return loop;
}

// Extrudes a side-on (z/y) silhouette across the weapon's width, which gives
// stocks and grips a shaped profile instead of reading as stacked boxes.
function addProfile(group, points, thickness, mat, x = 0) {
  const shape = new THREE.Shape();
  points.forEach(([z, y], i) => {
    if (i === 0) shape.moveTo(z, y);
    else shape.lineTo(z, y);
  });
  shape.closePath();

  const bevel = 0.004;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness - bevel * 2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 2,
  });
  geo.translate(0, 0, -(thickness - bevel * 2) / 2);
  geo.rotateY(-Math.PI / 2);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = x;
  group.add(mesh);
  return mesh;
}

/* ------------------------------------------------------------------ */
/* Hands and arms                                                      */
/* ------------------------------------------------------------------ */

function buildGripHand(x, y, z, rx = 0.28, rz = -0.08) {
  const hand = new THREE.Group();
  hand.position.set(x, y, z);
  hand.rotation.set(rx, 0, rz);

  addRoundedBox(hand, 0.046, 0.078, 0.082, 0.013, MAT.glove, 0, 0, 0);
  addRoundedBox(hand, 0.012, 0.05, 0.068, 0.005, MAT.glovePanel, -0.025, -0.005, -0.004);

  for (let i = 0; i < 4; i++) {
    const fy = -0.026 - i * 0.0225;
    addCapsuleBetween(
      hand,
      V(0.018, fy, 0.018),
      V(-0.052, fy - 0.004, -0.018),
      0.0095,
      MAT.glove
    );
    addCapsuleBetween(
      hand,
      V(-0.052, fy - 0.004, -0.018),
      V(-0.064, fy - 0.013, -0.052),
      0.0085,
      MAT.glove
    );
    addRoundedBox(hand, 0.026, 0.012, 0.03, 0.006, MAT.glovePanel, 0.022, fy + 0.008, 0.008);
  }

  addCapsuleBetween(
    hand,
    V(0.018, 0.036, 0.018),
    V(-0.042, 0.026, -0.006),
    0.011,
    MAT.glove
  );
  addCapsuleBetween(
    hand,
    V(-0.042, 0.026, -0.006),
    V(-0.058, 0.012, -0.035),
    0.009,
    MAT.glove
  );

  addRing(hand, V(0, -0.045, 0), V(0, 0.042, 0), 0.12, 0.031, 0.0055, MAT.cuff);
  return hand;
}

function buildSupportHand(x, y, z, width = 0.078, thumbZ = -0.04) {
  const hand = new THREE.Group();
  hand.position.set(x, y, z);
  hand.rotation.z = 0.06;

  addRoundedBox(hand, 0.044, 0.072, 0.112, 0.014, MAT.glove, 0, 0, 0);
  addRoundedBox(hand, 0.012, 0.052, 0.086, 0.005, MAT.glovePanel, -0.025, 0.002, -0.002);

  for (let i = 0; i < 4; i++) {
    const fz = -0.043 + i * 0.027;
    addCapsuleBetween(
      hand,
      V(0.003, -0.008, fz),
      V(0.018, -0.054, fz - 0.002),
      0.0092,
      MAT.glove
    );
    addCapsuleBetween(
      hand,
      V(0.018, -0.054, fz - 0.002),
      V(width, -0.024, fz - 0.004),
      0.0084,
      MAT.glove
    );
    addRoundedBox(hand, 0.012, 0.018, 0.03, 0.005, MAT.glovePanel, 0.009, -0.03, fz);
  }

  addCapsuleBetween(
    hand,
    V(-0.006, 0.024, thumbZ),
    V(0.018, 0.082, thumbZ + 0.025),
    0.011,
    MAT.glove
  );
  addCapsuleBetween(
    hand,
    V(0.018, 0.082, thumbZ + 0.025),
    V(0.058, 0.078, thumbZ + 0.05),
    0.009,
    MAT.glove
  );

  addRing(hand, V(0, -0.055, 0), V(0, 0.035, 0), 0.14, 0.03, 0.0055, MAT.cuff);
  return hand;
}

function addArm(group, wrist, elbow, shoulder) {
  addLimb(group, wrist, elbow, 0.044, 0.061, MAT.sleeve);
  addLimb(group, elbow, shoulder, 0.064, 0.088, MAT.sleeveDark);
  addJoint(group, elbow, 0.064, MAT.sleeve);
  addRing(group, wrist, elbow, 0.1, 0.052, 0.0065, MAT.cuff);
  addRing(group, wrist, elbow, 0.46, 0.052, 0.0045, MAT.sleeveFold);
  addRing(group, wrist, elbow, 0.68, 0.056, 0.0045, MAT.sleeveFold);
  addRing(group, elbow, shoulder, 0.28, 0.073, 0.0055, MAT.sleeveFold);
}

function addRifleArms(group) {
  group.add(buildGripHand(0.048, -0.132, 0.088));
  group.add(buildSupportHand(-0.052, -0.078, -0.43, 0.08, -0.04));

  addArm(
    group,
    V(0.05, -0.195, 0.105),
    V(0.17, -0.48, 0.36),
    V(0.38, -0.97, 0.66)
  );
  addArm(
    group,
    V(-0.06, -0.145, -0.42),
    V(-0.21, -0.47, 0.03),
    V(-0.44, -0.97, 0.43)
  );
}

function addCompactArms(group) {
  group.add(buildGripHand(0.046, -0.135, 0.07));
  group.add(buildSupportHand(-0.05, -0.155, -0.3, 0.072, -0.035));

  addArm(
    group,
    V(0.048, -0.195, 0.085),
    V(0.16, -0.49, 0.33),
    V(0.38, -0.98, 0.64)
  );
  addArm(
    group,
    V(-0.058, -0.235, -0.3),
    V(-0.21, -0.53, 0.03),
    V(-0.43, -0.99, 0.44)
  );
}

/* ------------------------------------------------------------------ */
/* Muzzle flash                                                        */
/* ------------------------------------------------------------------ */

let sharedFlashTexture = null;

function flashTexture() {
  if (sharedFlashTexture) return sharedFlashTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,240,1)');
  g.addColorStop(0.25, 'rgba(255,210,130,0.95)');
  g.addColorStop(0.55, 'rgba(255,120,30,0.5)');
  g.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  sharedFlashTexture = tex;
  return tex;
}

function addMuzzleFlash(group, z, scale = 0.5) {
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({
    map: flashTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  }));
  flash.position.set(0, 0.018, z);
  flash.scale.setScalar(scale);
  flash.visible = false;
  group.add(flash);

  const flashLight = new THREE.PointLight(0xffb060, 0, 14, 2);
  flashLight.position.set(0, 0.02, z + 0.05);
  group.add(flashLight);

  return { flash, flashLight };
}

/* ------------------------------------------------------------------ */
/* VK-7 "Scrapper" — assault rifle                                     */
/* ------------------------------------------------------------------ */

function buildRifle() {
  const group = new THREE.Group();

  // receiver and lower
  addRoundedBox(group, 0.088, 0.1, 0.39, 0.012, MAT.metal, 0, 0.012, -0.025);
  addRoundedBox(group, 0.078, 0.052, 0.37, 0.009, MAT.metalDark, 0, 0.076, -0.035);
  addRoundedBox(group, 0.09, 0.068, 0.23, 0.012, MAT.metal, 0, -0.052, 0.012);
  addBox(group, 0.092, 0.012, 0.2, MAT.metalDark, 0, -0.083, 0.02);

  // receiver furniture / controls on the visible left side
  addRoundedBox(group, 0.002, 0.038, 0.105, 0.002, MAT.metalDark, -0.0455, 0.045, 0.035);
  addRoundedBox(group, 0.002, 0.018, 0.058, 0.002, MAT.void, -0.0466, 0.048, 0.033);
  addSideScrew(group, -0.047, 0.01, 0.115, 0.004);
  addSideScrew(group, -0.047, 0.01, 0.065, 0.004);
  addCylinder(group, 0.0085, 0.0085, 0.014, 12, MAT.metalBright, -0.047, 0.008, -0.115, 'x');
  addBox(group, 0.004, 0.022, 0.012, MAT.metalBright, -0.047, -0.018, 0.103);
  addBox(group, 0.003, 0.012, 0.12, MAT.accent, -0.0475, 0.062, -0.055);
  addSlingLoop(group, -0.047, -0.018, 0.15, 0.011);
  addSlingLoop(group, -0.047, -0.018, -0.13, 0.011);

  // handguard
  addRoundedBox(group, 0.082, 0.13, 0.335, 0.014, MAT.polymer, 0, 0.025, -0.39);
  addRoundedBox(group, 0.086, 0.132, 0.016, 0.005, MAT.metalDark, 0, 0.024, -0.563);
  addRoundedBox(group, 0.003, 0.012, 0.11, 0.001, MAT.accentDim, -0.0425, 0.052, -0.42);

  // M-LOK slots on the visible side
  for (let i = 0; i < 5; i++) {
    addRoundedBox(group, 0.0015, 0.022, 0.045, 0.001, MAT.void, -0.0422, 0.012, -0.285 - i * 0.059);
  }
  addSideScrew(group, -0.043, 0.061, -0.26, 0.004);
  addSideScrew(group, -0.043, 0.061, -0.505, 0.004);

  // top rail and sights
  addRail(group, 0.255, -0.55, 0.103);
  addRoundedBox(group, 0.04, 0.022, 0.05, 0.004, MAT.metalDark, 0, 0.118, 0.045);
  for (const side of [-1, 1]) {
    addRoundedBox(group, 0.01, 0.048, 0.017, 0.002, MAT.metalDark, side * 0.018, 0.14, 0.045);
  }
  const aperture = new THREE.Mesh(new THREE.TorusGeometry(0.0115, 0.0022, 6, 16), MAT.metalBright);
  aperture.position.set(0, 0.14, 0.045);
  group.add(aperture);

  addRoundedBox(group, 0.038, 0.02, 0.04, 0.003, MAT.metalDark, 0, 0.118, -0.515);
  for (const side of [-1, 1]) {
    addRoundedBox(group, 0.009, 0.052, 0.016, 0.002, MAT.metalDark, side * 0.016, 0.14, -0.515);
  }
  addBox(group, 0.0045, 0.04, 0.006, MAT.metalBright, 0, 0.138, -0.516);
  addBox(group, 0.0035, 0.009, 0.006, MAT.accent, 0, 0.155, -0.516);

  // charging handle, ejection details
  addRoundedBox(group, 0.05, 0.012, 0.027, 0.003, MAT.metalDark, 0, 0.094, 0.145);
  addBox(group, 0.07, 0.008, 0.015, MAT.metalDark, 0, 0.094, 0.16);
  addRoundedBox(group, 0.003, 0.022, 0.09, 0.002, MAT.void, 0.0455, 0.045, 0.02);

  // barrel, gas system, brake
  addCylinder(group, 0.005, 0.005, 0.3, 8, MAT.metalBright, 0, 0.058, -0.36, 'z');
  addRoundedBox(group, 0.056, 0.055, 0.055, 0.006, MAT.metalDark, 0, 0.025, -0.552);
  addCylinder(group, 0.0115, 0.0125, 0.33, 16, MAT.metalDark, 0, 0.025, -0.73, 'z');
  addCylinder(group, 0.022, 0.0235, 0.095, 16, MAT.metal, 0, 0.025, -0.935, 'z');
  for (let i = 0; i < 3; i++) {
    addCylinder(group, 0.0238, 0.0238, 0.0055, 16, MAT.metalDark, 0, 0.025, -0.907 - i * 0.026, 'z');
    addBox(group, 0.046, 0.006, 0.011, MAT.void, 0, 0.025, -0.909 - i * 0.026);
  }
  addCylinder(group, 0.019, 0.019, 0.009, 16, MAT.accentDim, 0, 0.025, -0.987, 'z');

  // magazine
  const mag = new THREE.Group();
  mag.position.set(0, -0.075, -0.012);
  addRoundedBox(mag, 0.054, 0.11, 0.085, 0.008, MAT.polymer, 0, -0.052, 0, -0.08);
  addRoundedBox(mag, 0.052, 0.095, 0.09, 0.008, MAT.polymer, 0, -0.145, -0.013, -0.18);
  addRoundedBox(mag, 0.062, 0.015, 0.105, 0.004, MAT.metalDark, 0, -0.199, -0.022, -0.22);
  for (let i = 0; i < 3; i++) {
    addBox(mag, 0.0015, 0.013, 0.06, MAT.void, -0.028, -0.06 - i * 0.03, -0.012);
  }
  group.add(mag);

  // pistol grip and trigger
  const grip = new THREE.Group();
  grip.position.set(0, -0.06, 0.085);
  grip.rotation.x = 0.32;
  addRoundedBox(grip, 0.048, 0.142, 0.066, 0.009, MAT.polymer, 0, -0.061, 0);
  for (let i = 0; i < 4; i++) {
    addBox(grip, 0.05, 0.006, 0.068, MAT.rubber, 0, -0.035 - i * 0.028, -0.002);
  }
  addRoundedBox(grip, 0.053, 0.014, 0.071, 0.004, MAT.metalDark, 0, -0.136, 0);
  group.add(grip);

  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0042, 6, 16), MAT.metal);
  guard.position.set(0, -0.077, 0.057);
  guard.rotation.y = Math.PI / 2;
  group.add(guard);
  addBox(group, 0.006, 0.028, 0.007, MAT.metalBright, 0, -0.073, 0.047, 0.22);

  // stock
  addCylinder(group, 0.019, 0.019, 0.21, 12, MAT.metalDark, 0, 0.044, 0.255, 'z');
  addRing(group, V(0, 0.044, 0.16), V(0, 0.044, 0.36), 0.08, 0.022, 0.0045, MAT.metalBright);
  addProfile(group, [
    [0.19, 0.082],
    [0.3, 0.076],
    [0.4, 0.052],
    [0.425, 0.043],
    [0.425, -0.046],
    [0.35, -0.06],
    [0.27, -0.098],
    [0.2, -0.083],
  ], 0.058, MAT.polymerAlt);
  addRoundedBox(group, 0.052, 0.022, 0.082, 0.006, MAT.polymer, 0, 0.084, 0.294);
  addRoundedBox(group, 0.058, 0.092, 0.014, 0.005, MAT.rubber, 0, 0.016, 0.431);
  addBox(group, 0.002, 0.018, 0.052, MAT.void, -0.03, 0.02, 0.3);
  addSideScrew(group, -0.031, 0.024, 0.335, 0.004);
  addSlingLoop(group, -0.031, 0.001, 0.365, 0.009);

  addRifleArms(group);

  const { flash, flashLight } = addMuzzleFlash(group, -1.01, 0.54);

  return { group, flash, flashLight, mag, pump: null };
}

/* ------------------------------------------------------------------ */
/* VX-4 "Hornet" — compact SMG                                         */
/* ------------------------------------------------------------------ */

function buildSMG() {
  const group = new THREE.Group();

  addRoundedBox(group, 0.084, 0.094, 0.29, 0.012, MAT.metal, 0, 0.012, -0.01);
  addRoundedBox(group, 0.074, 0.048, 0.275, 0.008, MAT.metalDark, 0, 0.073, -0.018);
  addRoundedBox(group, 0.086, 0.062, 0.2, 0.011, MAT.polymer, 0, -0.052, 0.018);
  addRoundedBox(group, 0.003, 0.038, 0.11, 0.002, MAT.metalDark, -0.0435, 0.045, 0.03);
  addBox(group, 0.003, 0.011, 0.12, MAT.accent, -0.0445, 0.012, -0.035);
  addSideScrew(group, -0.045, 0.01, 0.095);
  addSlingLoop(group, -0.045, -0.02, 0.135, 0.01);

  // short handguard with angled vent cuts
  addRoundedBox(group, 0.078, 0.105, 0.19, 0.012, MAT.polymer, 0, 0.018, -0.245);
  addRoundedBox(group, 0.082, 0.11, 0.014, 0.004, MAT.metalDark, 0, 0.018, -0.342);
  for (let i = 0; i < 4; i++) {
    addRoundedBox(group, 0.0015, 0.018, 0.036, 0.001, MAT.void, -0.0405, 0.022, -0.18 - i * 0.041);
  }
  addRoundedBox(group, 0.003, 0.009, 0.08, 0.001, MAT.accentDim, -0.0408, 0.061, -0.235);

  // rail + micro red dot
  addRail(group, 0.155, -0.34, 0.101);
  addRoundedBox(group, 0.045, 0.031, 0.07, 0.006, MAT.metalDark, 0, 0.118, -0.065);
  addBox(group, 0.036, 0.022, 0.062, MAT.metal, 0, 0.118, -0.065, -0.04);
  for (const z of [-0.035, -0.095]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 7, 18), MAT.metalDark);
    ring.position.set(0, 0.137, z);
    group.add(ring);
  }
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.021, 20), MAT.lens);
  lens.position.set(0, 0.137, -0.096);
  group.add(lens);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 8, 6), MAT.redDot);
  dot.position.set(0, 0.137, -0.09);
  group.add(dot);
  addCylinder(group, 0.009, 0.009, 0.015, 12, MAT.metalBright, -0.032, 0.12, -0.065, 'x');
  addBox(group, 0.006, 0.024, 0.03, MAT.metalBright, -0.045, 0.12, -0.065);

  // suppressor and barrel
  addCylinder(group, 0.009, 0.009, 0.22, 12, MAT.metalDark, 0, 0.023, -0.43, 'z');
  addCylinder(group, 0.0255, 0.027, 0.185, 18, MAT.metal, 0, 0.023, -0.535, 'z');
  for (let i = 0; i < 5; i++) {
    addCylinder(group, 0.0273, 0.0273, 0.005, 18, MAT.metalDark, 0, 0.023, -0.46 - i * 0.036, 'z');
  }
  addCylinder(group, 0.025, 0.025, 0.008, 18, MAT.accentDim, 0, 0.023, -0.633, 'z');

  // vertical foregrip
  addCylinder(group, 0.021, 0.024, 0.105, 12, MAT.polymer, 0, -0.09, -0.3, 'y');
  addCylinder(group, 0.024, 0.024, 0.012, 12, MAT.metalDark, 0, -0.14, -0.3, 'y');
  addRing(group, V(0, -0.09, -0.3), V(0, 0.02, -0.3), 0.18, 0.023, 0.004, MAT.sleeveFold);

  // magazine — longer curved stick
  const mag = new THREE.Group();
  mag.position.set(0, -0.075, -0.025);
  mag.rotation.x = 0.05;
  addRoundedBox(mag, 0.052, 0.13, 0.078, 0.007, MAT.polymer, 0, -0.065, 0, -0.08);
  addRoundedBox(mag, 0.05, 0.11, 0.083, 0.007, MAT.polymer, 0, -0.18, -0.014, -0.16);
  addRoundedBox(mag, 0.058, 0.014, 0.096, 0.004, MAT.metalDark, 0, -0.244, -0.026, -0.2);
  for (let i = 0; i < 4; i++) {
    addBox(mag, 0.0015, 0.012, 0.052, MAT.void, -0.027, -0.08 - i * 0.033, -0.012);
  }
  group.add(mag);

  // grip + guard
  const grip = new THREE.Group();
  grip.position.set(0, -0.06, 0.075);
  grip.rotation.x = 0.3;
  addRoundedBox(grip, 0.048, 0.137, 0.065, 0.009, MAT.polymer, 0, -0.058, 0);
  for (let i = 0; i < 4; i++) {
    addBox(grip, 0.05, 0.006, 0.067, MAT.rubber, 0, -0.034 - i * 0.027, 0);
  }
  addRoundedBox(grip, 0.052, 0.013, 0.07, 0.004, MAT.metalDark, 0, -0.131, 0);
  group.add(grip);

  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.004, 6, 16), MAT.metal);
  guard.position.set(0, -0.075, 0.05);
  guard.rotation.y = Math.PI / 2;
  group.add(guard);
  addBox(group, 0.006, 0.026, 0.007, MAT.metalBright, 0, -0.071, 0.042, 0.22);

  // folding wire stock
  addCylinder(group, 0.017, 0.017, 0.13, 10, MAT.metalDark, 0, 0.036, 0.19, 'z');
  for (const side of [-1, 1]) {
    addCylinder(group, 0.0055, 0.0055, 0.18, 8, MAT.metalBright, side * 0.026, 0.045, 0.265, 'z');
    addCylinder(group, 0.0055, 0.0055, 0.05, 8, MAT.metalBright, side * 0.026, 0.02, 0.19, 'y');
  }
  addRoundedBox(group, 0.045, 0.062, 0.014, 0.005, MAT.rubber, 0, 0.038, 0.353);
  addRing(group, V(0, 0.036, 0.18), V(0, 0.036, 0.3), 0.08, 0.024, 0.004, MAT.metalBright);

  addCompactArms(group);

  const { flash, flashLight } = addMuzzleFlash(group, -0.655, 0.42);

  return { group, flash, flashLight, mag, pump: null };
}

/* ------------------------------------------------------------------ */
/* C-9 "Cinder" — pump shotgun                                         */
/* ------------------------------------------------------------------ */

function buildShotgun() {
  const group = new THREE.Group();

  addRoundedBox(group, 0.09, 0.105, 0.26, 0.014, MAT.metal, 0, 0.015, -0.005);
  addRoundedBox(group, 0.08, 0.05, 0.245, 0.008, MAT.metalDark, 0, 0.082, -0.012);
  addRoundedBox(group, 0.092, 0.067, 0.19, 0.012, MAT.polymer, 0, -0.052, 0.02);
  addBox(group, 0.003, 0.013, 0.13, MAT.accent, -0.0465, 0.025, -0.02);
  addRoundedBox(group, 0.003, 0.04, 0.12, 0.002, MAT.metalDark, -0.0465, 0.055, 0.02);
  addSideScrew(group, -0.047, 0.005, 0.095);
  addSlingLoop(group, -0.047, -0.02, 0.14, 0.011);

  // barrel and magazine tube
  addCylinder(group, 0.0225, 0.0235, 0.58, 18, MAT.metalDark, 0, 0.045, -0.36, 'z');
  addCylinder(group, 0.0175, 0.0185, 0.46, 16, MAT.metal, 0, -0.008, -0.32, 'z');
  addCylinder(group, 0.029, 0.03, 0.07, 18, MAT.metal, 0, 0.045, -0.67, 'z');
  for (let i = 0; i < 2; i++) {
    addCylinder(group, 0.0305, 0.0305, 0.0055, 18, MAT.metalDark, 0, 0.045, -0.652 - i * 0.026, 'z');
  }
  addCylinder(group, 0.026, 0.026, 0.007, 18, MAT.accentDim, 0, 0.045, -0.708, 'z');
  addBox(group, 0.006, 0.005, 0.5, MAT.metalBright, 0, 0.073, -0.33); // vent rib

  // pump handguard
  addRoundedBox(group, 0.078, 0.074, 0.17, 0.014, MAT.polymerAlt, 0, -0.006, -0.355);
  for (let i = 0; i < 6; i++) {
    addBox(group, 0.082, 0.008, 0.012, MAT.rubber, 0, -0.006, -0.295 - i * 0.025);
  }
  addRoundedBox(group, 0.084, 0.08, 0.015, 0.004, MAT.metalDark, 0, -0.006, -0.445);

  // heat shield / shell carrier on receiver
  for (let i = 0; i < 3; i++) {
    addCylinder(group, 0.009, 0.009, 0.045, 10, MAT.shell, -0.053, 0.002, 0.01 + i * 0.027, 'y');
  }
  addBox(group, 0.006, 0.018, 0.094, MAT.metalDark, -0.052, -0.008, 0.028);

  // top rail and sights
  addRail(group, 0.12, -0.52, 0.108);
  addRoundedBox(group, 0.042, 0.024, 0.045, 0.004, MAT.metalDark, 0, 0.124, 0.04);
  for (const side of [-1, 1]) {
    addRoundedBox(group, 0.009, 0.042, 0.016, 0.002, MAT.metalDark, side * 0.017, 0.142, 0.04);
  }
  addRoundedBox(group, 0.037, 0.02, 0.035, 0.003, MAT.metalDark, 0, 0.123, -0.555);
  addCylinder(group, 0.006, 0.006, 0.008, 10, MAT.accent, 0, 0.145, -0.558, 'z');
  addBox(group, 0.005, 0.011, 0.006, MAT.metalBright, 0, 0.145, -0.57);

  // magazine follower / loading gate details
  addBox(group, 0.006, 0.026, 0.04, MAT.metalDark, 0.047, -0.02, 0.045);
  addRoundedBox(group, 0.003, 0.018, 0.05, 0.002, MAT.void, 0.047, -0.01, 0.045);

  // pistol grip and trigger
  const grip = new THREE.Group();
  grip.position.set(0, -0.06, 0.095);
  grip.rotation.x = 0.28;
  addRoundedBox(grip, 0.05, 0.15, 0.07, 0.01, MAT.polymer, 0, -0.065, 0);
  for (let i = 0; i < 4; i++) {
    addBox(grip, 0.052, 0.006, 0.072, MAT.rubber, 0, -0.038 - i * 0.029, 0);
  }
  addRoundedBox(grip, 0.054, 0.014, 0.075, 0.004, MAT.metalDark, 0, -0.144, 0);
  group.add(grip);

  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.039, 0.0045, 6, 16), MAT.metal);
  guard.position.set(0, -0.08, 0.06);
  guard.rotation.y = Math.PI / 2;
  group.add(guard);
  addBox(group, 0.006, 0.03, 0.008, MAT.metalBright, 0, -0.076, 0.05, 0.22);

  // wood stock
  addCylinder(group, 0.021, 0.021, 0.16, 10, MAT.metalDark, 0, 0.05, 0.22, 'z');
  addProfile(group, [
    [0.19, 0.086],
    [0.28, 0.104],
    [0.38, 0.078],
    [0.425, 0.056],
    [0.425, -0.058],
    [0.34, -0.075],
    [0.26, -0.122],
    [0.2, -0.102],
  ], 0.06, MAT.wood);
  addRoundedBox(group, 0.05, 0.024, 0.078, 0.007, MAT.wood, 0, 0.083, 0.292);
  addRoundedBox(group, 0.058, 0.098, 0.014, 0.005, MAT.rubber, 0, 0.002, 0.431);
  addBox(group, 0.002, 0.022, 0.052, MAT.void, -0.031, 0.013, 0.305);
  addSlingLoop(group, -0.031, -0.01, 0.36, 0.009);

  group.add(buildGripHand(0.048, -0.132, 0.098));
  group.add(buildSupportHand(-0.052, -0.09, -0.355, 0.078, -0.04));

  addArm(
    group,
    V(0.05, -0.195, 0.115),
    V(0.17, -0.49, 0.37),
    V(0.38, -0.98, 0.67)
  );
  addArm(
    group,
    V(-0.06, -0.155, -0.345),
    V(-0.22, -0.49, 0.04),
    V(-0.45, -0.98, 0.44)
  );

  const { flash, flashLight } = addMuzzleFlash(group, -0.735, 0.7);

  return { group, flash, flashLight, mag: null, pump: null };
}

/* ------------------------------------------------------------------ */
/* Weapon definitions                                                  */
/* ------------------------------------------------------------------ */

export const WEAPON_DEFS = [
  {
    id: 'rifle',
    slot: 0,
    name: 'VK-7 "SCRAPPER"',
    shortName: 'VK-7',
    hud: 'BALLISTIC // AUTO',
    sound: 'rifle',
    magSize: 30,
    reserveMax: 150,
    reloadTime: 1.85,
    fireDelay: 0.098,
    damage: 30,
    pellets: 1,
    baseSpread: 0.0035,
    bloomSpread: 0.0032,
    adsSpread: 0.32,
    bloomPerShot: 0.34,
    recoilPitch: 0.0072,
    recoilYaw: 0.0045,
    kick: 1,
    flashTime: 0.055,
    flashScale: 1,
    adsFov: 52,
    tracerColor: 0xfff2cf,
    scale: 0.9,
    base: [0.32, -0.2, -1.04],
    ads: [0, -0.122, -0.9],
    build: buildRifle,
  },
  {
    id: 'smg',
    slot: 1,
    name: 'VX-4 "HORNET"',
    shortName: 'VX-4',
    hud: '9MM // AUTO',
    sound: 'smg',
    magSize: 36,
    reserveMax: 180,
    reloadTime: 1.55,
    fireDelay: 0.072,
    damage: 21,
    pellets: 1,
    baseSpread: 0.0058,
    bloomSpread: 0.004,
    adsSpread: 0.36,
    bloomPerShot: 0.22,
    recoilPitch: 0.0048,
    recoilYaw: 0.0048,
    kick: 0.72,
    flashTime: 0.04,
    flashScale: 0.8,
    adsFov: 58,
    tracerColor: 0xffe1a3,
    scale: 0.86,
    base: [0.3, -0.19, -0.94],
    ads: [0, -0.122, -0.85],
    build: buildSMG,
  },
  {
    id: 'shotgun',
    slot: 2,
    name: 'C-9 "CINDER"',
    shortName: 'C-9',
    hud: '12 GA // PUMP',
    sound: 'shotgun',
    magSize: 6,
    reserveMax: 36,
    reloadTime: 2.25,
    fireDelay: 0.66,
    damage: 12,
    pellets: 8,
    baseSpread: 0.044,
    bloomSpread: 0.012,
    adsSpread: 0.62,
    bloomPerShot: 0.2,
    recoilPitch: 0.027,
    recoilYaw: 0.008,
    kick: 1.7,
    flashTime: 0.075,
    flashScale: 1.35,
    adsFov: 62,
    tracerColor: 0xffc27a,
    scale: 0.92,
    base: [0.33, -0.21, -1.0],
    ads: [0, -0.122, -0.9],
    build: buildShotgun,
  },
];
