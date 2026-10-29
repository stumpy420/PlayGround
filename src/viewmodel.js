import * as THREE from 'three';

function box(w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function capsule(radius, length, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 10), mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function makePaw(fur, pad, claw, sleeveMat, mirror = 1) {
  const group = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 9), fur);
  palm.scale.set(1.25, 0.78, 1.4);
  palm.position.set(0, 0, -0.03);
  group.add(palm);

  for (let i = 0; i < 4; i += 1) {
    const toe = capsule(0.025, 0.055, fur, (i - 1.5) * 0.043, 0.018, -0.105);
    toe.rotation.x = Math.PI / 2;
    group.add(toe);
    const clawTip = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.032, 5), claw);
    clawTip.rotation.x = -Math.PI / 2;
    clawTip.position.set((i - 1.5) * 0.043, 0.022, -0.16);
    group.add(clawTip);
  }

  const padMesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), pad);
  padMesh.scale.set(1.2, 0.42, 1);
  padMesh.position.set(0, -0.056, -0.055);
  group.add(padMesh);

  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.26, 10), sleeveMat);
  sleeve.rotation.x = Math.PI / 2 - 0.18;
  sleeve.position.set(0, -0.02, 0.15);
  group.add(sleeve);
  group.scale.x = mirror;
  return group;
}

export class ViewModel {
  constructor(camera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.position.set(0.38, -0.33, -0.8);
    this.group.rotation.set(0.02, 0.04, 0.01);
    this.group.scale.setScalar(0.52);
    camera.add(this.group);
    this.recoil = 0;
    this.smoothAds = 0;
    this.reloadT = 0;
    this.time = 0;
    this.flashT = 0;
    this.visible = false;
    this.build();
    this.addLighting();
    this.group.visible = false;
  }

