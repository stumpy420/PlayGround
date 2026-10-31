import * as THREE from 'three';
import { makeGlowTexture } from '../world/buildings.js';

const tmpV = new THREE.Vector3();

export class Effects {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.projectiles = [];
    this.particles = [];
    this.arcs = [];
    this.lines = [];
    this.rings = [];
    this.lightPool = [];
    this.glowTex = makeGlowTexture();
  }

  burst(pos, color = 0xffcf8a, count = 14, speed = 3, life = 0.8, size = 0.12) {
    const geo = new THREE.SphereGeometry(size, 4, 3);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(pos);
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.8 + 0.1, Math.random() - 0.5).normalize();
      m.userData.vel = dir.multiplyScalar(speed * (0.4 + Math.random()));
      m.userData.life = life * (0.6 + Math.random() * 0.6);
      m.userData.max = m.userData.life;
      this.scene.add(m);
      this.particles.push(m);
    }
  }

  spark(pos, color = 0xffe0a0) { this.burst(pos, color, 7, 2.2, 0.35, 0.08); }

  slash(pos, yaw, color = 0xfff0cf) {
    const geo = new THREE.RingGeometry(0.9, 2.1, 18, 1, -0.7, 1.4);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -yaw + Math.PI / 2;
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1.1, 0));
    this.scene.add(mesh);
    this.arcs.push({ mesh, life: 0.22, max: 0.22 });
  }

  ring(pos, color = 0xffd27a, radius = 4, life = 0.5) {
    const geo = new THREE.RingGeometry(radius * 0.2, radius, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(pos).add(new THREE.Vector3(0, 0.15, 0));
    this.scene.add(mesh);
    this.rings.push({ mesh, life, max: life, radius });
  }

  beam(from, to, color = 0x9fd8ff, life = 0.25) {
    const points = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = from.clone().lerp(to, t);
      if (i > 0 && i < steps) {
        p.x += (Math.random() - 0.5) * 0.8;
        p.y += (Math.random() - 0.5) * 0.8;
        p.z += (Math.random() - 0.5) * 0.8;
      }
      points.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.lines.push({ mesh: line, life, max: life });
    const light = new THREE.PointLight(color, 16, 25, 2);
    light.position.copy(to);
    this.scene.add(light);
    this.lightPool.push({ light, life: 0.25 });
    this.burst(to, color, 16, 4, 0.5, 0.1);
  }

  spawnProjectile(o) {
    const group = new THREE.Group();
    const color = o.color || 0xff9b45;
    const core = new THREE.Mesh(new THREE.SphereGeometry(o.size || 0.22, 8, 6), new THREE.MeshBasicMaterial({ color }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar((o.size || 0.22) * 9);
    group.add(core, glow);
    group.position.copy(o.pos);
    this.scene.add(group);
    const light = new THREE.PointLight(color, 7, 12, 2);
    group.add(light);
    const p = {
      group, core, color, light, vel: o.dir.clone().normalize().multiplyScalar(o.speed || 26),
      damage: o.damage || 10, owner: o.owner || 'player', type: o.type || 'fire',
      radius: o.radius || 0.55, life: o.life || 3.2, age: 0, onHit: o.onHit,
      aoe: o.aoe || 0, slow: o.slow || 0, target: o.target || null, homing: o.homing || 0,
    };
    this.projectiles.push(p);
    return p;
  }

  update(dt) {
    const game = this.game;
    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.life -= dt;
      if (p.userData.life <= 0) { this.scene.remove(p); p.material.dispose(); this.particles.splice(i, 1); continue; }
      p.userData.vel.y -= 9.8 * dt;
      p.position.addScaledVector(p.userData.vel, dt);
      p.material.opacity = p.userData.life / p.userData.max;
      p.scale.setScalar(0.5 + p.userData.life / p.userData.max);
    }
    // arcs
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      a.life -= dt;
      if (a.life <= 0) { this.scene.remove(a.mesh); a.mesh.geometry.dispose(); a.mesh.material.dispose(); this.arcs.splice(i, 1); continue; }
      a.mesh.material.opacity = 0.75 * (a.life / a.max);
      a.mesh.scale.setScalar(1 + (1 - a.life / a.max) * 0.35);
    }
    // rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) { this.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); this.rings.splice(i, 1); continue; }
      const t = 1 - r.life / r.max;
      r.mesh.scale.setScalar(0.4 + t * 1.5);
      r.mesh.material.opacity = 0.7 * (1 - t);
    }
    // lines
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const l = this.lines[i];
      l.life -= dt;
      if (l.life <= 0) { this.scene.remove(l.mesh); l.mesh.geometry.dispose(); l.mesh.material.dispose(); this.lines.splice(i, 1); continue; }
      l.mesh.material.opacity = l.life / l.max;
    }
    for (let i = this.lightPool.length - 1; i >= 0; i--) {
      const l = this.lightPool[i];
      l.life -= dt;
      l.light.intensity = Math.max(0, 16 * (l.life / 0.25));
      if (l.life <= 0) { this.scene.remove(l.light); this.lightPool.splice(i, 1); }
    }
    // projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      p.life -= dt;
      let remove = false;
      if (p.homing && p.target && p.target.alive) {
        const desired = p.target.group.position.clone().add(new THREE.Vector3(0, 1, 0)).sub(p.group.position).normalize().multiplyScalar(p.vel.length());
        p.vel.lerp(desired, Math.min(1, dt * 3));
      }
      p.group.position.addScaledVector(p.vel, dt);
      p.group.position.y += Math.sin(p.age * 12) * 0.002;
      const ground = game.world.groundHeight(p.group.position.x, p.group.position.z);
      if (p.group.position.y < ground + 0.2) remove = true;
      if (p.age > p.life) remove = true;
      if (!remove) {
        if (p.owner === 'player') {
          for (const e of game.enemies) {
            if (!e.alive || (e.interior || null) !== (game.world.activeInteriorId || null)) continue;
            tmpV.copy(e.group.position).add(new THREE.Vector3(0, e.hitHeight || 1, 0));
            if (p.group.position.distanceTo(tmpV) < (e.hitRadius || 0.7) + p.radius) {
              this.projectileHit(p, e);
              remove = true; break;
            }
          }
        } else {
          const targets = [game.player, ...game.companions];
          for (const t of targets) {
            if (!t || t.dead) continue;
            tmpV.copy(t.position).add(new THREE.Vector3(0, 1, 0));
            if (p.group.position.distanceTo(tmpV) < 1.0 + p.radius) {
              this.projectileHit(p, t);
              remove = true; break;
            }
          }
        }
      }
      if (remove) this.explodeProjectile(p, i);
    }
  }

  projectileHit(p, target) {
    if (p.onHit) p.onHit(target, p);
    else if (target.takeDamage) target.takeDamage(p.damage, p);
  }

  explodeProjectile(p, index) {
    const game = this.game;
    const pos = p.group.position.clone();
    this.scene.remove(p.group);
    p.core.geometry.dispose(); p.core.material.dispose();
    if (p.aoe > 0) {
      this.burst(pos, p.color, 24, 6, 0.7, 0.14);
      this.ring(pos, p.color, p.aoe, 0.5);
      const targets = p.owner === 'player' ? game.enemies : [game.player, ...game.companions];
      for (const t of targets) {
        if (!t || !t.alive || t.dead) continue;
        const d = t.group ? t.group.position.distanceTo(pos) : t.position.distanceTo(pos);
        if (d < p.aoe) {
          const falloff = 1 - (d / p.aoe) * 0.55;
          if (t.takeDamage) t.takeDamage(Math.round(p.damage * falloff), p);
        }
      }
      this.game.audio.playExplosion();
      this.game.player.cameraShake = Math.max(this.game.player.cameraShake, 0.22);
    } else {
      this.burst(pos, p.color, 10, 3, 0.45, 0.1);
    }
    this.projectiles.splice(index, 1);
  }

  damageNumber(pos, amount, kind = '') {
    const game = this.game;
    const v = pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.4 + Math.random() * 0.4, 0));
    v.project(game.camera);
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
    const el = document.createElement('div');
    el.className = 'dmg ' + kind;
    el.textContent = (kind === 'heal' ? '+' : '') + amount;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    game.ui.floatLayer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  screenFlash(color = '#ffcf8a', alpha = 0.22) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;inset:0;background:${color};opacity:${alpha};pointer-events:none;z-index:15;transition:opacity .35s`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 500);
  }
}
