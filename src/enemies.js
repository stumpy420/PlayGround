import * as THREE from 'three';

const TYPES = {
  scout: {
    hp: 55,
    speed: 3.7,
    damage: 7,
    scale: 0.78,
    score: 80,
    radius: 0.42,
    color: '#35636b',
    eye: '#ff5b5b',
    label: 'SQUEAKER',
  },
  grunt: {
    hp: 105,
    speed: 2.2,
    damage: 11,
    scale: 1,
    score: 100,
    radius: 0.52,
    color: '#3e4e54',
    eye: '#ff7e45',
    label: 'MOUSE TROOPER',
  },
  brute: {
    hp: 300,
    speed: 1.35,
    damage: 23,
    scale: 1.55,
    score: 280,
    radius: 0.74,
    color: '#4c3f35',
    eye: '#ff3f51',
    label: 'RAT BRUTE',
  },
};

const geo = {
  body: new THREE.SphereGeometry(0.38, 14, 11),
  belly: new THREE.SphereGeometry(0.3, 12, 9),
  head: new THREE.SphereGeometry(0.27, 14, 11),
  snout: new THREE.ConeGeometry(0.15, 0.3, 10),
  ear: new THREE.CylinderGeometry(0.12, 0.13, 0.035, 12),
  earInner: new THREE.CylinderGeometry(0.075, 0.085, 0.04, 12),
  eye: new THREE.SphereGeometry(0.055, 8, 6),
  pupil: new THREE.SphereGeometry(0.022, 6, 5),
  plate: new THREE.BoxGeometry(0.34, 0.13, 0.24),
  sidePlate: new THREE.BoxGeometry(0.09, 0.22, 0.34),
  limb: new THREE.CylinderGeometry(0.055, 0.046, 0.34, 6),
  foot: new THREE.BoxGeometry(0.15, 0.07, 0.25),
  tail: new THREE.TorusGeometry(0.22, 0.028, 5, 12, Math.PI * 1.35),
  antenna: new THREE.CylinderGeometry(0.012, 0.018, 0.34, 5),
  backpack: new THREE.BoxGeometry(0.26, 0.26, 0.16),
  core: new THREE.IcosahedronGeometry(0.08, 0),
  tooth: new THREE.ConeGeometry(0.018, 0.06, 4),
  barBack: new THREE.PlaneGeometry(1, 0.12),
  barFill: new THREE.PlaneGeometry(1, 0.065),
  ring: new THREE.RingGeometry(0.55, 0.75, 28),
};

function material(params) {
  return new THREE.MeshStandardMaterial(params);
}

const shared = {
  metal: material({ color: '#59666b', roughness: 0.42, metalness: 0.78 }),
  dark: material({ color: '#172127', roughness: 0.52, metalness: 0.68 }),
  rubber: material({ color: '#10191d', roughness: 0.9, metalness: 0.06 }),
  tooth: material({ color: '#e7e1cc', roughness: 0.55, metalness: 0.1 }),
};
for (const mat of Object.values(shared)) mat.__shared = true;

let enemyId = 0;