  build() {
    const metal = new THREE.MeshStandardMaterial({ color: '#2a4049', roughness: 0.34, metalness: 0.72, emissive: '#07151b', emissiveIntensity: 0.55 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: '#101e25', roughness: 0.42, metalness: 0.68, emissive: '#050d11', emissiveIntensity: 0.35 });
    const teal = new THREE.MeshStandardMaterial({ color: '#1b6c78', roughness: 0.32, metalness: 0.65, emissive: '#052126', emissiveIntensity: 0.35 });
    const cream = new THREE.MeshStandardMaterial({ color: '#c9bfa4', roughness: 0.62, metalness: 0.08 });
    const orange = new THREE.MeshStandardMaterial({ color: '#d97636', roughness: 0.5, metalness: 0.3 });
    const glow = new THREE.MeshBasicMaterial({ color: '#70f8ff' });
    const glowWarm = new THREE.MeshBasicMaterial({ color: '#ffb257' });
    const fur = new THREE.MeshStandardMaterial({ color: '#cdbb9c', roughness: 0.86, metalness: 0.01 });
    const furDark = new THREE.MeshStandardMaterial({ color: '#78634f', roughness: 0.9, metalness: 0.01 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: '#16434c', roughness: 0.62, metalness: 0.18, emissive: '#031318', emissiveIntensity: 0.3 });
    const pad = new THREE.MeshStandardMaterial({ color: '#c77b7a', roughness: 0.8, metalness: 0.01 });
    const claw = new THREE.MeshStandardMaterial({ color: '#dde7e5', roughness: 0.3, metalness: 0.28 });

    const gun = new THREE.Group();
    gun.position.z = -0.05;
    this.group.add(gun);

    const receiver = box(0.16, 0.18, 0.56, metal, 0, 0, -0.24);
    gun.add(receiver);
    const upper = box(0.135, 0.075, 0.66, darkMetal, 0, 0.11, -0.29);
    upper.rotation.x = 0.015;
    gun.add(upper);

    for (let i = 0; i < 7; i += 1) {
      const rail = box(0.15, 0.018, 0.025, darkMetal, 0, 0.155, -0.53 + i * 0.065);
      gun.add(rail);
    }

    const shroud = box(0.115, 0.11, 0.38, teal, 0, -0.005, -0.63);
    gun.add(shroud);
    for (let i = 0; i < 4; i += 1) {
      const vent = box(0.13, 0.012, 0.035, darkMetal, 0, 0.035, -0.74 + i * 0.075);
      gun.add(vent);
    }

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.58, 10), darkMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.015, 0.015, -0.95);
    gun.add(barrel);
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.14, 8), metal);
    brake.rotation.x = Math.PI / 2;
    brake.position.set(0.015, 0.015, -1.28);
    gun.add(brake);
    for (const side of [-1, 1]) {
      const slot = box(0.015, 0.09, 0.055, darkMetal, side * 0.045, 0.015, -1.28);
      gun.add(slot);
    }

    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 3), cream);
      fin.rotation.x = Math.PI / 2;
      fin.rotation.z = side * (Math.PI / 2);
      fin.position.set(side * 0.09, 0.005, -0.83);
      gun.add(fin);
    }

    const stock = box(0.11, 0.12, 0.16, teal, 0, -0.01, 0.09);
    stock.rotation.x = -0.05;
    gun.add(stock);

    const mag = box(0.11, 0.3, 0.2, darkMetal, 0, -0.22, -0.2);
    mag.rotation.x = 0.18;
    gun.add(mag);
    const magPlate = box(0.13, 0.05, 0.23, orange, 0, -0.38, -0.17);
    magPlate.rotation.x = 0.18;
    gun.add(magPlate);
    this.mag = mag;
    this.magPlate = magPlate;
    this.magBase = { y: mag.position.y, z: mag.position.z, py: magPlate.position.y, pz: magPlate.position.z };

    const grip = box(0.12, 0.26, 0.13, darkMetal, 0, -0.19, 0.1);
    grip.rotation.x = -0.22;
    gun.add(grip);
    const triggerGuard = new THREE.Mesh(new THREE.TorusGeometry(0.083, 0.012, 5, 12, Math.PI), darkMetal);
    triggerGuard.rotation.y = Math.PI / 2;
    triggerGuard.rotation.z = Math.PI / 2;
    triggerGuard.position.set(0.02, -0.1, -0.02);
    gun.add(triggerGuard);

    const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.3, 10), darkMetal);
    scopeBody.rotation.x = Math.PI / 2;
    scopeBody.position.set(0, 0.205, -0.27);
    gun.add(scopeBody);
    for (const side of [-1, 1]) {
      const scopeRing = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), teal);
      scopeRing.rotation.x = Math.PI / 2;
      scopeRing.position.set(0, 0.205, -0.27 + side * 0.13);
      gun.add(scopeRing);
    }
    const scopeGlass = new THREE.Mesh(new THREE.CircleGeometry(0.046, 16), glow);
    scopeGlass.position.set(0, 0.205, -0.425);
    scopeGlass.rotation.y = Math.PI;
    gun.add(scopeGlass);
    const sight = box(0.012, 0.06, 0.012, darkMetal, 0, 0.25, -0.27);
    sight.rotation.z = Math.PI / 4;
    gun.add(sight);

    const cell = box(0.025, 0.09, 0.2, glowWarm, 0.091, 0.02, -0.36);
    gun.add(cell);
    const cellHousing = box(0.036, 0.13, 0.25, metal, 0.084, 0.02, -0.36);
    cellHousing.scale.set(0.8, 1, 1);
    gun.add(cellHousing);
    const cellLight = new THREE.PointLight('#ffae54', 0.5, 0.45, 2);
    cellLight.position.set(0.11, 0.02, -0.36);
    gun.add(cellLight);

    const foreGrip = box(0.1, 0.15, 0.12, darkMetal, -0.015, -0.16, -0.58);
    foreGrip.rotation.x = 0.12;
    gun.add(foreGrip);

    const sling = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.01, 4, 16), furDark);
    sling.rotation.y = Math.PI / 2;
    sling.position.set(0, -0.06, 0.23);
    gun.add(sling);

    // Paws and sleeves
    const rightPaw = makePaw(fur, pad, claw, sleeveMat, 1);
    rightPaw.position.set(0.02, -0.2, 0.1);
    rightPaw.rotation.set(-0.18, 0.06, 0.16);
    rightPaw.scale.setScalar(0.66);
    gun.add(rightPaw);

    const leftPaw = makePaw(fur, pad, claw, sleeveMat, -1);
    leftPaw.position.set(-0.015, -0.2, -0.54);
    leftPaw.rotation.set(-0.28, 0.08, -0.2);
    leftPaw.scale.setScalar(0.82);
    gun.add(leftPaw);

    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.26, 10), sleeveMat);
    rightSleeve.rotation.x = 1.02;
    rightSleeve.rotation.z = -0.16;
    rightSleeve.position.set(0.075, -0.46, 0.22);
    gun.add(rightSleeve);

    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.085, 0.44, 10), teal);
    leftSleeve.rotation.x = 1.22;
    leftSleeve.rotation.z = 0.32;
    leftSleeve.position.set(-0.16, -0.43, -0.3);
    gun.add(leftSleeve);

    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), orange);
    patch.position.set(-0.17, -0.34, -0.02);
    patch.rotation.x = -0.4;
    patch.rotation.z = 0.2;
    gun.add(patch);

    this.gun = gun;
    this.muzzle = new THREE.Object3D();
    this.muzzle.position.set(0.015, 0.015, -1.36);
    gun.add(this.muzzle);

    this.flash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshBasicMaterial({ color: '#ffd27d', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    this.flash.position.copy(this.muzzle.position);
    this.flash.position.z -= 0.04;
    gun.add(this.flash);
    this.flashLight = new THREE.PointLight('#ffb959', 0, 3.2, 2);
    this.flashLight.position.copy(this.muzzle.position);
    gun.add(this.flashLight);

    this.gun.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
      }
    });
  }

  addLighting() {
    const key = new THREE.PointLight('#dff8ff', 7, 4.2, 2);
    key.position.set(0.9, 0.9, 1.1);
    this.camera.add(key);
    const warm = new THREE.PointLight('#ffc178', 4.5, 3.2, 2);
    warm.position.set(-0.7, -0.35, 0.1);
    this.camera.add(warm);
    const rim = new THREE.PointLight('#5adff0', 4, 3.5, 2);
    rim.position.set(0.2, 0.45, -1.1);
    this.camera.add(rim);
  }

  setVisible(visible) {
    this.visible = visible;
    this.group.visible = visible;
  }

  kick(strength = 1) {
    this.recoil = Math.min(1.8, this.recoil + strength);
    this.flashT = 0.055;
    this.flash.material.opacity = 1;
    this.flash.rotation.z = Math.random() * Math.PI;
    this.flash.scale.setScalar(0.75 + Math.random() * 0.65);
    this.flashLight.intensity = 4.5;
  }

  setReload(progress) {
    this.reloadT = progress;
  }

  update(dt, { moveAmount = 0, ads = false, time = 0, sprint = false } = {}) {
    if (!this.visible) return;
    this.time += dt;
    const targetAds = ads ? 1 : 0;
    this.smoothAds += (targetAds - this.smoothAds) * Math.min(1, dt * 11);
    this.recoil = Math.max(0, this.recoil - dt * 7.4);
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.flashT <= 0) {
      this.flash.material.opacity = 0;
      this.flashLight.intensity = 0;
    }

    const sprintOffset = sprint ? 0.055 : 0;
    const adsPos = new THREE.Vector3(0.012, -0.2 + sprintOffset, -0.65);
    const hipPos = new THREE.Vector3(0.38, -0.33, -0.8);
    const basePos = hipPos.clone().lerp(adsPos, this.smoothAds);
    const bobStrength = (0.012 + moveAmount * 0.017) * (1 - this.smoothAds * 0.72);
    const bobX = Math.sin(this.time * 7.4) * bobStrength * 0.9;
    const bobY = Math.abs(Math.cos(this.time * 7.4)) * bobStrength;
    const breatheX = Math.sin(time * 1.15) * 0.0024;
    const breatheY = Math.cos(time * 1.5) * 0.0019;

    const reloadArc = Math.sin(Math.min(1, this.reloadT) * Math.PI);
    basePos.y -= reloadArc * 0.13;
    basePos.x += reloadArc * -0.05;
    basePos.z += reloadArc * 0.06;
    basePos.x += bobX + breatheX;
    basePos.y += bobY + breatheY;

    const recoilZ = this.recoil * 0.075;
    const recoilRot = this.recoil * 0.075;
    this.group.position.lerp(basePos, Math.min(1, dt * 16));
    this.group.position.z += recoilZ;
    this.group.rotation.x = 0.02 + recoilRot + this.smoothAds * -0.01 + reloadArc * -0.32;
    this.group.rotation.y = 0.04 - this.smoothAds * 0.04 + bobX * 0.5;
    this.group.rotation.z = 0.01 + reloadArc * 0.42 + (sprint ? -0.13 : 0) - bobX * 0.3;

    const magDrop = reloadArc * 0.24;
    this.mag.position.y = this.magBase.y - magDrop;
    this.mag.position.z = this.magBase.z + magDrop * 0.4;
    this.mag.rotation.x = 0.18 + reloadArc * 0.38;
    this.magPlate.position.y = this.magBase.py - magDrop;
    this.magPlate.position.z = this.magBase.pz + magDrop * 0.4;
    this.magPlate.rotation.x = 0.18 + reloadArc * 0.38;
  }
}
