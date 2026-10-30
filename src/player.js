import * as THREE from 'three';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function shortest(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function makeFlashTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,235,1)');
  g.addColorStop(0.2, 'rgba(255,231,150,.95)');
  g.addColorStop(0.5, 'rgba(255,164,50,.55)');
  g.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  // spikes
  ctx.translate(64, 64);
  ctx.fillStyle = 'rgba(255,238,180,.9)';
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(0, -58 - Math.random() * 10);
    ctx.lineTo(7, 0);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Player {
  constructor({ camera, scene, audio, spawn, colliders, mobile = false }) {
    this.camera = camera;
    this.scene = scene;
    this.audio = audio;
    this.colliders = colliders;
    this.mobile = mobile;
    this.position = new THREE.Vector3(spawn.x, 0, spawn.z);
    this.eye = 1.66;
    this.radius = 0.34;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.bob = 0;
    this.bobTime = 0;
    this.moveSpeed = 0;
    this.enabled = false;
    this.alive = true;
    this.sprinting = false;
    this.keys = new Set();
    this.ammo = 6;
    this.maxAmmo = 6;
    this.reloading = false;
    this.reloadT = 0;
    this.reloadDuration = 1.25;
    this.cooldown = 0;
    this.recoil = 0;
    this.shake = 0;
    this.flashT = 0;
    this.lookVel = { x: 0, y: 0 };
    this.tilt = { on: false, ready: false, base: null, baseYaw: 0, basePitch: 0, targetYaw: 0, targetPitch: 0, filter: null, denied: false };
    this.onShootCallback = null;
    this.onActionCallback = null;
    this.onReportCallback = null;
    this.onPauseCallback = null;
    this.onAmmo = null;
    this.onReloading = null;
    this.stepAccum = 0;
    this.lastYaw = 0;
    this.lastPitch = 0;
    this.touchLook = { id: null, x: 0, y: 0 };
    this.dragLook = { id: null, x: 0, y: 0 };
    this.joystick = { id: null, x: 0, y: 0, active: false, cx: 0, cy: 0 };
    this.isTouch = matchMedia('(pointer: coarse)').matches || innerWidth < 900;

    camera.rotation.order = 'YXZ';
    camera.fov = mobile ? 78 : 72;
    camera.near = 0.04;
    camera.far = 320;
    camera.updateProjectionMatrix();
    scene.add(camera);

    this.buildViewmodel();
    this.buildFlashlight();
    this.bindInput();
    this.applyCamera(0);
  }

  buildViewmodel() {
    const vm = new THREE.Group();
    vm.position.set(0.285, -0.255, -0.52);
    vm.rotation.set(0.02, -0.035, 0);
    vm.scale.setScalar(0.72);
    this.camera.add(vm);
    this.vm = vm;
    this.vmBase = vm.position.clone();
    this.vmRotBase = vm.rotation.clone();

    const gunMat = new THREE.MeshStandardMaterial({ color: 0x3c403c, metalness: 0.72, roughness: 0.34, depthTest: false, depthWrite: false });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1b1d19, metalness: 0.35, roughness: 0.6, depthTest: false, depthWrite: false });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x2c2a23, metalness: 0.1, roughness: 0.88, depthTest: false, depthWrite: false });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x3e412f, roughness: 0.9, depthTest: false, depthWrite: false });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8f7355, roughness: 0.8, depthTest: false, depthWrite: false });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xf5b942, emissive: 0x6b3d00, emissiveIntensity: 0.4, roughness: 0.5, depthTest: false, depthWrite: false });

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.renderOrder = 100;
      m.frustumCulled = false;
      vm.add(m);
      return m;
    };

    // slide
    this.slide = add(new THREE.BoxGeometry(0.075, 0.075, 0.36), gunMat, 0, 0.035, -0.08);
    add(new THREE.BoxGeometry(0.062, 0.055, 0.16), gunMat, 0, 0.02, -0.31);
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), darkMat, 0, 0.02, -0.4, Math.PI / 2);
    // frame
    add(new THREE.BoxGeometry(0.064, 0.045, 0.29), darkMat, 0, -0.04, -0.05);
    // grip
    add(new THREE.BoxGeometry(0.07, 0.21, 0.1), gripMat, 0, -0.15, 0.055, 0.15);
    add(new THREE.BoxGeometry(0.075, 0.03, 0.1), accentMat, 0, -0.22, 0.08, 0.15);
    // trigger guard
    add(new THREE.BoxGeometry(0.025, 0.055, 0.11), darkMat, 0, -0.075, 0.04);
    // sights
    add(new THREE.BoxGeometry(0.014, 0.016, 0.016), accentMat, 0, 0.08, -0.23);
    add(new THREE.BoxGeometry(0.05, 0.014, 0.016), darkMat, 0, 0.08, 0.055);
    // right hand
    add(new THREE.BoxGeometry(0.105, 0.13, 0.13), gloveMat, 0.005, -0.15, 0.075, 0.15);
    add(new THREE.BoxGeometry(0.075, 0.14, 0.12), skinMat, 0.01, -0.25, 0.11, 0.3);
    // left support hand
    add(new THREE.BoxGeometry(0.115, 0.1, 0.13), gloveMat, -0.055, -0.12, 0.015, 0.05, 0, 0.3);
    add(new THREE.BoxGeometry(0.07, 0.13, 0.1), skinMat, -0.075, -0.21, 0.04, 0.2, 0, 0.35);
    // forearm hints
    add(new THREE.BoxGeometry(0.1, 0.22, 0.1), gloveMat, -0.09, -0.31, 0.12, 0.45, 0, 0.25);

    const flashMat = new THREE.MeshBasicMaterial({ map: makeFlashTexture(), transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    this.flash = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), flashMat);
    this.flash.position.set(0, 0.025, -0.47);
    this.flash.renderOrder = 102;
    vm.add(this.flash);

    this.muzzleLight = new THREE.PointLight(0xffc46a, 0, 6, 2);
    this.muzzleLight.position.set(0.28, -0.22, -0.9);
    this.camera.add(this.muzzleLight);

    vm.visible = false;
  }

  buildFlashlight() {
    const light = new THREE.SpotLight(0xffe6bd, 0, 42, 0.52, 0.7, 1.5);
    light.position.set(0.05, -0.05, 0);
    const target = new THREE.Object3D();
    target.position.set(0, 0, -6);
    this.camera.add(light);
    this.camera.add(target);
    light.target = target;
    this.flashlight = light;
    // small visible beam cone? skipped for performance
  }

  setVisible(v) { this.vm.visible = v; }

  setDark(dark) {
    this.flashlight.intensity = dark ? 14 : 0;
  }

  reset(spawn) {
    this.position.set(spawn.x, 0, spawn.z);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.alive = true;
    this.ammo = this.maxAmmo;
    this.reloading = false;
    this.reloadT = 0;
    this.cooldown = 0;
    this.recoil = 0;
    this.shake = 0;
    this.stepAccum = 0;
    this.bobTime = 0;
    this.joystick.x = this.joystick.y = 0;
    this.tilt.base = null;
    this.emitAmmo();
    this.applyCamera(0);
  }

  bindInput() {
    window.addEventListener('keydown', (e) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        this.keys.add(e.code);
        if (this.enabled) e.preventDefault();
      }
      if (!this.enabled) return;
      if (e.code === 'KeyR') { this.reload(); e.preventDefault(); }
      if (e.code === 'KeyE') { this.onActionCallback?.(); e.preventDefault(); }
      if (e.code === 'KeyF') { this.onReportCallback?.(); e.preventDefault(); }
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    const canvas = document.getElementById('game');
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      if (this.isTouch) return;
      if (document.pointerLockElement === canvas) {
        if (e.button === 0) this.fire();
      } else {
        canvas.requestPointerLock?.();
        this.dragLook = { id: 'mouse', x: e.clientX, y: e.clientY };
      }
    });
    window.addEventListener('mouseup', () => { if (this.dragLook.id === 'mouse') this.dragLook.id = null; });
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      if (document.pointerLockElement === canvas) {
        this.look(e.movementX * 0.0021, e.movementY * 0.0021);
      } else if (this.dragLook.id === 'mouse' && e.buttons) {
        this.look((e.clientX - this.dragLook.x) * 0.0028, (e.clientY - this.dragLook.y) * 0.0028);
        this.dragLook.x = e.clientX;
        this.dragLook.y = e.clientY;
      }
    });
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.enabled) this.dragLook.id = null;
    });

    // touch look on the 3D canvas
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.enabled || e.pointerType === 'mouse') return;
      if (this.touchLook.id !== null) return;
      this.touchLook = { id: e.pointerId, x: e.clientX, y: e.clientY };
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.enabled || this.touchLook.id !== e.pointerId) return;
      const dx = e.clientX - this.touchLook.x;
      const dy = e.clientY - this.touchLook.y;
      this.touchLook.x = e.clientX;
      this.touchLook.y = e.clientY;
      const sens = 0.0036 * Math.min(1.25, 600 / Math.max(280, innerWidth));
      this.look(dx * sens, dy * sens);
    });
    const endLook = (e) => { if (this.touchLook.id === e.pointerId) this.touchLook.id = null; };
    canvas.addEventListener('pointerup', endLook);
    canvas.addEventListener('pointercancel', endLook);

    // joystick
    const zone = document.getElementById('stick-zone');
    const knob = document.getElementById('stick-knob');
    if (zone && knob) {
      const update = (e) => {
        const rect = zone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const max = rect.width * 0.32;
        const d = Math.hypot(dx, dy);
        if (d > max) { dx = (dx / d) * max; dy = (dy / d) * max; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        this.joystick.x = dx / max;
        this.joystick.y = dy / max;
      };
      zone.addEventListener('pointerdown', (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        e.stopPropagation();
        this.joystick.id = e.pointerId;
        this.joystick.active = true;
        zone.classList.add('active');
        zone.setPointerCapture?.(e.pointerId);
        update(e);
      });
      zone.addEventListener('pointermove', (e) => {
        if (this.joystick.id !== e.pointerId) return;
        e.preventDefault();
        update(e);
      });
      const release = (e) => {
        if (this.joystick.id !== e.pointerId) return;
        this.joystick.id = null;
        this.joystick.active = false;
        this.joystick.x = this.joystick.y = 0;
        knob.style.transform = 'translate(0,0)';
        zone.classList.remove('active');
      };
      zone.addEventListener('pointerup', release);
      zone.addEventListener('pointercancel', release);
      zone.addEventListener('lostpointercapture', release);
    }

    // fire button
    const fire = document.getElementById('btn-fire');
    fire?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.enabled) this.fire();
    });
    const reload = document.getElementById('btn-reload');
    reload?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.enabled) this.reload();
    });
  }

  look(dx, dy) {
    this.yaw -= dx;
    this.pitch -= dy;
    this.pitch = Math.max(-1.32, Math.min(1.32, this.pitch));
    this.lookVel.x += dx * 0.5;
    this.lookVel.y += dy * 0.5;
  }

  async requestTilt(forceOn = true) {
    if (!forceOn) {
      this.tilt.on = false;
      this.tilt.ready = false;
      this.tilt.base = null;
      return { ok: true, enabled: false };
    }
    try {
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) return { ok: false, reason: 'unsupported' };
      if (typeof DOE.requestPermission === 'function') {
        const res = await DOE.requestPermission();
        if (res !== 'granted') {
          this.tilt.denied = true;
          return { ok: false, reason: 'denied' };
        }
      }
      this.tilt.on = true;
      this.tilt.ready = false;
      this.tilt.base = null;
      this.tilt.denied = false;
      if (!this.tilt.bound) {
        this.tilt.handler = (e) => this.onOrientation(e);
        window.addEventListener('deviceorientation', this.tilt.handler, true);
        this.tilt.bound = true;
      }
      return { ok: true, enabled: true };
    } catch (err) {
      return { ok: false, reason: 'error' };
    }
  }

  async enableTilt() { return this.requestTilt(!this.tilt.on); }

  recenterTilt() {
    this.tilt.base = null;
    this.tilt.ready = false;
  }

  onOrientation(e) {
    if (!this.tilt.on || !this.enabled) return;
    const alpha = e.alpha;
    const beta = e.beta;
    const gamma = e.gamma;
    if (alpha === null || beta === null || gamma === null) return;
    if (!this.tilt.base) {
      this.tilt.base = { alpha, beta, gamma };
      this.tilt.baseYaw = this.yaw;
      this.tilt.basePitch = this.pitch;
      this.tilt.landscape = Math.abs(gamma) > 45;
      this.tilt.pitchSource = this.tilt.landscape ? 'gamma' : 'beta';
      this.tilt.pitchBase = this.tilt.landscape ? gamma : beta;
      this.tilt.targetYaw = this.yaw;
      this.tilt.targetPitch = this.pitch;
      return;
    }
    let dAlpha = alpha - this.tilt.base.alpha;
    if (dAlpha > 180) dAlpha -= 360;
    if (dAlpha < -180) dAlpha += 360;
    if (Math.abs(dAlpha) < 1.4) dAlpha = 0;
    const yawTarget = this.tilt.baseYaw + dAlpha * DEG * 1.15;
    const src = this.tilt.pitchSource === 'gamma' ? gamma : beta;
    let dPitch = src - this.tilt.pitchBase;
    if (Math.abs(dPitch) < 1.6) dPitch = 0;
    const sign = this.tilt.pitchSource === 'gamma' ? -1 : -1;
    const pitchTarget = Math.max(-1.2, Math.min(1.2, this.tilt.basePitch + dPitch * DEG * 1.05 * sign));
    this.tilt.targetYaw = yawTarget;
    this.tilt.targetPitch = pitchTarget;
    if (!this.tilt.ready) {
      // ease in on the first usable sample
      this.tilt.targetYaw = this.yaw;
      this.tilt.targetPitch = this.pitch;
      this.tilt.ready = true;
    }
  }

  applyTilt(dt) {
    if (!this.tilt.on || !this.tilt.ready) return;
    const smooth = 1 - Math.pow(0.0008, dt);
    const y = shortest(this.tilt.targetYaw, this.yaw);
    const p = this.tilt.targetPitch - this.pitch;
    this.yaw += y * smooth;
    this.pitch += p * smooth;
    this.pitch = Math.max(-1.32, Math.min(1.32, this.pitch));
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.flashT > 0) {
      this.flashT -= dt;
      if (this.flashT <= 0) { this.flash.material.opacity = 0; this.muzzleLight.intensity = 0; }
    }
    this.applyTilt(dt);
    let forward = 0;
    let strafe = 0;
    if (this.enabled) {
      if (this.keys.has('KeyW')) forward += 1;
      if (this.keys.has('KeyS')) forward -= 1;
      if (this.keys.has('KeyD')) strafe += 1;
      if (this.keys.has('KeyA')) strafe -= 1;
      forward += -this.joystick.y;
      strafe += this.joystick.x;
    }
    const mag = Math.hypot(forward, strafe);
    if (mag > 1) { forward /= mag; strafe /= mag; }
    const inputMag = Math.min(1, mag);
    const sprintKey = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    this.sprinting = inputMag > 0.92 || (sprintKey && inputMag > 0.1);
    const speed = (this.sprinting ? 5.1 : 3.55) * (this.reloading ? 0.92 : 1);
    let moved = 0;
    if (this.enabled && inputMag > 0.06) {
      const sin = Math.sin(this.yaw);
      const cos = Math.cos(this.yaw);
      const dx = (-sin * forward + cos * strafe) * speed * dt;
      const dz = (-cos * forward - sin * strafe) * speed * dt;
      const beforeX = this.position.x;
      const beforeZ = this.position.z;
      this.move(dx, dz);
      moved = Math.hypot(this.position.x - beforeX, this.position.z - beforeZ);
      this.stepAccum += moved;
      const stride = this.sprinting ? 2.1 : 1.8;
      if (this.stepAccum > stride) {
        this.stepAccum = 0;
        this.audio?.step(Math.random() * 2 | 0);
      }
      this.bobTime += dt * (this.sprinting ? 11 : 8);
      this.bob = Math.sin(this.bobTime) * (this.sprinting ? 0.045 : 0.03);
    } else {
      this.bob *= 0.86;
      this.stepAccum = 0;
    }
    this.moveSpeed += (moved / Math.max(dt, 1e-4) - this.moveSpeed) * Math.min(1, dt * 10);

    // reload
    if (this.reloading) {
      this.reloadT += dt;
      if (this.reloadT >= this.reloadDuration) {
        this.reloading = false;
        this.reloadT = 0;
        this.ammo = this.maxAmmo;
        this.emitAmmo();
        this.onReloading?.(false);
      }
    }

    // recoil and shake decay
    this.recoil *= Math.pow(0.0035, dt);
    this.shake *= Math.pow(0.002, dt);
    this.lookVel.x *= Math.pow(0.0005, dt);
    this.lookVel.y *= Math.pow(0.0005, dt);

    this.applyCamera(dt);
    this.updateViewmodel(dt, inputMag);
    if (this.reloading) this.onReloadProgress?.(this.reloadT / this.reloadDuration);
  }

  move(dx, dz) {
    const r = this.radius;
    let nx = this.position.x + dx;
    if (!this.hits(nx, this.position.z, r)) this.position.x = nx;
    let nz = this.position.z + dz;
    if (!this.hits(this.position.x, nz, r)) this.position.z = nz;
    this.position.x = Math.max(-29.4, Math.min(29.4, this.position.x));
    this.position.z = Math.max(-29.4, Math.min(29.4, this.position.z));
  }

  hits(x, z, r) {
    for (const c of this.colliders) {
      if (x > c.minX - r && x < c.maxX + r && z > c.minZ - r && z < c.maxZ + r) return true;
    }
    return false;
  }

  applyCamera(dt) {
    const shake = this.shake;
    const bobY = this.bob;
    const swayX = Math.sin(this.bobTime * 0.5) * 0.004;
    this.camera.position.set(
      this.position.x + swayX * 0.4,
      this.eye + bobY + this.recoil * 0.02,
      this.position.z
    );
    this.roll += ((-this.joystick.x * 0.012 + Math.sin(this.bobTime) * 0.003 + this.recoil * 0.02) - this.roll) * Math.min(1, dt * 8);
    this.camera.rotation.y = this.yaw + (Math.random() - 0.5) * shake * 0.02;
    this.camera.rotation.x = this.pitch + this.recoil * 0.35 + (Math.random() - 0.5) * shake * 0.02;
    this.camera.rotation.z = this.roll;
  }

  updateViewmodel(dt, inputMag) {
    if (!this.vm.visible) return;
    const t = performance.now() / 1000;
    const bobX = Math.sin(this.bobTime) * 0.008 * (0.3 + inputMag);
    const bobY = Math.abs(Math.cos(this.bobTime)) * 0.007 * (0.3 + inputMag);
    const swayX = -this.lookVel.x * 0.02;
    const swayY = this.lookVel.y * 0.02;
    let reloadRot = 0;
    let reloadDrop = 0;
    if (this.reloading) {
      const p = Math.min(1, this.reloadT / this.reloadDuration);
      reloadRot = Math.sin(p * Math.PI) * 0.85;
      reloadDrop = Math.sin(p * Math.PI) * 0.16;
      this.slide.position.z = -0.08 + Math.sin(p * Math.PI) * 0.09;
    } else {
      this.slide.position.z += (-0.08 - this.slide.position.z) * Math.min(1, dt * 10);
    }
    this.vm.position.x += (this.vmBase.x + bobX + swayX - this.vm.position.x) * Math.min(1, dt * 12);
    this.vm.position.y += (this.vmBase.y + bobY + swayY - reloadDrop + this.recoil * 0.03 - this.vm.position.y) * Math.min(1, dt * 12);
    this.vm.position.z += (this.vmBase.z + this.recoil * 0.09 - this.vm.position.z) * Math.min(1, dt * 14);
    this.vm.rotation.x += ((this.vmRotBase.x + this.recoil * 0.8 + reloadRot * 0.45) - this.vm.rotation.x) * Math.min(1, dt * 12);
    this.vm.rotation.y += ((this.vmRotBase.y + Math.sin(t * 0.7) * 0.003 + swayX * 0.5) - this.vm.rotation.y) * Math.min(1, dt * 10);
    this.vm.rotation.z += ((this.vmRotBase.z + reloadRot * 0.7 + this.roll * 0.4) - this.vm.rotation.z) * Math.min(1, dt * 10);
  }

  fire() {
    if (!this.enabled || this.cooldown > 0 || this.reloading || !this.alive) return false;
    if (this.ammo <= 0) {
      this.audio?.dryFire();
      this.cooldown = 0.22;
      this.reload();
      return false;
    }
    this.ammo--;
    this.cooldown = 0.27;
    this.recoil = Math.min(0.075, this.recoil + 0.045);
    this.shake = Math.min(1, this.shake + 0.35);
    this.flashT = 0.055;
    this.flash.material.opacity = 1;
    this.flash.material.rotation = Math.random() * Math.PI;
    this.muzzleLight.intensity = 9;
    this.emitAmmo();
    this.audio?.shot();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const origin = this.camera.position.clone();
    this.onShootCallback?.(origin, dir);
    if (this.ammo <= 0) setTimeout(() => { if (!this.reloading && this.enabled) this.reload(); }, 420);
    return true;
  }

  reload() {
    if (!this.enabled || this.reloading || this.ammo >= this.maxAmmo) return;
    this.reloading = true;
    this.reloadT = 0;
    this.audio?.reload();
    this.onReloading?.(true);
    this.onReloadProgress?.(0);
  }

  emitAmmo() {
    this.onAmmo?.(this.ammo, this.maxAmmo);
  }

  hitFeedback() {
    this.shake = Math.min(1, this.shake + 0.5);
  }

  damage() {
    this.shake = 1;
    this.audio?.heartbeat(1.5);
  }
}
