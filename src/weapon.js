import * as THREE from 'three';
import { flareTexture } from './textures.js';

function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(20,24,20,.9)';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = 'rgba(255,177,59,.65)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = '#e8dfc9';
  ctx.font = '400 62px Bebas, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FISH-47', 256, 50);
  ctx.font = '600 17px Rajdhani, Arial, sans-serif';
  ctx.fillStyle = '#ffb13b';
  ctx.fillText('TUNA DYNAMICS · 5.56 MEOW', 256, 92);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makePaw(furMat, padMat, scale = 1) {
  const g = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), furMat);
  palm.scale.set(1.15, 0.72, 0.95);
  palm.castShadow = false;
  g.add(palm);
  for (let i = 0; i < 3; i++) {
    const toe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), furMat);
    toe.scale.set(1.1, 0.75, 1.2);
    toe.position.set((i - 1) * 0.055, -0.012, 0.072);
    g.add(toe);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), padMat);
    pad.scale.set(1.1, 0.55, 1);
    pad.position.set((i - 1) * 0.055, -0.026, 0.094);
    g.add(pad);
  }
  const mainPad = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), padMat);
  mainPad.scale.set(1.35, 0.5, 0.9);
  mainPad.position.set(0, -0.03, 0.04);
  g.add(mainPad);
  g.scale.setScalar(scale);
  return g;
}

