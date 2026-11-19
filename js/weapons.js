// ============ WEAPONS: FIRST-PERSON VIEWMODELS ============
import * as THREE from 'three';
import { WEAPONS, SKINS } from './config.js';

function mat(color, metalness = 0.6, roughness = 0.4, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
}

export function buildWeaponModel(weaponId, skinId = 'camo_standard', operatorAccent = 0x5ce8d4) {
  const spec = WEAPONS[weaponId];
  const skin = SKINS[skinId] || SKINS.camo_standard;
  const c = skin.colors;
  const group = new THREE.Group();
  const bodyMat = mat(c.body, c.metalness, c.roughness, { emissive: new THREE.Color(c.emissive), emissiveIntensity: c.emissiveIntensity });
  const accentMat = mat(c.accent, 0.7, 0.3, { emissive: new THREE.Color(c.accent), emissiveIntensity: Math.min(1, c.emissiveIntensity + 0.15) });
  const darkMat = mat(0x0e1113, 0.7, 0.55);
  const polyMat = mat(0x1a1e20, 0.2, 0.85);
  const gloveMat = mat(0x22282a, 0.1, 0.9);
  const cuffMat = new THREE.MeshStandardMaterial({ color: operatorAccent, emissive: new THREE.Color(operatorAccent), emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.6 });

  const L = spec.model.len, B = spec.model.barrel;
  const y = 0, z = 0;

  const add = (geo, m, x, yy, zz, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, yy, zz);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = false;
    group.add(mesh);
    return mesh;
  };

  // main receiver
  add(new THREE.BoxGeometry(0.075, 0.095, L * 0.62), bodyMat, 0, y, z - L * 0.28);
  // upper rail
  add(new THREE.BoxGeometry(0.05, 0.035, L * 0.6), darkMat, 0, y + 0.062, z - L * 0.28);
  // top rail teeth
  for (let i = 0; i < 7; i++) {
    add(new THREE.BoxGeometry(0.054, 0.012, 0.022), accentMat, 0, y + 0.083, z - L * 0.06 - i * 0.045);
  }
  // handguard
  add(new THREE.BoxGeometry(0.062, 0.07, B * 0.9), bodyMat, 0, y - 0.005, z - L * 0.62 - B * 0.36);
  for (let i = 0; i < 4; i++) {
    add(new THREE.BoxGeometry(0.066, 0.055, 0.026), darkMat, 0, y - 0.005, z - L * 0.66 - i * B * 0.2);
  }
  // barrel
  const barrelGeo = new THREE.CylinderGeometry(0.016, 0.018, B * 0.7, 10);
  add(barrelGeo, darkMat, 0, y + 0.005, z - L * 0.62 - B * 0.76, Math.PI / 2, 0, 0);
  // muzzle brake
  const brake = add(new THREE.CylinderGeometry(0.026, 0.026, 0.075, 8), accentMat, 0, y + 0.005, z - L * 0.62 - B * 1.05, Math.PI / 2, 0, 0);
  for (let i = 0; i < 2; i++) {
    add(new THREE.BoxGeometry(0.058, 0.018, 0.02), darkMat, 0, y + 0.005, z - L * 0.62 - B * 1.0 - i * 0.028);
  }
  // stock
  if (spec.model.stock > 0) {
    add(new THREE.BoxGeometry(0.05, 0.075, spec.model.stock), bodyMat, 0, y - 0.01, z + spec.model.stock * 0.5 + 0.02);
    add(new THREE.BoxGeometry(0.058, 0.11, 0.06), darkMat, 0, y - 0.025, z + spec.model.stock + 0.03);
  }
  // pistol grip
  add(new THREE.BoxGeometry(0.048, 0.13, 0.062), darkMat, 0, y - 0.105, z - 0.015, 0.26, 0, 0);
  // trigger guard
  add(new THREE.BoxGeometry(0.012, 0.012, 0.09), darkMat, 0, y - 0.062, z - 0.09);
  // magazine
  const magH = spec.model.mag;
  const magGeo = new THREE.BoxGeometry(0.05, magH, 0.09);
  add(magGeo, polyMat, 0, y - 0.06 - magH / 2 + 0.04, z - 0.17, 0.16, 0, 0);
  add(new THREE.BoxGeometry(0.054, 0.02, 0.094), accentMat, 0, y - 0.06 - magH + 0.045, z - 0.185, 0.16, 0, 0);

  // foregrip
  add(new THREE.BoxGeometry(0.045, 0.09, 0.055), darkMat, 0, y - 0.07, z - L * 0.62 - B * 0.22, 0.15, 0, 0);

  // optic
  if (spec.model.sight) {
    // rail base
    add(new THREE.BoxGeometry(0.05, 0.03, 0.13), darkMat, 0, y + 0.1, z - L * 0.17);
    // holo frame
    const frame = add(new THREE.TorusGeometry(0.032, 0.006, 6, 16), accentMat, 0, y + 0.155, z - L * 0.17);
    frame.rotation.y = Math.PI / 2;
    // glass
    add(new THREE.CircleGeometry(0.028, 16), new THREE.MeshBasicMaterial({ color: 0x66e8dd, transparent: true, opacity: 0.18, side: THREE.DoubleSide }), 0, y + 0.155, z - L * 0.17, 0, Math.PI / 2, 0);
    // sight post
    add(new THREE.BoxGeometry(0.006, 0.02, 0.006), new THREE.MeshBasicMaterial({ color: 0xff5f52 }), 0, y + 0.15, z - L * 0.17);
  }
  if (weaponId === 'sniper') {
    // scope tube
    add(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 12), darkMat, 0, y + 0.15, z - L * 0.25, Math.PI / 2, 0, 0);
    add(new THREE.CylinderGeometry(0.05, 0.038, 0.07, 12), accentMat, 0, y + 0.15, z - L * 0.25 - 0.17, Math.PI / 2, 0, 0);
    add(new THREE.CylinderGeometry(0.038, 0.05, 0.07, 12), accentMat, 0, y + 0.15, z - L * 0.25 + 0.17, Math.PI / 2, 0, 0);
    // bipod
    add(new THREE.BoxGeometry(0.012, 0.16, 0.012), darkMat, -0.035, y - 0.12, z - L * 0.62 - B * 0.7, 0, 0, 0.35);
    add(new THREE.BoxGeometry(0.012, 0.16, 0.012), darkMat, 0.035, y - 0.12, z - L * 0.62 - B * 0.7, 0, 0, -0.35);
  }
  if (weaponId === 'shotgun') {
    // pump
    add(new THREE.BoxGeometry(0.07, 0.06, 0.22), polyMat, 0, y - 0.03, z - L * 0.62 - B * 0.35);
    // shell tube
    add(new THREE.CylinderGeometry(0.018, 0.018, B * 0.8, 8), darkMat, 0, y - 0.045, z - L * 0.62 - B * 0.5, Math.PI / 2, 0, 0);
  }

  // hands / gloves
  const handR = add(new THREE.BoxGeometry(0.062, 0.1, 0.09), gloveMat, 0.018, y - 0.115, z - 0.01, 0.2, 0, 0);
  add(new THREE.BoxGeometry(0.07, 0.035, 0.075), cuffMat, 0.024, y - 0.165, z + 0.01, 0.2, 0, 0);
  const handL = add(new THREE.BoxGeometry(0.06, 0.09, 0.11), gloveMat, 0.01, y - 0.045, z - L * 0.62 - B * 0.18, 0, 0, 0);
  add(new THREE.BoxGeometry(0.07, 0.035, 0.085), cuffMat, 0.01, y - 0.09, z - L * 0.62 - B * 0.12, 0, 0, 0);

  // side details / glow strips
  add(new THREE.BoxGeometry(0.002, 0.012, L * 0.25), accentMat, 0.0385, y + 0.01, z - L * 0.3);
  add(new THREE.BoxGeometry(0.002, 0.012, L * 0.2), accentMat, -0.0385, y + 0.01, z - L * 0.33);

  const muzzle = new THREE.Vector3(0, y + 0.005, z - L * 0.62 - B * 1.12);

  group.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } });
  group.userData = { muzzle, bodyMat, accentMat, skin };
  return group;
}

export function buildBotGun(accent = 0xff5f52) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.6), mat(0x1a1e21, 0.7, 0.4));
  body.position.z = -0.3; g.add(body);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 8), mat(0x101214, 0.8, 0.3));
  barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.02, -0.68); g.add(barrel);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.08), mat(0x24282a, 0.4, 0.6));
  mag.position.set(0, -0.12, -0.22); g.add(mag);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.12), new THREE.MeshBasicMaterial({ color: accent }));
  glow.position.set(0, 0.05, -0.2); g.add(glow);
  return g;
}
