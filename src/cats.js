import * as THREE from "../vendor/three.module.min.js";

const TAU = Math.PI * 2;

function standard(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.9,
    metalness: opts.metalness ?? 0,
    flatShading: true,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}

function addMesh(parent, geometry, material, position, rotation, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  if (position) mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  parent.add(mesh);
  return mesh;
}

function makeSword(bladeColor = 0xcfd9dc, glow = 0x000000) {
  const group = new THREE.Group();
  const grip = addMesh(group, new THREE.CylinderGeometry(0.045, 0.055, 0.34, 5), standard(0x4d2f20), [0, -0.05, 0]);
  const guard = addMesh(group, new THREE.BoxGeometry(0.32, 0.055, 0.08), standard(0x8d7448, { metalness: 0.6, roughness: 0.34 }), [0, 0.13, 0]);
  const blade = addMesh(group, new THREE.BoxGeometry(0.085, 0.95, 0.16), standard(bladeColor, { metalness: 0.6, roughness: 0.24, emissive: glow, emissiveIntensity: glow ? 0.7 : 0 }), [0, 0.61, 0]);
  const tip = addMesh(group, new THREE.ConeGeometry(0.065, 0.22, 4), standard(bladeColor, { metalness: 0.6, roughness: 0.24 }), [0, 1.19, 0]);
  tip.rotation.y = Math.PI / 4;
  tip.scale.z = 0.7;
  return group;
}

function makeStaff() {
  const group = new THREE.Group();
  addMesh(group, new THREE.CylinderGeometry(0.045, 0.055, 2.25, 5), standard(0x423024), [0, 0.36, 0]);
  const ring = addMesh(group, new THREE.TorusGeometry(0.18, 0.035, 5, 12), standard(0x9c7c47, { metalness: 0.5, roughness: 0.35 }), [0, 1.56, 0]);
  const crystal = addMesh(group, new THREE.OctahedronGeometry(0.15, 0), standard(0xa9f4ee, { emissive: 0x4fe0d5, emissiveIntensity: 2.4, roughness: 0.2 }), [0, 1.56, 0]);
  ring.rotation.x = Math.PI / 2;
  return group;
}

function makeDagger() {
  const group = new THREE.Group();
  addMesh(group, new THREE.CylinderGeometry(0.038, 0.05, 0.25, 5), standard(0x3c291e), [0, -0.04, 0]);
  addMesh(group, new THREE.BoxGeometry(0.22, 0.045, 0.07), standard(0x8b7045, { metalness: 0.5, roughness: 0.3 }), [0, 0.09, 0]);
  addMesh(group, new THREE.BoxGeometry(0.07, 0.58, 0.12), standard(0xd6e1e4, { metalness: 0.65, roughness: 0.22 }), [0, 0.4, 0]);
  return group;
}

