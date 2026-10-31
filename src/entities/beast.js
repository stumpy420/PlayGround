import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
const eyeMat = new THREE.MeshBasicMaterial({ vertexColors: true });

function paint(geo, hex) {
  const c = new THREE.Color(hex);
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
function add(list, geo, hex, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  geo.scale(scale[0], scale[1], scale[2]);
  if (rot[0] || rot[1] || rot[2]) geo.rotateX(rot[0]), geo.rotateY(rot[1]), geo.rotateZ(rot[2]);
  geo.translate(pos[0], pos[1], pos[2]);
  paint(geo, hex); list.push(geo);
}

const KINDS = {
  wolf: { body: '#9aa4ab', belly: '#d8dde0', dark: '#4f5a61', eye: '#ffcf6b', scale: 1.0, len: 1.5, height: 1.05, ears: 'point', tail: 0.8, snout: 0.5 },
  frostRat: { body: '#8a7c6a', belly: '#c9bca8', dark: '#4e4337', eye: '#ff8a5c', scale: 1.0, len: 0.8, height: 0.55, ears: 'round', tail: 0.9, snout: 0.5 },
  bear: { body: '#d4d9dc', belly: '#eef2f4', dark: '#7b858b', eye: '#ffb35c', scale: 1.0, len: 2.2, height: 1.5, ears: 'round', tail: 0.35, snout: 0.6 },
  deer: { body: '#9b7f61', belly: '#d8c9b4', dark: '#5c4631', eye: '#2a2018', scale: 1.0, len: 1.4, height: 1.2, ears: 'leaf', tail: 0.25, snout: 0.55 },
  rabbit: { body: '#d9d2c6', belly: '#f2ede4', dark: '#9c9184', eye: '#3a2b22', scale: 1.0, len: 0.5, height: 0.45, ears: 'long', tail: 0.3, snout: 0.3 },
};

export function createBeast(kind = 'wolf', colorOverride = null) {
  const def = KINDS[kind] || KINDS.wolf;
  const bodyColor = colorOverride || def.body;
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  const bodyLen = def.len, bodyH = def.height;
  const parts = [];
  // body
  add(parts, new THREE.SphereGeometry(0.36, 9, 7), bodyColor, [0, bodyH, 0], [0, 0, 0], [1.0, 0.9, bodyLen * 1.4]);
  add(parts, new THREE.SphereGeometry(0.3, 8, 6), def.belly, [0, bodyH - 0.12, 0.05], [0, 0, 0], [0.9, 0.7, bodyLen * 1.25]);
  // neck + head
  const head = new THREE.Group();
  head.position.set(0, bodyH + 0.28, bodyLen * 0.72);
  rig.add(head);
  const headParts = [];
  add(headParts, new THREE.SphereGeometry(0.3, 9, 7), bodyColor, [0, 0, 0], [0, 0, 0], [1, 0.92, 1.05]);
  add(headParts, new THREE.SphereGeometry(0.18, 7, 5), def.belly, [0, -0.08, 0.27], [0, 0, 0], [1.1, 0.7, 1.0]);
  add(headParts, new THREE.SphereGeometry(0.06, 5, 4), '#20171a', [0, -0.06, 0.43], [0, 0, 0], [1, 0.8, 0.8]);
  if (def.ears === 'point') {
    add(headParts, new THREE.ConeGeometry(0.1, 0.24, 4), def.dark, [-0.18, 0.26, -0.02], [0, 0, 0.2]);
    add(headParts, new THREE.ConeGeometry(0.1, 0.24, 4), def.dark, [0.18, 0.26, -0.02], [0, 0, -0.2]);
  } else if (def.ears === 'round') {
    add(headParts, new THREE.SphereGeometry(0.12, 6, 5), def.dark, [-0.2, 0.22, -0.04], [0, 0, 0], [1, 1, 0.4]);
    add(headParts, new THREE.SphereGeometry(0.12, 6, 5), def.dark, [0.2, 0.22, -0.04], [0, 0, 0], [1, 1, 0.4]);
  } else if (def.ears === 'long') {
    add(headParts, new THREE.CapsuleGeometry(0.06, 0.3, 3, 5), def.dark, [-0.12, 0.32, -0.02], [0.1, 0, 0.1]);
    add(headParts, new THREE.CapsuleGeometry(0.06, 0.3, 3, 5), def.dark, [0.12, 0.32, -0.02], [0.1, 0, -0.1]);
  } else {
    add(headParts, new THREE.ConeGeometry(0.13, 0.22, 4), def.dark, [-0.22, 0.18, 0], [0, 0, 0.8]);
    add(headParts, new THREE.ConeGeometry(0.13, 0.22, 4), def.dark, [0.22, 0.18, 0], [0, 0, -0.8]);
  }
  const headMesh = new THREE.Mesh(mergeGeometries(headParts, false), mat);
  headMesh.castShadow = true;
  head.add(headMesh);
  // eyes
  const eyeParts = [];
  add(eyeParts, new THREE.SphereGeometry(0.06, 6, 5), def.eye, [-0.14, 0.05, 0.24], [0, 0, 0], [1, 1, 0.5]);
  add(eyeParts, new THREE.SphereGeometry(0.06, 6, 5), def.eye, [0.14, 0.05, 0.24], [0, 0, 0], [1, 1, 0.5]);
  add(eyeParts, new THREE.SphereGeometry(0.028, 5, 4), '#090909', [-0.14, 0.05, 0.285], [0, 0, 0], [0.6, 1, 0.4]);
  add(eyeParts, new THREE.SphereGeometry(0.028, 5, 4), '#090909', [0.14, 0.05, 0.285], [0, 0, 0], [0.6, 1, 0.4]);
  head.add(new THREE.Mesh(mergeGeometries(eyeParts, false), eyeMat));

  const bodyMesh = new THREE.Mesh(mergeGeometries(parts, false), mat);
  bodyMesh.castShadow = true;
  rig.add(bodyMesh);

  // legs
  const legs = [];
  const legPositions = [
    [-0.28, bodyH - 0.18, bodyLen * 0.45], [0.28, bodyH - 0.18, bodyLen * 0.45],
    [-0.28, bodyH - 0.18, -bodyLen * 0.45], [0.28, bodyH - 0.18, -bodyLen * 0.45],
  ];
  for (const [x, y, z] of legPositions) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    const lp = [];
    add(lp, new THREE.CapsuleGeometry(0.09, 0.32, 3, 5), bodyColor, [0, -0.22, 0], [0, 0, 0], [1, 1, 1]);
    add(lp, new THREE.SphereGeometry(0.1, 6, 5), def.dark, [0, -0.45, 0.03], [0, 0, 0], [1, 0.5, 1.4]);
    const lm = new THREE.Mesh(mergeGeometries(lp, false), mat);
    lm.castShadow = true;
    pivot.add(lm);
    rig.add(pivot);
    legs.push(pivot);
  }
  // tail
  const tail = new THREE.Group();
  tail.position.set(0, bodyH + 0.02, -bodyLen * 0.68);
  const tp = [];
  add(tp, new THREE.CapsuleGeometry(0.07, def.tail * 0.9, 3, 5), def.dark, [0, -0.05, -def.tail * 0.4], [Math.PI * 0.42, 0, 0]);
  add(tp, new THREE.SphereGeometry(0.08, 5, 4), def.belly, [0, -0.1, -def.tail * 0.78]);
  const tm = new THREE.Mesh(mergeGeometries(tp, false), mat);
  tail.add(tm);
  rig.add(tail);

  const anim = { t: Math.random() * 10, phase: Math.random() * 10, dead: 0, attack: 0, hurt: 0 };
  root.scale.setScalar(def.scale);

  const beast = {
    root, rig, head, bodyMesh, legs, tail, anim, kind,
    playAttack() { anim.attack = 0.36; },
    playHurt() { anim.hurt = 0.25; },
    die() { anim.dead = 1; },
    update(dt, s = {}) {
      anim.t += dt;
      anim.attack = Math.max(0, anim.attack - dt);
      anim.hurt = Math.max(0, anim.hurt - dt);
      const speed = s.speed || 0;
      const moving = speed > 0.1;
      if (moving) anim.phase += dt * (6 + speed * 1.6);
      const sw = Math.sin(anim.phase);
      const gait = Math.min(1.2, speed / 3);
      legs[0].rotation.x = sw * 0.65 * gait;
      legs[1].rotation.x = -sw * 0.65 * gait;
      legs[2].rotation.x = -sw * 0.65 * gait;
      legs[3].rotation.x = sw * 0.65 * gait;
      rig.position.y = moving ? Math.abs(sw) * 0.04 * gait : Math.sin(anim.t * 1.8) * 0.01;
      head.rotation.x = Math.sin(anim.t * 1.2) * 0.04 - anim.attack * 0.3;
      head.rotation.y = s.lookYaw || 0;
      tail.rotation.y = Math.sin(anim.t * (moving ? 5 : 1.5)) * 0.3;
      tail.rotation.x = -0.2 + Math.sin(anim.t * 1.1) * 0.1;
      if (anim.dead) {
        rig.rotation.z += (1.5 - rig.rotation.z) * Math.min(1, dt * 4);
        rig.position.y += (-0.15 - rig.position.y) * Math.min(1, dt * 4);
      }
    },
  };
  root.userData.beast = beast;
  return beast;
}
