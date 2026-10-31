import * as THREE from '../vendor/three.module.js';
import { terrainHeight, clamp, rand, TAU, damp } from './util.js';

const BOLT_GEO = new THREE.SphereGeometry(0.11, 6, 6);
const BOLT_MAT = new THREE.MeshBasicMaterial({ color: 0xffa14a, toneMapped: false });

export class Bolt {
  constructor(scene, origin, direction, opts = {}) {
    this.scene = scene;
    this.mesh = new THREE.Mesh(BOLT_GEO, BOLT_MAT);
    this.mesh.position.copy(origin);
    this.mesh.scale.setScalar(opts.scale || 1);
    scene.add(this.mesh);
    this.vel = direction.clone().normalize().multiplyScalar(opts.speed || 34);
    this.life = 4;
    this.damage = opts.damage || 8;
    this.alive = true;
    this.trailT = 0;
  }

  update(dt, ctx) {
    if (!this.alive) return;
    this.life -= dt;
    if (this.life <= 0) return this.kill();

    this.mesh.position.addScaledVector(this.vel, dt);

    if (this.mesh.position.y < terrainHeight(this.mesh.position.x, this.mesh.position.z)) {
      ctx.effects.impact(this.mesh.position, 0xffa14a, 4);
      return this.kill();
    }

    const p = ctx.player.pos;
    const dx = this.mesh.position.x - p.x;
    const dy = this.mesh.position.y - (p.y + 1.15);
    const dz = this.mesh.position.z - p.z;
    if (dx * dx + dy * dy + dz * dz < 0.85 * 0.85) {
      ctx.player.damage(this.damage);
      ctx.effects.impact(this.mesh.position, 0xff5a3a, 7);
      return this.kill();
    }
  }

  kill() {
    this.alive = false;
    this.scene.remove(this.mesh);
  }
}

export class Drone {
  constructor(scene, position, variant = 'scout') {
    this.scene = scene;
    this.variant = variant;
    this.heavy = variant === 'heavy';
    this.alive = true;
    this.health = this.heavy ? 210 : 82;
    this.maxHealth = this.health;
    this.hitRadius = this.heavy ? 1.35 : 0.95;
    this.damage = this.heavy ? 13 : 7;
    this.speed = this.heavy ? 4.4 : 6.6;
    this.fireInterval = this.heavy ? 2.1 : 1.55;
    this.boltSpeed = this.heavy ? 30 : 36;
    this.altitude = this.heavy ? rand(3.2, 5.2) : rand(2.4, 4.4);

    this.anchor = position.clone();
    this.angle = rand(0, TAU);
    this.state = 'patrol';
    this.alert = 0;
    this.fireCd = rand(0.8, 2.2);
    this.burst = 0;
    this.burstCd = 0;
    this.flash = 0;
    this.phase = rand(0, TAU);
    this.alertedOnce = false;
    this.vel = new THREE.Vector3();
    this.t = 0;

    this.build();
  }

