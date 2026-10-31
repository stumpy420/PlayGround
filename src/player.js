import * as THREE from '../vendor/three.module.js';

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;

export class Player {
  constructor(scene, camera, world, state, audio) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.state = state;
    this.audio = audio;
    this.x = world.spawn.x;
    this.z = world.spawn.z;
    this.y = 0;
    this.yaw = 0;
    this.pitch = -.04;
    this.vx = 0; this.vz = 0; this.vy = 0;
    this.radius = .34;
    this.eyeHeight = 1.68;
    this.crouchHeight = 1.12;
    this.heightBlend = 1;
    this.grounded = true;
    this.crouching = false;
    this.sprinting = false;
    this.speed = 0;
    this.bob = 0;
    this.stepTimer = 0;
    this.input = { forward:0, back:0, left:0, right:0, sprint:false, crouch:false, jump:false };
    this.lookSensitivity = 1;
    this.invert = false;
    this.mode = 'foot';
    this.attackT = 0;
    this.attackType = '';
    this.kickT = 0;
    this.blocking = false;
    this.driving = false;
    this.car = null;
    this.carSpeed = 0;
    this.carAngle = Math.PI / 2;
    this.carSteer = 0;
    this.shake = 0;
    this.cinematic = false;
    this.buildArms();
  }

  buildArms() {
    const group = new THREE.Group();
    const sleeveMat = new THREE.MeshStandardMaterial({ color:0x202a2b, roughness:.82 });
    const skinMat = new THREE.MeshStandardMaterial({ color:0xb98b6e, roughness:.8 });
    const tattooMat = new THREE.MeshStandardMaterial({ color:0x304f4c, roughness:.85 });
    const mkArm = (side) => {
      const arm = new THREE.Group();
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(.075,.33,3,6), sleeveMat);
      sleeve.position.set(0,-.1,-.12); sleeve.rotation.x = Math.PI/2.2; arm.add(sleeve);
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(.065,.25,3,6), skinMat);
      forearm.position.set(0,-.07,-.42); forearm.rotation.x = Math.PI/2; arm.add(forearm);
      const fist = new THREE.Mesh(new THREE.SphereGeometry(.1,8,6), skinMat);
      fist.position.set(0,-.03,-.59); arm.add(fist);
      if (side > 0) {
        const ink = new THREE.Mesh(new THREE.TorusGeometry(.065,.008,4,10), tattooMat);
        ink.position.set(0,-.05,-.3); ink.rotation.x = Math.PI/2; arm.add(ink);
      }
      arm.position.set(side * .42, -.4, -.3);
      arm.rotation.set(-.15, side * .08, side * .15);
      arm.scale.setScalar(.72);
      group.add(arm);
      return arm;
    };
    this.rightArm = mkArm(1);
    this.leftArm = mkArm(-1);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.42), new THREE.MeshStandardMaterial({ color:0x1a1d1d, roughness:.8 }));
    boot.position.set(0,-.8,-.65); boot.rotation.x = -.4; boot.visible = false; group.add(boot);
    this.boot = boot;
    group.position.set(0,0,0);
    this.arms = group;
    this.camera.add(group);
    this.armBase = { right:this.rightArm.position.clone(), left:this.leftArm.position.clone() };
  }

  look(dx, dy) {
    if (this.cinematic) return;
    this.yaw -= dx * .0022 * this.lookSensitivity;
    this.pitch -= dy * .0022 * this.lookSensitivity * (this.invert ? -1 : 1);
    this.pitch = clamp(this.pitch, -1.38, 1.2);
    if (this.driving) {
      this.carAngle -= dx * .0012 * this.lookSensitivity;
    }
  }

  moveInput(x, z) {
    this.input.left = x < -.2 ? 1 : 0;
    this.input.right = x > .2 ? 1 : 0;
    this.input.forward = z < -.2 ? 1 : 0;
    this.input.back = z > .2 ? 1 : 0;
  }

  jump() {
    if (this.driving) return;
    if (this.grounded) {
      this.vy = 5.3; this.grounded = false; this.audio?.jump();
    }
  }

  animateAttack(type) {
    this.attackType = type;
    this.attackT = type === 'kick' ? .38 : .3;
    if (type === 'kick') { this.kickT = .38; this.boot.visible = true; }
    if (type === 'special') { this.attackT = .7; }
  }

  enterCar(car) {
    if (this.driving) return;
    this.driving = true;
    this.mode = 'drive';
    this.car = car;
    this.carSpeed = 0;
    this.carAngle = car.rotation.y;
    this.arms.visible = false;
    this.audio?.carStart();
  }

  exitCar() {
    if (!this.driving) return;
    this.driving = false;
    this.mode = 'foot';
    this.arms.visible = true;
    this.x = this.car.position.x + 2.2;
    this.z = this.car.position.z + 1.2;
    if (this.world.isBlocked(this.x, this.z, this.radius)) { this.x = this.car.position.x - 2.2; this.z = this.car.position.z - 1.2; }
    this.y = 0; this.vy = 0;
    this.car = null;
    this.audio?.carStop();
  }

  addShake(amount) { this.shake = Math.min(1.2, this.shake + amount); }

  update(dt, elapsed) {
    if (this.driving) { this.updateDriving(dt, elapsed); return; }
    const s = this.state.player;
    const sprinting = this.input.sprint && s.stamina > 3 && !this.crouching;
    this.sprinting = sprinting;
    this.crouching = this.input.crouch;
    const maxSpeed = this.crouching ? 2.3 : (sprinting ? 7.1 : 4.35);
    let ix = this.input.right - this.input.left;
    let iz = this.input.back - this.input.forward;
    const len = Math.hypot(ix, iz);
    if (len > 1) { ix /= len; iz /= len; }
    const forwardX = -Math.sin(this.yaw), forwardZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw), rightZ = -Math.sin(this.yaw);
    const wishX = forwardX * -iz + rightX * ix;
    const wishZ = forwardZ * -iz + rightZ * ix;
    const accel = this.grounded ? 34 : 8;
    this.vx = lerp(this.vx, wishX * maxSpeed, clamp(accel * dt, 0, 1));
    this.vz = lerp(this.vz, wishZ * maxSpeed, clamp(accel * dt, 0, 1));
    if (!wishX && !wishZ && this.grounded) { this.vx *= Math.pow(.0008, dt); this.vz *= Math.pow(.0008, dt); }
    this.speed = Math.hypot(this.vx, this.vz);

    // stamina
    if (sprinting && this.speed > .8) {
      s.stamina = Math.max(0, s.stamina - dt * 7);
      s.energy = Math.max(0, s.energy - dt * .04);
    } else {
      s.stamina = Math.min(100, s.stamina + dt * 10);
    }

    const nx = this.x + this.vx * dt;
    const nz = this.z + this.vz * dt;
    if (!this.world.isBlocked(nx, this.z, this.radius)) this.x = nx; else this.vx *= -.05;
    if (!this.world.isBlocked(this.x, nz, this.radius)) this.z = nz; else this.vz *= -.05;

    // jump / gravity
    if (!this.grounded) {
      this.vy -= 14 * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) { this.y = 0; this.vy = 0; this.grounded = true; this.audio?.land(); }
    }
    const targetEye = this.crouching ? this.crouchHeight : this.eyeHeight;
    this.heightBlend = lerp(this.heightBlend, targetEye, dt * 9);
    this.bob += dt * (sprinting ? 12 : 7) * (this.speed > .5 ? 1 : 0);
    const bobY = this.speed > .5 ? Math.sin(this.bob) * (sprinting ? .06 : .032) : 0;
    const bobX = this.speed > .5 ? Math.cos(this.bob * .5) * .012 : 0;
    this.shake = Math.max(0, this.shake - dt * 2.8);
    const shakeX = (Math.random() - .5) * this.shake * .025;
    const shakeY = (Math.random() - .5) * this.shake * .025;
    this.camera.position.set(this.x + bobX + shakeX, this.y + this.heightBlend + bobY + shakeY, this.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = this.crouching ? .01 : 0;

    // footsteps
    if (this.speed > .7 && this.grounded) {
      this.stepTimer -= dt * (sprinting ? 1.55 : 1);
      if (this.stepTimer <= 0) {
        this.stepTimer = .42;
        this.audio?.footstep(this.crouching, this.world.weather === 'rain');
      }
    } else this.stepTimer = .15;

    // arms animation
    this.arms.visible = !this.cinematic;
    this.arms.position.y = bobY * .7;
    this.arms.position.x = bobX * .5;
    const idleSway = Math.sin(this.bob * .5) * .012;
    if (this.attackT > 0) {
      this.attackT -= dt;
      const p = 1 - clamp(this.attackT / (this.attackType === 'kick' ? .38 : .3), 0, 1);
      const punch = Math.sin(p * Math.PI);
      if (this.attackType === 'punch') {
        this.rightArm.position.z = this.armBase.right.z - punch * .7;
        this.rightArm.position.x = this.armBase.right.x - punch * .1;
        this.rightArm.rotation.x = -.2 - punch * .5;
        this.leftArm.rotation.x = -.1;
      } else if (this.attackType === 'special') {
        this.rightArm.position.z = this.armBase.right.z - punch * .9;
        this.leftArm.position.z = this.armBase.left.z - punch * .9;
        this.rightArm.rotation.x = this.leftArm.rotation.x = -.3 - punch * .7;
      } else {
        this.boot.visible = true;
        this.boot.position.y = -.8 + punch * .35;
        this.boot.position.z = -.65 - punch * .7;
        this.boot.rotation.x = -.4 + punch * .9;
      }
      if (this.attackT <= 0) {
        this.rightArm.position.copy(this.armBase.right);
        this.leftArm.position.copy(this.armBase.left);
        this.boot.visible = false;
      }
    } else {
      this.rightArm.position.x = this.armBase.right.x;
      this.rightArm.position.z = this.armBase.right.z;
      this.leftArm.position.x = this.armBase.left.x;
      this.leftArm.position.z = this.armBase.left.z;
      if (this.blocking) {
        this.rightArm.position.set(-.15, -.18, -.38); this.leftArm.position.set(.15, -.18, -.38);
        this.rightArm.rotation.x = -.9; this.leftArm.rotation.x = -.9;
      } else {
        this.rightArm.rotation.x = -.15 + idleSway;
        this.leftArm.rotation.x = -.15 - idleSway;
      }
    }
  }

  updateDriving(dt, elapsed) {
    const car = this.car;
    if (!car) { this.driving = false; this.mode = 'foot'; return; }
    const throttle = this.input.forward ? 1 : (this.input.back ? -.55 : 0);
    const steer = (this.input.left ? 1 : 0) - (this.input.right ? 1 : 0);
    this.carSpeed = lerp(this.carSpeed, throttle * 17, dt * 1.1);
    if (!throttle) this.carSpeed *= Math.pow(.3, dt);
    if (this.carSpeed < -.1) this.carSpeed = Math.max(this.carSpeed, -5);
    this.carAngle += steer * dt * (1.2 + Math.abs(this.carSpeed) * .025) * (this.carSpeed >= 0 ? 1 : -1);
    const nx = car.position.x + Math.sin(this.carAngle) * this.carSpeed * dt;
    const nz = car.position.z + Math.cos(this.carAngle) * this.carSpeed * dt;
    if (!this.world.isBlocked(nx, nz, 1.25)) {
      car.position.x = nx; car.position.z = nz;
    } else {
      this.carSpeed *= -.18;
      this.addShake(.3);
      this.audio?.impact(.4);
    }
    car.rotation.y = this.carAngle;
    car.rotation.z = lerp(car.rotation.z, -steer * .02, dt * 4);
    // camera chase
    const camDist = 5.8, camHeight = 2.55;
    const tx = car.position.x - Math.sin(this.carAngle) * camDist;
    const tz = car.position.z - Math.cos(this.carAngle) * camDist;
    this.camera.position.lerp(new THREE.Vector3(tx, camHeight, tz), clamp(dt * 6, 0, 1));
    const lookAt = new THREE.Vector3(car.position.x + Math.sin(this.carAngle) * 4, 1.2, car.position.z + Math.cos(this.carAngle) * 4);
    this.camera.lookAt(lookAt);
    // headlights
    this.shake = Math.max(0, this.shake - dt * 3);
    this.x = car.position.x; this.z = car.position.z; this.y = 0;
    this.audio?.engine(Math.abs(this.carSpeed) / 17);
  }

  teleport(x, z, yaw = 0) {
    this.x = x; this.z = z; this.y = 0; this.yaw = yaw; this.vx = this.vz = this.vy = 0;
    this.camera.position.set(x, this.eyeHeight, z);
    this.camera.rotation.set(this.pitch, yaw, 0);
  }

  getForward() {
    return { x:-Math.sin(this.yaw), z:-Math.cos(this.yaw) };
  }

  distanceTo(x, z) { return Math.hypot(this.x - x, this.z - z); }
}