export class Enemy {
  constructor(type, position, wave, scene) {
    this.id = ++enemyId;
    this.type = type;
    this.def = TYPES[type];
    this.scene = scene;
    this.wave = wave;
    this.maxHp = Math.round(this.def.hp * (1 + (wave - 1) * 0.13));
    this.hp = this.maxHp;
    this.speed = this.def.speed * (1 + Math.min(0.35, (wave - 1) * 0.022));
    this.damage = this.def.damage + Math.max(0, wave - 1) * 0.5;
    this.radius = this.def.radius;
    this.score = this.def.score;
    this.headshotBonus = Math.round(this.def.score * 0.85);
    this.dead = false;
    this.remove = false;
    this.dying = false;
    this.dyingT = 0;
    this.spawnT = 0;
    this.spawnDuration = 0.62;
    this.attackCooldown = 0.55 + Math.random() * 0.5;
    this.attackAnim = 0;
    this.hitFlash = 0;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.stuckT = 0;
    this.stuckDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    this.flashMats = [];
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.position.y = 0;
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);
    this.build();
    this.group.scale.setScalar(this.def.scale);
    this.group.traverse((child) => {
      if (child.isMesh && !child.userData.noShadow) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(this.group);
  }

  makeMat(color, roughness = 0.45, metalness = 0.65) {
    const m = material({ color, roughness, metalness, emissive: '#000000' });
    this.flashMats.push(m);
    return m;
  }

  add(mesh, parent = this.bodyGroup, x = 0, y = 0, z = 0) {
    mesh.position.set(x, y, z);
    mesh.userData.enemy = this;
    parent.add(mesh);
    return mesh;
  }

  build() {
    const d = this.def;
    const armor = this.makeMat(d.color, 0.4, 0.68);
    const armorDark = this.makeMat('#232d31', 0.52, 0.62);
    const belly = this.makeMat('#858b7d', 0.63, 0.18);
    const eyeMat = new THREE.MeshBasicMaterial({ color: d.eye });

    const body = this.add(new THREE.Mesh(geo.body, armor), this.bodyGroup, 0, 0.53, 0);
    body.scale.set(0.88, 1.04, 1.1);
    body.userData.part = 'body';
    const bellyMesh = this.add(new THREE.Mesh(geo.belly, belly), this.bodyGroup, 0, 0.45, 0.24);
    bellyMesh.scale.set(0.82, 0.92, 0.48);
    bellyMesh.userData.part = 'body';

    const head = this.add(new THREE.Mesh(geo.head, armor), this.bodyGroup, 0, 0.88, 0.25);
    head.userData.part = 'head';
    head.userData.head = true;
    const face = this.add(new THREE.Mesh(geo.head, belly), this.bodyGroup, 0, 0.84, 0.4);
    face.scale.set(0.62, 0.63, 0.52);
    face.userData.part = 'head';
    face.userData.head = true;

    const snout = this.add(new THREE.Mesh(geo.snout, belly), this.bodyGroup, 0, 0.83, 0.62);
    snout.rotation.x = Math.PI / 2;
    snout.scale.set(0.8, 1, 0.72);
    snout.userData.part = 'head';
    snout.userData.head = true;
    const nose = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), shared.rubber), this.bodyGroup, 0, 0.85, 0.78);
    nose.userData.part = 'head';
    nose.userData.head = true;

    for (const side of [-1, 1]) {
      const ear = this.add(new THREE.Mesh(geo.ear, armorDark), this.bodyGroup, side * 0.24, 1.12, 0.25);
      ear.rotation.x = 0.12;
      ear.rotation.z = side * 0.16;
      ear.userData.part = 'head';
      ear.userData.head = true;
      const inner = this.add(new THREE.Mesh(geo.earInner, belly), this.bodyGroup, side * 0.24, 1.13, 0.255);
      inner.rotation.x = 0.12;
      inner.rotation.z = side * 0.16;
      inner.userData.part = 'head';
      inner.userData.head = true;

      const eye = this.add(new THREE.Mesh(geo.eye, eyeMat), this.bodyGroup, side * 0.115, 0.93, 0.5);
      eye.userData.part = 'head';
      eye.userData.head = true;
      eye.userData.noShadow = true;
      const pupil = this.add(new THREE.Mesh(geo.pupil, shared.dark), this.bodyGroup, side * 0.115, 0.935, 0.55);
      pupil.userData.part = 'head';
      pupil.userData.head = true;
      pupil.userData.noShadow = true;

      const sidePlate = this.add(new THREE.Mesh(geo.sidePlate, armorDark), this.bodyGroup, side * 0.36, 0.58, 0);
      sidePlate.rotation.z = side * 0.08;
      sidePlate.userData.part = 'body';

      const earGlow = new THREE.PointLight(d.eye, 0.35, 1.1, 2);
      earGlow.position.set(side * 0.12, 0.93, 0.55);
      this.bodyGroup.add(earGlow);
    }

    const topPlate = this.add(new THREE.Mesh(geo.plate, armorDark), this.bodyGroup, 0, 0.82, -0.03);
    topPlate.scale.set(1.14, 1, 1.2);
    topPlate.userData.part = 'body';

    const backpack = this.add(new THREE.Mesh(geo.backpack, armorDark), this.bodyGroup, 0, 0.66, -0.39);
    backpack.userData.part = 'body';
    const core = this.add(new THREE.Mesh(geo.core, new THREE.MeshBasicMaterial({ color: d.eye })), this.bodyGroup, 0, 0.67, -0.49);
    core.userData.part = 'body';
    core.userData.noShadow = true;
    this.core = core;

    const antenna = this.add(new THREE.Mesh(geo.antenna, shared.dark), this.bodyGroup, 0.16, 1.18, -0.26);
    antenna.rotation.z = -0.12;
    antenna.userData.part = 'head';
    const antennaTip = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshBasicMaterial({ color: d.eye })), this.bodyGroup, 0.19, 1.35, -0.26);
    antennaTip.userData.noShadow = true;

    this.legs = [];
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.23, 0.34, 0);
      this.bodyGroup.add(hip);
      const leg = new THREE.Mesh(geo.limb, shared.dark);
      leg.position.y = -0.12;
      leg.userData.enemy = this;
      leg.userData.part = 'body';
      hip.add(leg);
      const foot = new THREE.Mesh(geo.foot, armorDark);
      foot.position.set(0, -0.27, 0.07);
      foot.userData.enemy = this;
      foot.userData.part = 'body';
      hip.add(foot);
      this.legs.push(hip);
    }

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.42, -0.36);
    this.bodyGroup.add(tailPivot);
    const tail = new THREE.Mesh(geo.tail, shared.dark);
    tail.rotation.set(Math.PI / 2, 0, -0.25);
    tail.userData.enemy = this;
    tail.userData.part = 'body';
    tailPivot.add(tail);
    this.tail = tailPivot;

    for (const side of [-1, 1]) {
      const tooth = this.add(new THREE.Mesh(geo.tooth, shared.tooth), this.bodyGroup, side * 0.055, 0.79, 0.75);
      tooth.rotation.x = Math.PI;
      tooth.userData.noShadow = true;
      tooth.userData.part = 'head';
      tooth.userData.head = true;
    }

    // Health bar
    this.barGroup = new THREE.Group();
    this.barGroup.position.set(0, 1.5, 0);
    this.group.add(this.barGroup);
    const back = new THREE.Mesh(geo.barBack, new THREE.MeshBasicMaterial({ color: '#071014', transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide }));
    back.userData.noShadow = true;
    this.barGroup.add(back);
    this.barFill = new THREE.Mesh(geo.barFill, new THREE.MeshBasicMaterial({ color: '#ff6c45', depthWrite: false, side: THREE.DoubleSide }));
    this.barFill.position.set(0.0, 0, 0.002);
    this.barFill.userData.noShadow = true;
    this.barGroup.add(this.barFill);
    this.barGroup.scale.setScalar(0.75 / this.def.scale);

    // Spawn portal
    this.portal = new THREE.Mesh(
      geo.ring,
      new THREE.MeshBasicMaterial({ color: '#ff6f55', transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    this.portal.rotation.x = -Math.PI / 2;
    this.portal.position.y = 0.035;
    this.group.add(this.portal);

    this.bodyGroup.scale.setScalar(0.001);
    this.group.userData.enemy = this;
    this.group.traverse((child) => {
      if (child.isMesh) child.userData.enemy = this;
    });
  }

  setVisibleHealth(visible) {
    this.barGroup.visible = visible && !this.dying;
  }

  damage(amount, headshot, hitPoint) {
    if (this.dying || this.dead) return { killed: false, headshot, damage: 0 };
    const dealt = Math.min(this.hp, amount);
    this.hp -= amount;
    this.hitFlash = 0.12;
    for (const mat of this.flashMats) {
      mat.emissive.set(headshot ? '#ffce7c' : '#c6ecf2');
      mat.emissiveIntensity = headshot ? 1.4 : 0.9;
    }
    if (hitPoint) {
      const local = this.bodyGroup.worldToLocal(hitPoint.clone());
      this.bodyGroup.position.x += local.x * 0.014;
      this.bodyGroup.position.z += local.z * 0.014;
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.startDeath(headshot);
      return { killed: true, headshot, damage: dealt };
    }
    return { killed: false, headshot, damage: dealt };
  }

  startDeath(headshot) {
    if (this.dying) return;
    this.dying = true;
    this.dyingT = 0;
    this.barGroup.visible = false;
    this.deathSpin = (Math.random() - 0.5) * 2.2;
    this.deathHeadshot = headshot;
    this.attackAnim = 0;
  }

  update(dt, playerPos, colliders, camera, enemies) {
    this.group.updateMatrixWorld();
    if (this.dying) {
      this.dyingT += dt;
      this.bodyGroup.rotation.x -= dt * 3.4;
      this.bodyGroup.rotation.z += this.deathSpin * dt;
      this.bodyGroup.position.y = -Math.min(0.6, this.dyingT * 0.8);
      this.group.scale.multiplyScalar(Math.max(0.0001, 1 - dt * 1.25));
      this.portal.material.opacity = Math.max(0, 0.7 - this.dyingT * 3);
      if (this.dyingT > 0.68) {
        this.dead = true;
        this.remove = true;
      }
      return null;
    }

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      if (this.hitFlash <= 0) {
        for (const mat of this.flashMats) {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 1;
        }
      }
    }

    if (this.spawnT < 1) {
      this.spawnT = Math.min(1, this.spawnT + dt / this.spawnDuration);
      const overshoot = 1.06;
      const t = this.spawnT;
      const ease = t < 0.7 ? (t / 0.7) * overshoot : overshoot - ((t - 0.7) / 0.3) * (overshoot - 1);
      this.bodyGroup.scale.setScalar(Math.max(0.001, ease));
      this.portal.scale.setScalar(1 + (1 - t) * 0.8);
      this.portal.material.opacity = 0.7 * (1 - t * 0.75);
      return null;
    }
    this.bodyGroup.scale.setScalar(1);
    this.portal.visible = false;

    const toPlayer = new THREE.Vector3(playerPos.x - this.group.position.x, 0, playerPos.z - this.group.position.z);
    const dist = toPlayer.length();
    const stopDist = 0.9 + this.radius * 0.8;
    const desired = dist > 0.001 ? toPlayer.normalize() : new THREE.Vector3(0, 0, 1);

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt * 4.4);

    let move = new THREE.Vector3();
    if (dist > stopDist) {
      move.copy(desired);
      const steer = new THREE.Vector3();
      for (const c of colliders) {
        const probe = this.group.position.clone().addScaledVector(desired, this.radius + 1.05);
        if (probe.x > c.minX && probe.x < c.maxX && probe.z > c.minZ && probe.z < c.maxZ) {
          const cx = (c.minX + c.maxX) * 0.5;
          const cz = (c.minZ + c.maxZ) * 0.5;
          const away = new THREE.Vector3(this.group.position.x - cx, 0, this.group.position.z - cz);
          if (away.lengthSq() < 0.001) away.set(desired.z, 0, -desired.x);
          away.normalize();
          const tangent = new THREE.Vector3(-desired.z, 0, desired.x);
          if (tangent.dot(away) < 0) tangent.negate();
          steer.addScaledVector(tangent, 1.1).addScaledVector(away, 0.6);
        }
      }
      if (steer.lengthSq() > 0) {
        move.add(steer).normalize();
      }
      // Stay away from other enemies
      for (const other of enemies) {
        if (other === this || other.dying || other.dead) continue;
        const dx = this.group.position.x - other.group.position.x;
        const dz = this.group.position.z - other.group.position.z;
        const min = this.radius + other.radius + 0.1;
        const d2 = dx * dx + dz * dz;
        if (d2 > 0.001 && d2 < min * min) {
          move.x += (dx / Math.sqrt(d2)) * 0.4;
          move.z += (dz / Math.sqrt(d2)) * 0.4;
        }
      }
      move.normalize();
      const step = this.speed * dt;
      const next = this.group.position.clone().addScaledVector(move, step);
      resolveCollisions(next, this.radius, colliders);
      const moved = next.distanceTo(this.group.position);
      if (moved < step * 0.18) {
        this.stuckT += dt;
        if (this.stuckT > 0.5) {
          this.stuckDir.set(-desired.z, 0, desired.x).multiplyScalar(Math.random() > 0.5 ? 1 : -1);
          this.stuckT = 0;
        }
      } else {
        this.stuckT = Math.max(0, this.stuckT - dt * 0.5);
      }
      this.group.position.copy(next);
      this.group.position.x += this.stuckDir.x * this.stuckT * dt * 1.5;
      this.group.position.z += this.stuckDir.z * this.stuckT * dt * 1.5;
    }

    // Face player / move direction
    if (this.attackAnim > 0.6) {
      this.group.rotation.y = Math.atan2(desired.x, desired.z);
    } else {
      const targetRot = Math.atan2(desired.x, desired.z);
      let diff = targetRot - this.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.group.rotation.y += diff * Math.min(1, dt * 7);
    }

    this.walkPhase += dt * (7 + this.speed * 1.5);
    const walk = dist > stopDist ? 1 : 0;
    this.bodyGroup.position.y = Math.abs(Math.sin(this.walkPhase)) * 0.035 * walk;
    this.bodyGroup.rotation.z = Math.sin(this.walkPhase) * 0.035 * walk;
    this.legs[0].rotation.x = Math.sin(this.walkPhase) * 0.55 * walk;
    this.legs[1].rotation.x = -Math.sin(this.walkPhase) * 0.55 * walk;
    this.tail.rotation.y = Math.sin(this.walkPhase * 0.6) * 0.32;
    this.core.rotation.y += dt * 2.4;
    this.core.rotation.x += dt * 1.1;
    const coreScale = 1 + Math.sin(this.walkPhase * 2.4) * 0.15;
    this.core.scale.setScalar(coreScale);

    let event = null;
    if (dist <= stopDist + 0.15 && this.attackCooldown <= 0 && this.spawnT >= 1) {
      this.attackCooldown = 1.15 + Math.random() * 0.25;
      this.attackAnim = 1;
      event = { type: 'attack', damage: this.damage, enemy: this };
      this.bodyGroup.position.z = 0.08;
    } else if (this.attackAnim <= 0) {
      this.bodyGroup.position.z = 0;
    }

    // Health bar billboard and width
    this.barGroup.quaternion.copy(camera.quaternion);
    const pct = Math.max(0, this.hp / this.maxHp);
    this.barFill.scale.x = Math.max(0.0001, pct);
    this.barFill.position.x = -(1 - pct) * 0.5;
    this.barFill.material.color.set(pct > 0.52 ? '#ff8e50' : pct > 0.25 ? '#ffb343' : '#ff424c');
    this.barGroup.position.y = 1.5 + Math.sin(this.walkPhase * 0.5) * 0.012;

    return event;
  }

  getAimPoint() {
    return new THREE.Vector3(this.group.position.x, 0.94 * this.def.scale + this.bodyGroup.position.y, this.group.position.z);
  }

  getHeadPoint() {
    return new THREE.Vector3(this.group.position.x, 0.93 * this.def.scale + this.bodyGroup.position.y, this.group.position.z);
  }

  dispose() {
    this.scene.remove(this.group);
    for (const mat of this.flashMats) mat.dispose();
    this.group.traverse((child) => {
      if (child.isMesh && child.material && child.material.dispose && !child.material.__shared && !this.flashMats.includes(child.material)) {
        child.material.dispose();
      }
    });
  }
}