export function createCat(options = {}) {
  const {
    fur = 0xd9d5ca,
    cloak = 0x2e4a54,
    eyeColor = 0x9ff4ee,
    scale = 1,
    enemy = false,
    boss = false,
    weapon = "sword",
    robe = false,
    name = "",
    armor = false,
  } = options;

  const root = new THREE.Group();
  const visual = new THREE.Group();
  visual.scale.setScalar(scale);
  root.add(visual);

  const furColor = new THREE.Color(fur);
  const darkColor = furColor.clone().multiplyScalar(enemy ? 0.45 : 0.72);
  const lightColor = furColor.clone().lerp(new THREE.Color(0xffffff), enemy ? 0.06 : 0.2);
  const furMat = standard(furColor);
  const furDarkMat = standard(darkColor);
  const furLightMat = standard(lightColor);
  const eyeMat = standard(eyeColor, { emissive: eyeColor, emissiveIntensity: boss ? 4.3 : 3.2, roughness: 0.2 });
  const pupilMat = standard(0x06090d, { roughness: 0.32 });
  const noseMat = standard(0xb76b73, { roughness: 0.75 });
  const innerEarMat = standard(0xc98288, { roughness: 0.9 });
  const cloakMat = standard(cloak, { roughness: 0.97, side: THREE.DoubleSide });
  const armorMat = standard(enemy ? 0x32323e : 0x69757a, { metalness: 0.52, roughness: 0.42 });
  const trimMat = standard(enemy ? 0x5d3949 : 0xa68450, { metalness: 0.42, roughness: 0.4 });
  const flashMaterials = [furMat, furDarkMat, furLightMat];

  if (enemy) {
    furMat.emissive = new THREE.Color(0x140a18);
    furDarkMat.emissive = new THREE.Color(0x09040d);
    furMat.emissiveIntensity = 0.4;
    furDarkMat.emissiveIntensity = 0.4;
  }

  // Torso.
  const body = addMesh(visual, new THREE.SphereGeometry(0.48, 9, 7), furMat, [0, 0.79, 0], [0, 0, 0], [0.98, 0.84, 1.35]);
  body.castShadow = true;
  body.receiveShadow = true;

  // Fluffy chest and haunches.
  const chest = addMesh(visual, new THREE.SphereGeometry(0.3, 7, 5), furLightMat, [0, 0.71, -0.42], [0, 0, 0], [0.95, 0.9, 0.62]);
  chest.castShadow = true;
  const haunchL = addMesh(visual, new THREE.SphereGeometry(0.25, 7, 5), furDarkMat, [-0.28, 0.67, 0.29], [0, 0, 0], [0.95, 1.0, 0.9]);
  const haunchR = addMesh(visual, new THREE.SphereGeometry(0.25, 7, 5), furDarkMat, [0.28, 0.67, 0.29], [0, 0, 0], [0.95, 1.0, 0.9]);
  haunchL.castShadow = haunchR.castShadow = true;

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.27, -0.63);
  visual.add(headGroup);
  const head = addMesh(headGroup, new THREE.SphereGeometry(0.35, 9, 7), furMat, [0, 0, 0], [0, 0, 0], [1.02, 0.94, 0.93]);
  head.castShadow = true;
  const muzzle = addMesh(headGroup, new THREE.SphereGeometry(0.17, 7, 5), furLightMat, [0, -0.08, -0.28], [0, 0, 0], [1.2, 0.82, 0.75]);
  muzzle.castShadow = true;
  const nose = addMesh(headGroup, new THREE.ConeGeometry(0.045, 0.052, 3), noseMat, [0, -0.06, -0.41], [Math.PI / 2, 0, 0]);
  nose.rotation.z = Math.PI;

  for (const side of [-1, 1]) {
    const eye = addMesh(headGroup, new THREE.SphereGeometry(0.066, 8, 6), eyeMat, [side * 0.145, 0.055, -0.294], [0, 0, 0], [0.86, 1.05, 0.5]);
    const pupil = addMesh(headGroup, new THREE.SphereGeometry(0.026, 5, 5), pupilMat, [side * 0.145, 0.055, -0.336], [0, 0, 0], [0.46, 1.45, 0.45]);
    eye.castShadow = false;
    pupil.castShadow = false;

    const ear = addMesh(headGroup, new THREE.ConeGeometry(0.14, 0.38, 3), furMat, [side * 0.21, 0.32, -0.02], [0.1, 0, side * -0.18], [1, 1, 0.58]);
    ear.castShadow = true;
    addMesh(headGroup, new THREE.ConeGeometry(0.075, 0.24, 3), innerEarMat, [side * 0.21, 0.31, -0.055], [0.1, 0, side * -0.18], [1, 1, 0.45]);

    // Cheek fluff.
    addMesh(headGroup, new THREE.ConeGeometry(0.075, 0.21, 4), furLightMat, [side * 0.29, -0.11, -0.13], [0, 0, side * -1.05], [1, 1, 0.55]);
  }

  // Whiskers.
  const whiskerVertices = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      whiskerVertices.push(side * 0.19, -0.09 + i * 0.035, -0.31);
      whiskerVertices.push(side * (0.53 + i * 0.04), -0.04 + i * 0.06, -0.36 - i * 0.015);
    }
  }
  const whiskerGeo = new THREE.BufferGeometry();
  whiskerGeo.setAttribute("position", new THREE.Float32BufferAttribute(whiskerVertices, 3));
  const whiskers = new THREE.LineSegments(whiskerGeo, new THREE.LineBasicMaterial({ color: 0xe4eef0, transparent: true, opacity: enemy ? 0.22 : 0.62 }));
  headGroup.add(whiskers);

  // Legs.
  const legs = [];
  for (const side of [-1, 1]) {
    for (const front of [-1, 1]) {
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.235, 0.59, front < 0 ? -0.25 : 0.34);
      const leg = addMesh(legPivot, new THREE.CylinderGeometry(0.09, 0.075, 0.5, 5), front < 0 ? furMat : furDarkMat, [0, -0.24, 0]);
      leg.castShadow = true;
      const paw = addMesh(legPivot, new THREE.SphereGeometry(0.105, 6, 5), furLightMat, [0, -0.48, -0.022], [0, 0, 0], [1, 0.6, 1.25]);
      paw.castShadow = true;
      visual.add(legPivot);
      legs.push({ pivot: legPivot, front, side });
    }
  }

  // Tail.
  const tail = new THREE.Group();
  tail.position.set(0, 0.82, 0.51);
  visual.add(tail);
  const tailSegments = [];
  const tailCurve = [
    [0, 0.02, 0.1, 0.105],
    [0, 0.13, 0.24, 0.095],
    [0, 0.28, 0.34, 0.087],
    [0, 0.45, 0.38, 0.078],
    [0, 0.6, 0.36, 0.066],
  ];
  for (let i = 0; i < tailCurve.length; i += 1) {
    const [x, y, z, r] = tailCurve[i];
    const seg = addMesh(tail, new THREE.SphereGeometry(r, 6, 5), i === tailCurve.length - 1 ? furDarkMat : furMat, [x, y, z]);
    seg.castShadow = true;
    tailSegments.push(seg);
  }

  // Cloak or robe.
  if (robe) {
    const robeMesh = addMesh(visual, new THREE.CylinderGeometry(0.38, 0.69, 1.08, 8, 1, true, 0.3, TAU - 0.6), cloakMat, [0, 0.53, 0.06], [0, 0, 0], [1, 1, 1]);
    robeMesh.castShadow = true;
  } else {
    const cape = addMesh(visual, new THREE.CylinderGeometry(0.43, 0.64, 0.88, 7, 1, true, Math.PI * 1.08, Math.PI * 0.84), cloakMat, [0, 0.83, 0.055], [0.06, 0, 0], [1, 1, 1]);
    cape.castShadow = true;
  }

  if (armor) {
    const breastplate = addMesh(visual, new THREE.BoxGeometry(0.5, 0.38, 0.12), armorMat, [0, 0.88, -0.48], [-0.12, 0, 0]);
    breastplate.castShadow = true;
    for (const side of [-1, 1]) {
      const pauldron = addMesh(visual, new THREE.SphereGeometry(0.15, 6, 5), armorMat, [side * 0.4, 1.02, -0.11], [0, 0, 0], [1.15, 0.75, 1.0]);
      pauldron.castShadow = true;
      addMesh(visual, new THREE.BoxGeometry(0.23, 0.04, 0.068), trimMat, [side * 0.4, 1.08, -0.11], [0, 0, side * 0.12]);
    }
    const belt = addMesh(visual, new THREE.BoxGeometry(0.62, 0.09, 0.68), trimMat, [0, 0.56, 0.02]);
    belt.castShadow = true;
  }

  // Arms / weapon rig.
  const arms = [];
  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.4, 1.02, -0.16);
    const arm = addMesh(armPivot, new THREE.CylinderGeometry(0.085, 0.07, 0.44, 5), furMat, [0, -0.21, 0]);
    arm.castShadow = true;
    const paw = addMesh(armPivot, new THREE.SphereGeometry(0.1, 6, 5), furLightMat, [0, -0.44, -0.02], [0, 0, 0], [1, 0.8, 1.1]);
    paw.castShadow = true;
    visual.add(armPivot);
    arms.push({ pivot: armPivot, side });
  }
  const rightArm = arms.find((arm) => arm.side === 1);
  const leftArm = arms.find((arm) => arm.side === -1);

  let weaponMesh = null;
  if (weapon === "sword") weaponMesh = makeSword(enemy ? 0x9aa3ad : 0xd4dfe2, enemy ? 0x390e17 : 0);
  if (weapon === "dagger") weaponMesh = makeDagger();
  if (weapon === "staff") weaponMesh = makeStaff();
  if (weaponMesh) {
    weaponMesh.position.set(0, -0.4, -0.02);
    weaponMesh.rotation.x = -Math.PI / 2.12;
    weaponMesh.rotation.z = 0.12;
    const weaponScale = weapon === "sword" ? 0.85 : weapon === "dagger" ? 0.95 : 1;
    weaponMesh.scale.setScalar(weaponScale);
    rightArm.pivot.add(weaponMesh);
  }

  // Enemy spines, boss horns and crown.
  if (enemy) {
    for (let i = 0; i < 4; i += 1) {
      const spine = addMesh(visual, new THREE.ConeGeometry(0.07, 0.24 + i * 0.035, 4), standard(0x402c4d, { emissive: 0x1c1028, emissiveIntensity: 0.7 }), [0, 1.18 - i * 0.1, -0.15 + i * 0.19], [-0.35, 0, 0]);
      spine.castShadow = true;
    }
    const collar = addMesh(visual, new THREE.TorusGeometry(0.37, 0.045, 5, 14), standard(0x5c394b, { metalness: 0.5, roughness: 0.4 }), [0, 1.13, 0.08], [Math.PI / 2, 0, 0], [1, 1, 0.8]);
    collar.castShadow = true;
  }
  if (boss) {
    for (const side of [-1, 1]) {
      const horn = addMesh(headGroup, new THREE.ConeGeometry(0.08, 0.55, 5), standard(0x2b202e, { emissive: 0x190b20, emissiveIntensity: 0.5 }), [side * 0.25, 0.4, 0.02], [0.1, 0, side * -0.48]);
      horn.castShadow = true;
    }
    const crown = addMesh(headGroup, new THREE.TorusGeometry(0.26, 0.032, 4, 8), standard(0x8f6d3d, { metalness: 0.65, roughness: 0.32, emissive: 0x4b3315, emissiveIntensity: 0.4 }), [0, 0.37, 0.02], [Math.PI / 2, 0, 0]);
    crown.castShadow = true;
    for (let i = 0; i < 5; i += 1) {
      const spike = addMesh(headGroup, new THREE.ConeGeometry(0.035, 0.18, 4), standard(0x8f6d3d, { metalness: 0.65, roughness: 0.32 }), [Math.cos((i / 5) * TAU) * 0.25, 0.48, Math.sin((i / 5) * TAU) * 0.25]);
      spike.castShadow = true;
    }
  }

  // Eye glow for shades.
  if (enemy) {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createEyeGlowTexture(),
      color: eyeColor,
      transparent: true,
      opacity: boss ? 0.42 : 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    glow.position.set(0, 1.31, -0.95);
    glow.scale.set(boss ? 1.2 : 0.62, boss ? 0.75 : 0.4, 1);
    visual.add(glow);
  }

  visual.traverse((child) => {
    if (child.isMesh && child.material !== eyeMat) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  let runPhase = Math.random() * TAU;
  let flashTimer = 0;
  let attackTimer = 0;
  let swipeTimer = 0;
  const baseHeadRotation = headGroup.rotation.clone();
  const baseTailRotation = tail.rotation.clone();
  const baseArmRotations = [leftArm.pivot.rotation.x, rightArm.pivot.rotation.x];

  const api = {
    root,
    visual,
    parts: { headGroup, body, legs, arms, tail, tailSegments, rightArm, leftArm, weaponMesh, eyeMat },
    materials: { furMat, furDarkMat, furLightMat, cloakMat, armorMat },
    name,
    isEnemy: enemy,
    isBoss: boss,
    scale,
    flash(amount = 1) {
      flashTimer = Math.max(flashTimer, 0.17 * amount);
    },
    attack(duration = 0.4) {
      attackTimer = Math.max(attackTimer, duration);
    },
    swipe(duration = 0.45) {
      swipeTimer = Math.max(swipeTimer, duration);
    },
    setFur(color) {
      furMat.color.set(color);
      furDarkMat.color.set(color).multiplyScalar(0.72);
      furLightMat.color.set(color).lerp(new THREE.Color(0xffffff), 0.2);
    },
    setVisible(visible) {
      root.visible = visible;
    },
    update(dt, time, moving = false, speed = 0) {
      runPhase += dt * (moving ? 7.8 + Math.min(5, speed * 0.42) : 1.25);
      const stride = moving ? Math.min(0.72, 0.32 + speed * 0.055) : 0;
      const bounce = moving ? Math.abs(Math.sin(runPhase)) * 0.045 : Math.sin(time * 1.2) * 0.009;
      const lunge = swipeTimer > 0 ? Math.sin((1 - swipeTimer / 0.45) * Math.PI) : 0;

      visual.position.y = bounce + lunge * 0.12;
      body.scale.y = 0.84 + Math.sin(runPhase * 2) * (moving ? 0.018 : 0.006);

      for (const leg of legs) {
        const phase = runPhase + (leg.front < 0 ? 0 : Math.PI) + (leg.side < 0 ? Math.PI * 0.5 : 0);
        leg.pivot.rotation.x = Math.sin(phase) * stride;
        leg.pivot.rotation.z = leg.side * Math.sin(phase * 0.5) * stride * 0.07;
      }

      headGroup.rotation.x = baseHeadRotation.x + Math.sin(time * 0.9) * 0.025 - (moving ? 0.04 : 0) - lunge * 0.22;
      headGroup.rotation.y = baseHeadRotation.y + Math.sin(time * 0.47) * 0.055 + (moving ? Math.sin(runPhase * 0.5) * 0.04 : 0);
      headGroup.rotation.z = baseHeadRotation.z + Math.sin(time * 0.61 + 0.7) * 0.02;

      tail.rotation.x = baseTailRotation.x + Math.sin(time * 1.5 + 0.8) * 0.08 + (moving ? 0.1 : 0);
      tail.rotation.y = baseTailRotation.y + Math.sin(time * 1.15 + 0.4) * 0.28 + (moving ? Math.sin(runPhase * 0.5) * 0.18 : 0);
      tail.rotation.z = baseTailRotation.z + Math.cos(time * 1.7) * 0.06;
      tailSegments.forEach((segment, index) => {
        segment.position.x = Math.sin(time * 1.9 + index * 0.6) * 0.012 * (index + 1);
      });

      const attackProgress = attackTimer > 0 ? 1 - attackTimer / 0.4 : 0;
      const swing = attackTimer > 0 ? Math.sin(attackProgress * Math.PI) : 0;
      rightArm.pivot.rotation.x = baseArmRotations[1] - swing * 2.35 - lunge * 1.45;
      rightArm.pivot.rotation.z = -0.08 - swing * 0.52;
      rightArm.pivot.rotation.y = -swing * 0.38;
      leftArm.pivot.rotation.x = baseArmRotations[0] + (moving ? Math.sin(runPhase + Math.PI) * 0.4 : 0);
      leftArm.pivot.rotation.z = 0.08 + swing * 0.15;

      if (attackTimer > 0) attackTimer = Math.max(0, attackTimer - dt);
      if (swipeTimer > 0) swipeTimer = Math.max(0, swipeTimer - dt);

      if (flashTimer > 0) {
        flashTimer = Math.max(0, flashTimer - dt);
        const intensity = Math.min(1, flashTimer / 0.17) * 1.4;
        furMat.emissive.setHex(0xbd3c45);
        furMat.emissiveIntensity = intensity;
        furDarkMat.emissive.setHex(0x7a1e2b);
        furDarkMat.emissiveIntensity = intensity;
        furLightMat.emissive.setHex(0xd25b62);
        furLightMat.emissiveIntensity = intensity * 0.8;
      } else {
        furMat.emissive.setHex(enemy ? 0x140a18 : 0x000000);
        furMat.emissiveIntensity = enemy ? 0.4 : 0;
        furDarkMat.emissive.setHex(enemy ? 0x09040d : 0x000000);
        furDarkMat.emissiveIntensity = enemy ? 0.4 : 0;
        furLightMat.emissive.setHex(0x000000);
        furLightMat.emissiveIntensity = 0;
      }
    },
  };

  return api;
}

let eyeGlowTexture = null;
function createEyeGlowTexture() {
  if (eyeGlowTexture) return eyeGlowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 32, 0, 64, 32, 60);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 64);
  eyeGlowTexture = new THREE.CanvasTexture(canvas);
  eyeGlowTexture.colorSpace = THREE.SRGBColorSpace;
  return eyeGlowTexture;
}