export class Weapon {
  constructor(camera) {
    this.camera = camera;
    this.root = new THREE.Group();
    this.root.position.set(0.34, -0.32, -0.75);
    this.root.rotation.set(0.015, -0.105, 0.02);
    camera.add(this.root);

    this.base = new THREE.Vector3(0.34, -0.32, -0.75);
    this.aimBase = new THREE.Vector3(0.0, -0.185, -0.5);
    this.recoil = new THREE.Vector3();
    this.recoilRot = new THREE.Vector3();
    this.sway = new THREE.Vector2();
    this.swayTarget = new THREE.Vector2();
    this.recoilKick = 0;
    this.reloadTimer = 0;
    this.reloadDuration = 1.32;
    this.reloading = false;
    this.aiming = false;
    this.aimBlend = 0;
    this.flashTimer = 0;
    this.time = 0;
    this.fireSide = 1;
    this.lastShot = 0;
    this.onReloadDone = null;

    const metal = new THREE.MeshStandardMaterial({ color: 0x687771, roughness: 0.3, metalness: 0.34, emissive: 0x0b0f0d, emissiveIntensity: 1, envMapIntensity: 1.25 });
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x333d39, roughness: 0.4, metalness: 0.36, emissive: 0x080a09, emissiveIntensity: 1, envMapIntensity: 1.15 });
    const polymer = new THREE.MeshStandardMaterial({ color: 0x69795a, roughness: 0.54, metalness: 0.1, emissive: 0x0a0c08, emissiveIntensity: 1, envMapIntensity: 0.9 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xd7692a, roughness: 0.46, metalness: 0.28 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xe5d8bd, roughness: 0.68 });
    const fur = new THREE.MeshStandardMaterial({ color: 0xb47b42, roughness: 0.94 });
    const furLight = new THREE.MeshStandardMaterial({ color: 0xcf9e68, roughness: 0.92 });
    const pad = new THREE.MeshStandardMaterial({ color: 0xd98686, roughness: 0.7 });
    const sleeve = new THREE.MeshStandardMaterial({ color: 0x3d4a39, roughness: 0.86 });
    const glow = new THREE.MeshStandardMaterial({ color: 0x9cffb2, emissive: 0x54ff7d, emissiveIntensity: 3.2, roughness: 0.2 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a04d, roughness: 0.32, metalness: 0.85 });

    const gun = new THREE.Group();
    this.root.add(gun);
    this.gun = gun;

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.155, 0.5), metal);
    receiver.position.set(0, 0.03, -0.06);
    gun.add(receiver);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.07, 0.48), metalDark);
    upper.position.set(0, 0.125, -0.05);
    gun.add(upper);
    for (let i = 0; i < 7; i++) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.128, 0.018, 0.035), metalDark);
      rail.position.set(0, 0.168, -0.25 + i * 0.058);
      gun.add(rail);
    }
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.105, 0.32), polymer);
    handguard.position.set(0, 0.035, -0.45);
    gun.add(handguard);
    for (let i = 0; i < 5; i++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.014, 0.026), metalDark);
      vent.position.set(0, 0.062, -0.35 - i * 0.045);
      gun.add(vent);
    }
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.42, 12), metalDark);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, -0.79);
    gun.add(barrel);
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.031, 0.11, 10), metal);
    brake.rotation.x = Math.PI / 2;
    brake.position.set(0, 0.04, -0.99);
    gun.add(brake);
    for (let i = 0; i < 3; i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.02), metalDark);
      slot.position.set(0, 0.06, -1.02 + i * 0.028);
      gun.add(slot);
    }

    const fishTail = new THREE.Group();
    fishTail.position.set(0, 0.02, 0.28);
    const tailA = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 3), accent);
    tailA.rotation.z = Math.PI / 2;
    tailA.rotation.y = Math.PI / 2;
    tailA.position.set(0, 0.045, 0.08);
    tailA.scale.set(0.35, 1, 1);
    fishTail.add(tailA);
    const tailB = tailA.clone();
    tailB.position.y = -0.045;
    tailB.rotation.z = -Math.PI / 2;
    fishTail.add(tailB);
    gun.add(fishTail);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.13, 0.27), polymer);
    stock.position.set(0, 0.01, 0.23);
    stock.rotation.x = -0.05;
    gun.add(stock);
    const butt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.05), metalDark);
    butt.position.set(0, -0.01, 0.37);
    gun.add(butt);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.23, 0.12), polymer);
    grip.position.set(0, -0.145, 0.1);
    grip.rotation.x = -0.23;
    gun.add(grip);
    const triggerGuard = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.01, 5, 12, Math.PI * 1.4), metalDark);
    triggerGuard.rotation.y = Math.PI / 2;
    triggerGuard.rotation.z = Math.PI * 0.82;
    triggerGuard.position.set(0, -0.095, -0.04);
    gun.add(triggerGuard);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.012), brass);
    trigger.position.set(0, -0.08, -0.035);
    trigger.rotation.x = -0.2;
    gun.add(trigger);

    this.mag = new THREE.Group();
    this.mag.position.set(0, -0.11, -0.15);
    const magBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.14), polymer);
    magBody.position.y = -0.09;
    magBody.rotation.x = 0.13;
    this.mag.add(magBody);
    const magRib = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.022, 0.145), metalDark);
    magRib.position.set(0, -0.14, 0.005);
    magRib.rotation.x = 0.13;
    this.mag.add(magRib);
    const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.155), accent);
    magBase.position.set(0, -0.22, 0.02);
    magBase.rotation.x = 0.13;
    this.mag.add(magBase);
    gun.add(this.mag);

    const sideLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.075), new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.6, metalness: 0.1 }));
    sideLabel.position.set(-0.068, 0.045, -0.1);
    sideLabel.rotation.y = -Math.PI / 2;
    gun.add(sideLabel);
    for (let i = 0; i < 3; i++) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.07), accent);
      plate.position.set(-0.071, -0.015, -0.2 + i * 0.075);
      gun.add(plate);
    }
    for (const bz of [-0.28, 0.02]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 8), brass);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(-0.072, 0.02, bz);
      gun.add(bolt);
    }

    const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.035, 0.13), metalDark);
    sightBase.position.set(0, 0.19, -0.02);
    gun.add(sightBase);
    const sightRing = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.009, 6, 18), metalDark);
    sightRing.position.set(0, 0.238, -0.02);
    sightRing.rotation.y = Math.PI / 2;
    sightRing.rotation.x = Math.PI / 2;
    gun.add(sightRing);
    const reticle = new THREE.Mesh(new THREE.CircleGeometry(0.007, 8), glow);
    reticle.position.set(0, 0.238, -0.064);
    gun.add(reticle);
    const holo = new THREE.Mesh(new THREE.CircleGeometry(0.042, 20), new THREE.MeshBasicMaterial({ color: 0x64ff8a, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
    holo.position.set(0, 0.238, -0.045);
    gun.add(holo);

    const ejectPort = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.055, 0.11), metalDark);
    ejectPort.position.set(0.069, 0.065, -0.04);
    gun.add(ejectPort);

    const charm = new THREE.Group();
    charm.position.set(0.09, -0.02, -0.26);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 5, 10), brass);
    ring.rotation.y = Math.PI / 2;
    charm.add(ring);
    const fish = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), accent);
    fish.scale.set(0.7, 1.5, 0.32);
    fish.position.y = -0.055;
    charm.add(fish);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.04, 3), accent);
    fin.rotation.z = Math.PI;
    fin.position.y = -0.095;
    charm.add(fin);
    gun.add(charm);
    this.charm = charm;

    const pawRight = makePaw(fur, pad, 0.86);
    pawRight.position.set(0.035, -0.18, 0.13);
    pawRight.rotation.set(0.35, 0.15, -0.15);
    gun.add(pawRight);
    const pawLeft = makePaw(furLight, pad, 0.78);
    pawLeft.position.set(-0.015, -0.02, -0.47);
    pawLeft.rotation.set(0.5, 0, 0.15);
    gun.add(pawLeft);

    const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.34, 4, 8), fur);
    rightArm.position.set(0.11, -0.49, 0.18);
    rightArm.rotation.set(0.86, 0.1, -0.24);
    gun.add(rightArm);
    const rightSleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.16, 4, 8), sleeve);
    rightSleeve.position.set(0.15, -0.68, 0.3);
    rightSleeve.rotation.set(0.86, 0.1, -0.24);
    gun.add(rightSleeve);
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.3, 4, 8), furLight);
    leftArm.position.set(-0.17, -0.35, -0.25);
    leftArm.rotation.set(0.95, -0.15, 0.6);
    gun.add(leftArm);
    const leftSleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 4, 8), sleeve);
    leftSleeve.position.set(-0.28, -0.54, -0.12);
    leftSleeve.rotation.set(0.95, -0.15, 0.6);
    gun.add(leftSleeve);

    const flashTex = flareTexture();
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: 0xffc46a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.flash.position.set(0, 0.04, -1.055);
    this.flash.scale.set(0.32, 0.32, 1);
    this.flash.visible = false;
    gun.add(this.flash);
    this.flashLight = new THREE.PointLight(0xffa04a, 0, 5.5, 2);
    this.flashLight.position.set(0.05, -0.05, -1.05);
    gun.add(this.flashLight);

    this.muzzle = new THREE.Object3D();
    this.muzzle.position.set(0, 0.04, -1.09);
    gun.add(this.muzzle);

    const viewLight = new THREE.PointLight(0xffe2c4, 2.5, 4.2, 2);
    viewLight.position.set(0.3, 0.15, 0.25);
    camera.add(viewLight);
    const rim = new THREE.PointLight(0x9fc2ff, 1.0, 3.0, 2);
    rim.position.set(-0.5, 0.3, -0.2);
    camera.add(rim);

    gun.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    this.setAspect(window.innerWidth / window.innerHeight);
  }

  setAspect(aspect) {
    const portrait = aspect < 0.82;
    const x = portrait ? 0.11 : 0.34;
    const y = portrait ? -0.27 : -0.32;
    const z = portrait ? -0.62 : -0.75;
    this.base.set(x, y, z);
    this.aimBase.set(0, portrait ? -0.16 : -0.185, portrait ? -0.42 : -0.5);
    this.root.position.copy(this.base);
    this.root.scale.setScalar(portrait ? 0.78 : 0.86);
  }

  startReload() {
    if (this.reloading) return false;
    this.reloading = true;
    this.reloadTimer = 0;
    return true;
  }

  fire(time) {
    this.recoilKick = 1;
    this.flashTimer = 0.055;
    this.fireSide *= -1;
    this.recoilRot.x = 0.09 + Math.random() * 0.025;
    this.recoilRot.z = (Math.random() - 0.5) * 0.03;
    this.recoil.z = 0.055;
    this.recoil.y = 0.025;
    this.flash.material.rotation = Math.random() * Math.PI;
    const s = 0.25 + Math.random() * 0.16;
    this.flash.scale.set(s, s, 1);
    this.flash.visible = true;
    this.flashLight.intensity = 18;
    this.lastShot = time;
  }

  muzzlePosition(target) {
    return this.muzzle.getWorldPosition(target);
  }

  update(dt, state = {}) {
    this.time += dt;
    const t = this.time;
    const aimingTarget = state.aiming ? 1 : 0;
    this.aimBlend += (aimingTarget - this.aimBlend) * Math.min(1, dt * 12);

    this.recoil.multiplyScalar(Math.max(0, 1 - dt * 14));
    this.recoilRot.multiplyScalar(Math.max(0, 1 - dt * 12));
    this.recoilKick *= Math.max(0, 1 - dt * 15);

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.flash.visible = false;
        this.flashLight.intensity = 0;
      } else {
        this.flashLight.intensity = 12 + Math.random() * 8;
      }
    } else {
      this.flashLight.intensity *= Math.max(0, 1 - dt * 20);
    }

    let reloadDrop = 0, reloadTilt = 0, reloadRoll = 0;
    if (this.reloading) {
      this.reloadTimer += dt;
      const p = Math.min(1, this.reloadTimer / this.reloadDuration);
      const dip = Math.sin(Math.min(1, p * 1.7) * Math.PI);
      reloadDrop = dip * 0.2;
      reloadTilt = dip * 0.75;
      reloadRoll = dip * 0.46;
      const magPhase = p < 0.3 ? p / 0.3 : p < 0.68 ? 1 : 1 - (p - 0.68) / 0.32;
      this.mag.position.y = -0.11 - magPhase * 0.34;
      this.mag.rotation.z = magPhase * 0.28;
      if (p >= 1) {
        this.reloading = false;
        this.reloadTimer = 0;
        this.mag.position.y = -0.11;
        this.mag.rotation.z = 0;
        if (this.onReloadDone) this.onReloadDone();
      }
    }

    const moveBob = state.moveSpeed ? Math.sin(t * 10) * 0.006 * state.moveSpeed : 0;
    const breathe = Math.sin(t * 1.4) * 0.0035;
    this.sway.x += (this.swayTarget.x - this.sway.x) * Math.min(1, dt * 8);
    this.sway.y += (this.swayTarget.y - this.sway.y) * Math.min(1, dt * 8);
    this.swayTarget.multiplyScalar(Math.max(0, 1 - dt * 9));

    const targetX = THREE.MathUtils.lerp(this.base.x, this.aimBase.x, this.aimBlend) + this.sway.x * 0.02;
    const targetY = THREE.MathUtils.lerp(this.base.y, this.aimBase.y, this.aimBlend) + moveBob + breathe + this.sway.y * 0.02 - reloadDrop;
    const targetZ = THREE.MathUtils.lerp(this.base.z, this.aimBase.z, this.aimBlend) + this.recoil.z;
    this.root.position.x += (targetX - this.root.position.x) * Math.min(1, dt * 16);
    this.root.position.y += (targetY - this.root.position.y) * Math.min(1, dt * 16);
    this.root.position.z += (targetZ - this.root.position.z) * Math.min(1, dt * 16);

    const targetRotX = this.recoilRot.x - reloadTilt + this.sway.y * 0.03;
    const targetRotY = -0.035 + (this.aimBlend * 0.035) + this.sway.x * 0.03;
    const targetRotZ = 0.015 + this.recoilRot.z + reloadRoll + this.sway.x * 0.045;
    this.root.rotation.x += (targetRotX - this.root.rotation.x) * Math.min(1, dt * 14);
    this.root.rotation.y += (targetRotY - this.root.rotation.y) * Math.min(1, dt * 14);
    this.root.rotation.z += (targetRotZ - this.root.rotation.z) * Math.min(1, dt * 14);

    this.charm.rotation.z = Math.sin(t * 2.2) * 0.1;
    this.charm.rotation.x = Math.sin(t * 1.7) * 0.08;
  }

  addLook(dx, dy) {
    this.swayTarget.x += THREE.MathUtils.clamp(dx * 0.0012, -0.22, 0.22);
    this.swayTarget.y += THREE.MathUtils.clamp(dy * 0.0012, -0.22, 0.22);
  }
}