function resolveCollisions(pos, radius, colliders) {
  for (const c of colliders) {
    if (pos.x + radius > c.minX && pos.x - radius < c.maxX && pos.z + radius > c.minZ && pos.z - radius < c.maxZ) {
      const overlapLeft = pos.x + radius - c.minX;
      const overlapRight = c.maxX - (pos.x - radius);
      const overlapFront = pos.z + radius - c.minZ;
      const overlapBack = c.maxZ - (pos.z - radius);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack);
      if (minOverlap === overlapLeft) pos.x = c.minX - radius;
      else if (minOverlap === overlapRight) pos.x = c.maxX + radius;
      else if (minOverlap === overlapFront) pos.z = c.minZ - radius;
      else pos.z = c.maxZ + radius;
    }
  }
  pos.x = THREE.MathUtils.clamp(pos.x, -24.4, 24.4);
  pos.z = THREE.MathUtils.clamp(pos.z, -24.4, 24.4);
}

export class EnemyManager {
  constructor(scene, world, audio) {
    this.scene = scene;
    this.world = world;
    this.audio = audio;
    this.enemies = [];
    this.hitMeshes = [];
    this.callbacks = {};
    this.portalLights = [];
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  chooseType(wave, index) {
    if (wave <= 1) return index === 0 ? 'grunt' : index % 5 === 4 ? 'scout' : 'grunt';
    if (wave === 2) return index % 4 === 3 ? 'scout' : 'grunt';
    if (wave >= 3) {
      if (index % 7 === 6) return 'brute';
      if (index % 3 === 2) return 'scout';
      return 'grunt';
    }
    return 'grunt';
  }

  spawn(type, position) {
    const enemy = new Enemy(type, position, this.wave, this.scene);
    this.enemies.push(enemy);
    this.refreshHitMeshes();
    return enemy;
  }

  refreshHitMeshes() {
    this.hitMeshes = [];
    for (const enemy of this.enemies) {
      if (enemy.dying || enemy.dead) continue;
      enemy.group.traverse((child) => {
        if (child.isMesh && child !== enemy.portal && child !== enemy.barFill && child !== enemy.barGroup) {
          let parent = child.parent;
          let inBar = false;
          while (parent) {
            if (parent === enemy.barGroup) inBar = true;
            parent = parent.parent;
          }
          if (!inBar) this.hitMeshes.push(child);
        }
      });
    }
  }

  raycast(raycaster) {
    const hits = raycaster.intersectObjects(this.hitMeshes, false);
    for (const hit of hits) {
      const enemy = hit.object.userData.enemy;
      if (enemy && !enemy.dying) {
        return { enemy, hit };
      }
    }
    return null;
  }

  damage(enemy, amount, headshot, hitPoint) {
    const result = enemy.damage(amount, headshot, hitPoint);
    if (result.killed) {
      this.callbacks.onKill?.(enemy, result);
      this.refreshHitMeshes();
    }
    return result;
  }

  update(dt, playerPos, camera) {
    const events = [];
    for (const enemy of this.enemies) {
      const event = enemy.update(dt, playerPos, this.world.colliders, camera, this.enemies);
      if (event) events.push(event);
      if (enemy.remove) enemy.setVisibleHealth(false);
    }
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      if (this.enemies[i].remove) {
        this.enemies[i].dispose();
        this.enemies.splice(i, 1);
      }
    }
    if (this.enemies.some((e) => e.dying)) this.refreshHitMeshes();
    return events;
  }

  get alive() {
    return this.enemies.filter((e) => !e.dead && !e.dying);
  }

  clear() {
    for (const enemy of this.enemies) enemy.dispose();
    this.enemies = [];
    this.hitMeshes = [];
  }
}
