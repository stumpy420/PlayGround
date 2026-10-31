import * as THREE from '../vendor/three.module.js';
import { rand } from './util.js';

const ADD = THREE.AdditiveBlending;

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.tracers = [];
    this.flashes = [];
    this.debrisGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.shardGeo = new THREE.TetrahedronGeometry(0.12, 0);
    this.flashGeo = new THREE.SphereGeometry(1, 8, 6);
  }

  tracer(from, to, color = 0xffd9a0) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.85,
      blending: ADD, depthWrite: false, toneMapped: false,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    this.scene.add(line);
    this.tracers.push({ line, life: 0.07, maxLife: 0.07 });
  }

  spark(point, color = 0xffb057, count = 5) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, toneMapped: false });
      const mesh = new THREE.Mesh(this.debrisGeo, mat);
      mesh.position.copy(point);
      mesh.scale.setScalar(rand(0.35, 0.9));
      this.scene.add(mesh);
      this.items.push({
        mesh, mat,
        vel: new THREE.Vector3(rand(-4, 4), rand(0.5, 5), rand(-4, 4)),
        spin: new THREE.Vector3(rand(-8, 8), rand(-8, 8), rand(-8, 8)),
        life: rand(0.25, 0.55),
        maxLife: 0.55,
        gravity: 12,
      });
    }
    this.flash(point, color, 0.45, 0.14);
  }

  impact(point, color = 0xffb057, count = 4) {
    this.spark(point, color, count);
  }

  muzzle(point, color = 0xffa14a) {
    this.flash(point, color, 0.5, 0.08);
  }

  explosion(point, color = 0xff7a2b, count = 14) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, toneMapped: false });
      const mesh = new THREE.Mesh(this.shardGeo, mat);
      mesh.position.copy(point);
      mesh.scale.setScalar(rand(0.5, 1.7));
      this.scene.add(mesh);
      const speed = rand(2, 12);
      const a = rand(0, Math.PI * 2);
      const b = rand(-0.4, 1.2);
      this.items.push({
        mesh, mat,
        vel: new THREE.Vector3(Math.cos(a) * Math.cos(b) * speed, Math.sin(b) * speed + 2, Math.sin(a) * Math.cos(b) * speed),
        spin: new THREE.Vector3(rand(-14, 14), rand(-14, 14), rand(-14, 14)),
        life: rand(0.5, 1.1),
        maxLife: 1.1,
        gravity: 14,
      });
    }
    this.flash(point, color, 2.4, 0.4);
    this.flash(point, 0xfff0c0, 0.9, 0.16);
  }

  flash(point, color, size = 1, life = 0.25) {
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.85,
      blending: ADD, depthWrite: false, toneMapped: false,
    });
    const mesh = new THREE.Mesh(this.flashGeo, mat);
    mesh.position.copy(point);
    mesh.scale.setScalar(size * 0.35);
    this.scene.add(mesh);
    this.flashes.push({ mesh, mat, size, life, maxLife: life });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.life -= dt;
      if (it.life <= 0) {
        this.scene.remove(it.mesh);
        it.mat.dispose();
        this.items.splice(i, 1);
        continue;
      }
      it.vel.y -= it.gravity * dt;
      it.mesh.position.addScaledVector(it.vel, dt);
      it.mesh.rotation.x += it.spin.x * dt;
      it.mesh.rotation.y += it.spin.y * dt;
      it.mesh.rotation.z += it.spin.z * dt;
      it.mat.opacity = Math.max(0, it.life / it.maxLife);
    }

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.life -= dt;
      if (tr.life <= 0) {
        this.scene.remove(tr.line);
        tr.line.geometry.dispose();
        tr.line.material.dispose();
        this.tracers.splice(i, 1);
        continue;
      }
      tr.line.material.opacity = (tr.life / tr.maxLife) * 0.85;
    }

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.scene.remove(f.mesh);
        f.mat.dispose();
        this.flashes.splice(i, 1);
        continue;
      }
      const p = 1 - f.life / f.maxLife;
      const s = f.size * (0.35 + p * 1.1);
      f.mesh.scale.setScalar(s);
      f.mat.opacity = (1 - p) * 0.85;
    }
  }
}