  build() {
    const s = this.heavy ? 1.55 : 1;
    const group = new THREE.Group();
    group.scale.setScalar(s);
    this.group = group;

    const hullMat = new THREE.MeshStandardMaterial({
      color: this.heavy ? 0x3a2f2c : 0x2b2e32,
      roughness: 0.42,
      metalness: 0.78,
      flatShading: true,
    });
    this.hullMat = hullMat;

    const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), hullMat);
    body.scale.set(1.05, 0.66, 1.25);
    body.castShadow = true;
    group.add(body);

    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.9), hullMat);
    shell.position.y = 0.2;
    shell.castShadow = true;
    group.add(shell);

    // sensor eye
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x79f2ff, toneMapped: false });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), this.eyeMat);
    eye.position.set(0, -0.02, -0.78);
    group.add(eye);

    const socket = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 6, 16), hullMat);
    socket.position.set(0, -0.02, -0.74);
    group.add(socket);

    // hover ring
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0x2f8f9e, toneMapped: false, transparent: true, opacity: 0.85 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.038, 6, 26), this.ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.24;
    group.add(ring);
    this.ring = ring;

    // fins
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.12), hullMat);
      fin.position.set(Math.cos(a) * 0.72, 0.02, Math.sin(a) * 0.72);
      fin.rotation.y = -a;
      fin.castShadow = true;
      group.add(fin);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), this.ringMat);
      glow.position.set(Math.cos(a) * 0.86, -0.16, Math.sin(a) * 0.86);
      group.add(glow);
    }

    // weapon pod
    if (this.heavy) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.5), hullMat);
      pod.position.set(0, -0.28, -0.35);
      group.add(pod);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), hullMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, -0.28, -0.75);
      group.add(barrel);
    }

    group.position.copy(this.anchor);
    group.position.y = terrainHeight(this.anchor.x, this.anchor.z) + this.altitude;
    this.scene.add(group);
  }

  update(dt, ctx) {
    if (!this.alive) return;
    this.t += dt;
    this.flash = Math.max(0, this.flash - dt * 6);

    const player = ctx.player;
    const px = player.pos.x, pz = player.pos.z;
    const pos = this.group.position;
    const dx = px - pos.x, dz = pz - pos.z;
    const dist = Math.hypot(dx, dz);

    const playerAlive = player.health > 0;
    const detectRange = (this.heavy ? 52 : 44) + (ctx.storm ? 12 : 0);
    const engageRange = this.heavy ? 34 : 30;

    if (playerAlive && dist < detectRange) {
      this.state = 'engage';
      this.alert = Math.min(1, this.alert + dt * 1.6);
      if (!this.alertedOnce) {
        this.alertedOnce = true;
        ctx.game.audio.alert();
      }
    } else {
      this.state = 'patrol';
      this.alert = Math.max(0, this.alert - dt);
      this.alertedOnce = false;
    }

    let targetVX = 0;
    let targetVZ = 0;

    if (this.state === 'engage') {
      this.angle += dt * 0.6;
      const desired = this.heavy ? 19 : 15;
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      const radial = clamp((dist - desired) / 8, -1, 1);
      const strafe = Math.sin(this.t * 0.9 + this.phase) * 0.75;

      targetVX = nx * radial * this.speed + -nz * strafe * this.speed * 0.55;
      targetVZ = nz * radial * this.speed + nx * strafe * this.speed * 0.55;

      // firing
      this.fireCd -= dt;
      if (dist < engageRange && this.fireCd <= 0) {
        if (this.burst <= 0) this.burst = this.heavy ? 3 : 2;
        this.burstCd -= dt;
        if (this.burstCd <= 0) {
          this.fire(ctx, dist);
          this.burst--;
          this.burstCd = 0.13;
          if (this.burst <= 0) {
            this.fireCd = this.fireInterval * (ctx.storm ? 0.78 : 1) * rand(0.85, 1.2);
            this.burstCd = 0;
          }
        }
      }
    } else {
      this.angle += dt * 0.24;
      const radius = this.heavy ? 10 : 8;
      const tx = this.anchor.x + Math.cos(this.angle) * radius;
      const tz = this.anchor.z + Math.sin(this.angle) * radius;
      const ddx = tx - pos.x, ddz = tz - pos.z;
      const dl = Math.hypot(ddx, ddz) || 1;
      targetVX = (ddx / dl) * this.speed * 0.35;
      targetVZ = (ddz / dl) * this.speed * 0.35;
    }

    this.vel.x = damp(this.vel.x, targetVX, 2.2, dt);
    this.vel.z = damp(this.vel.z, targetVZ, 2.2, dt);
    pos.x += this.vel.x * dt;
    pos.z += this.vel.z * dt;
    pos.x = clamp(pos.x, -215, 215);
    pos.z = clamp(pos.z, -215, 215);

    const ground = terrainHeight(pos.x, pos.z);
    const bob = Math.sin(this.t * 1.7 + this.phase) * 0.22;
    const desiredY = ground + this.altitude + bob;
    pos.y = damp(pos.y, desiredY, 3, dt);

    // face the player when engaged
    if (this.state === 'engage') {
      const targetYaw = Math.atan2(dx, dz) + Math.PI;
      let diff = ((targetYaw - this.group.rotation.y + Math.PI) % TAU + TAU) % TAU - Math.PI;
      this.group.rotation.y += diff * Math.min(1, dt * 3.5);
    } else {
      this.group.rotation.y += dt * 0.35;
    }

    // visual state
    const alertColor = this.state === 'engage' ? 0xff3b46 : 0x79f2ff;
    this.eyeMat.color.setHex(alertColor);
    this.ringMat.color.setHex(this.state === 'engage' ? 0xff5a3a : 0x2f8f9e);
    this.ring.rotation.z += dt * 2.5;
    this.hullMat.emissive.setRGB(this.flash * 0.9, this.flash * 0.75, this.flash * 0.5);
    this.hullMat.emissiveIntensity = 1;
  }

  fire(ctx, dist) {
    const origin = this.group.position.clone();
    origin.y -= 0.15;
    const target = ctx.player.pos.clone();
    target.y += 1.1;
    const dir = target.sub(origin).normalize();
    dir.x += rand(-0.03, 0.03);
    dir.y += rand(-0.02, 0.02);
    dir.z += rand(-0.03, 0.03);
    dir.normalize();
    ctx.game.spawnBolt(origin, dir, {
      damage: this.damage,
      speed: this.boltSpeed,
      scale: this.heavy ? 1.5 : 1,
    });
    ctx.effects.muzzle(origin, 0xffa14a);
    ctx.game.audio.enemyShot(dist);
  }

  hit(amount, ctx, point) {
    if (!this.alive) return false;
    this.health -= amount;
    this.flash = 1;
    this.state = 'engage';
    this.alert = 1;
    if (this.health <= 0) {
      this.die(ctx);
      return true;
    }
    ctx.effects.spark(point || this.group.position, 0x9fe8ff, 4);
    return false;
  }

  die(ctx) {
    this.alive = false;
    ctx.effects.explosion(this.group.position, this.heavy ? 0xff7a2b : 0x79f2ff, this.heavy ? 22 : 13);
    this.scene.remove(this.group);
    ctx.game.onDroneKilled(this);
  }
}
