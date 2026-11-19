// ============ WORLD: NEON HARBOR ============
import * as THREE from 'three';
import {
  asphaltTexture, concreteTexture, metalPanelTexture, containerTexture, crateTexture,
  hazardTexture, neonTexture, graffitiTexture, warningTexture, makeTextSprite,
  makeAABB, rayAABB, seeded, clamp
} from './util.js';
import { CONTROL_POINTS } from './config.js';

const TEAM_COLORS = { blue: 0x5ce8d4, red: 0xff5f52, neutral: 0xd8e8e6 };

export class World {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.colliders = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.captureVisuals = {};
    this.materials = {};
    this.time = 0;
    this.dust = null;
    this.lights = [];
    this.build();
  }

  build() {
    this.buildMaterials();
    this.buildSky();
    this.buildLights();
    this.buildGround();
    this.buildPerimeter();
    this.buildWarehouse(-1);
    this.buildWarehouse(1);
    this.buildCenter();
    this.buildContainers();
    this.buildCatwalk();
    this.buildDetails();
    this.buildCapturePoints();
    this.buildSkyline();
    this.buildDust();
  }

  buildMaterials() {
    const std = (opts) => new THREE.MeshStandardMaterial(opts);
    this.materials.concrete = std({ map: concreteTexture(), color: 0x8b9292, roughness: 0.92, metalness: 0.04 });
    this.materials.concreteDark = std({ map: concreteTexture(), color: 0x555e60, roughness: 0.95, metalness: 0.03 });
    this.materials.asphalt = std({ map: asphaltTexture(), color: 0x7d8688, roughness: 0.88, metalness: 0.12 });
    this.materials.metal = std({ map: metalPanelTexture(), color: 0x7e8a8e, roughness: 0.55, metalness: 0.55 });
    this.materials.metalDark = std({ map: metalPanelTexture(), color: 0x3b4448, roughness: 0.5, metalness: 0.65 });
    this.materials.rust = std({ map: metalPanelTexture(), color: 0x8a5840, roughness: 0.8, metalness: 0.4 });
    this.materials.crate = std({ map: crateTexture(), color: 0x9b8a6c, roughness: 0.9, metalness: 0.02 });
    this.materials.hazard = std({ map: hazardTexture(), roughness: 0.7, metalness: 0.2 });
    this.materials.dark = std({ color: 0x0c1114, roughness: 0.8, metalness: 0.3 });
    this.materials.rubber = std({ color: 0x111416, roughness: 1 });
    this.materials.glass = new THREE.MeshStandardMaterial({ color: 0x5f9ba0, roughness: 0.12, metalness: 0.8, transparent: true, opacity: 0.5 });
    this.materials.neonCyan = new THREE.MeshBasicMaterial({ color: 0x5ce8d4 });
    this.materials.neonAmber = new THREE.MeshBasicMaterial({ color: 0xffb454 });
    this.materials.neonPink = new THREE.MeshBasicMaterial({ color: 0xff4d8d });
    this.materials.rail = std({ color: 0x9aa6a5, roughness: 0.4, metalness: 0.8 });
    this.containerMats = {
      rust: std({ map: containerTexture('rust'), roughness: 0.72, metalness: 0.35 }),
      teal: std({ map: containerTexture('teal'), roughness: 0.7, metalness: 0.35 }),
      blue: std({ map: containerTexture('blue'), roughness: 0.7, metalness: 0.4 }),
      yellow: std({ map: containerTexture('yellow'), roughness: 0.75, metalness: 0.3 }),
      grey: std({ map: containerTexture('grey'), roughness: 0.7, metalness: 0.45 })
    };
  }

  // ---------- helpers ----------
  addBox(w, h, d, x, y, z, mat, opts = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (opts.rotY) m.rotation.y = opts.rotY;
    m.castShadow = opts.shadow !== false;
    m.receiveShadow = true;
    this.group.add(m);
    if (opts.collide !== false) {
      const swap = opts.rotY && Math.abs(Math.round(Math.sin(opts.rotY))) === 1;
      this.colliders.push(makeAABB(x, y, z, swap ? d : w, h, swap ? w : d, opts.tag || 'solid'));
    }
    return m;
  }

  addDecal(w, h, x, y, z, rotY, texture, opacity = 1) {
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    this.group.add(m);
    return m;
  }

  addTrim(w, h, d, x, y, z, mat = this.materials.metalDark, rotY = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    m.castShadow = false; m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  // ---------- sky ----------
  buildSky() {
    const geo = new THREE.SphereGeometry(260, 32, 24);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(0x050d18) },
        mid: { value: new THREE.Color(0x14323d) },
        horizon: { value: new THREE.Color(0xc06a48) },
        sunDir: { value: new THREE.Vector3(0.62, 0.12, -0.78).normalize() },
        sunColor: { value: new THREE.Color(0xffb26b) }
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vDir; uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunColor;
        void main(){
          float h = clamp(vDir.y*1.35+0.06, 0.0, 1.0);
          vec3 col = mix(horizon, mid, smoothstep(0.0,0.34,h));
          col = mix(col, top, smoothstep(0.25,0.9,h));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          col += sunColor * pow(s, 90.0) * 1.4;
          col += sunColor * pow(s, 8.0) * 0.22;
          float band = sin(vDir.y*140.0)*0.5+0.5;
          col += vec3(0.02,0.03,0.035)*band*0.15;
          gl_FragColor = vec4(col,1.0);
        }`
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.frustumCulled = false;
    this.scene.add(sky);
    this.sky = sky;
    this.scene.fog = new THREE.FogExp2(0x18292e, 0.0085);
  }

  buildLights() {
    const hemi = new THREE.HemisphereLight(0x86b7c4, 0x2a1b13, 0.7);
    this.scene.add(hemi);
    const amb = new THREE.AmbientLight(0x30414a, 0.5);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xffb47a, 2.3);
    sun.position.set(48, 62, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -62;
    sun.shadow.camera.right = 62;
    sun.shadow.camera.top = 62;
    sun.shadow.camera.bottom = -62;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 180;
    sun.shadow.bias = -0.0007;
    sun.shadow.normalBias = 0.03;
    this.scene.add(sun);
    this.scene.add(sun.target);
    this.sun = sun;

    const fill = new THREE.DirectionalLight(0x2e6b86, 0.5);
    fill.position.set(-40, 30, -40);
    this.scene.add(fill);

    const p1 = new THREE.PointLight(0x3ef0da, 26, 34, 2);
    p1.position.set(-41, 8, 6); this.scene.add(p1); this.lights.push(p1);
    const p2 = new THREE.PointLight(0xff5c8a, 20, 30, 2);
    p2.position.set(41, 7, -16); this.scene.add(p2); this.lights.push(p2);
    const p3 = new THREE.PointLight(0xffb454, 18, 26, 2);
    p3.position.set(0, 7, -2); this.scene.add(p3); this.lights.push(p3);
    const p4 = new THREE.PointLight(0x4a86ff, 16, 26, 2);
    p4.position.set(-4, 6, 32); this.scene.add(p4); this.lights.push(p4);
  }

  buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), this.materials.asphalt);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // painted lane strips
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xc9b45a, transparent: true, opacity: 0.35 });
    for (let i = 0; i < 16; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 2.8), stripeMat);
      s.rotation.x = -Math.PI / 2;
      s.position.set(0, 0.015, -42 + i * 5.2);
      this.group.add(s);
    }
    const zoneMat = new THREE.MeshBasicMaterial({ color: 0x9fb8b5, transparent: true, opacity: 0.14 });
    for (const [x, z, r] of [[0, 0, 22], [0, 0, 13], [-30, 10, 9], [30, 10, 9]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.16, r, 64), zoneMat);
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.02, z);
      this.group.add(ring);
    }
    // spawn pads
    for (const side of ['blue', 'red']) {
      const col = side === 'blue' ? 0x5ce8d4 : 0xff5f52;
      const padMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18 });
      const pad = new THREE.Mesh(new THREE.CircleGeometry(7, 48), padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(0, 0.018, side === 'blue' ? 40 : -40);
      this.group.add(pad);
      const ring = new THREE.Mesh(new THREE.RingGeometry(6.6, 7, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.025, side === 'blue' ? 40 : -40);
      this.group.add(ring);
    }
  }

  buildPerimeter() {
    const wallH = 6.4, t = 0.9;
    const auto = 0;
    // four walls
    this.addBox(100, wallH, t, 0, wallH / 2, -46.5, this.materials.concreteDark, { tag: 'wall' });
    this.addBox(100, wallH, t, 0, wallH / 2, 46.5, this.materials.concreteDark, { tag: 'wall' });
    this.addBox(t, wallH, 94, -46.5, wallH / 2, 0, this.materials.concreteDark, { tag: 'wall' });
    this.addBox(t, wallH, 94, 46.5, wallH / 2, 0, this.materials.concreteDark, { tag: 'wall' });

    // pillars
    for (let i = -3; i <= 3; i++) {
      for (const z of [-46.2, 46.2]) {
        this.addTrim(1.7, 6.8, 1.5, i * 13, 3.4, z, this.materials.concrete, 0);
      }
      for (const x of [-46.2, 46.2]) {
        this.addTrim(1.5, 6.8, 1.7, x, 3.4, i * 13, this.materials.concrete, 0);
      }
    }
    // top trim
    this.addTrim(100, 0.3, 1.2, 0, 6.55, -46.5, this.materials.metalDark);
    this.addTrim(100, 0.3, 1.2, 0, 6.55, 46.5, this.materials.metalDark);
    this.addTrim(1.2, 0.3, 94, -46.5, 6.55, 0, this.materials.metalDark);
    this.addTrim(1.2, 0.3, 94, 46.5, 6.55, 0, this.materials.metalDark);

    // neon signage
    this.addDecal(17, 4.2, -45.9, 4.2, 4, Math.PI / 2, neonTexture('NEON HARBOR', '#5ce8d4'));
    this.addDecal(15, 3.8, -6, 4.2, -45.9, 0, neonTexture('BLACKSITE', '#ff4d8d'));
    this.addDecal(13, 3.2, 11, 4.1, -45.9, 0, neonTexture('SECTOR 09', '#ffb454'));
    this.addDecal(14, 3.5, 45.9, 4.4, -7, -Math.PI / 2, neonTexture('SENTINEL', '#8fb4ff'));
    this.addDecal(12, 3, 12, 4.1, 45.9, Math.PI, neonTexture('NO EXIT', '#ff5f52'));

    // warning banners
    for (let i = 0; i < 4; i++) {
      this.addDecal(4, 1, -30 + i * 20, 1.2, 45.9, Math.PI, warningTexture(), 0.5);
    }
  }

  buildWarehouse(side) {
    // side = -1 west (A), +1 east (C)
    const cx = 29 * side;
    const cz = 4;
    const w = 18, d = 20, h = 7.2;
    const mat = this.materials.concreteDark;
    const xOuter = cx + 9 * side;
    const xInner = cx - 9 * side;

    // outer wall
    this.addBox(0.6, h, d, xOuter, h / 2, cz, mat, { tag: 'wall' });
    // side walls with door gap on north
    const doorZ = -2;
    const segFront = doorZ - (-6);
    this.addBox(w, h, 0.6, cx, h / 2, cz - 10, mat, { tag: 'wall' }); // north
    this.addBox(w, h, 0.6, cx, h / 2, cz + 10, mat, { tag: 'wall' }); // south
    // inner wall with large garage opening (z 0..8)
    const opening = 8;
    const leftLen = (d - opening) / 2;
    this.addBox(0.6, h, leftLen, xInner, h / 2, cz - 10 + leftLen / 2, mat, { tag: 'wall' });
    this.addBox(0.6, h, leftLen, xInner, h / 2, cz + 10 - leftLen / 2, mat, { tag: 'wall' });
    this.addBox(0.6, 1.6, opening, xInner, h - 0.8, cz, mat, { tag: 'wall' });
    // header beam above opening
    this.addTrim(1.1, 0.7, opening + 1, xInner, h - 1.55, cz, this.materials.metalDark);

    // roof
    this.addBox(w + 1.2, 0.4, d + 1.2, cx, h + 0.2, cz, this.materials.metalDark, { tag: 'roof' });
    // roof rails
    for (const [x, z, rw, rd] of [[cx, cz - 10.1, w + 1, 0.12], [cx, cz + 10.1, w + 1, 0.12], [cx - 9.1 * side, cz, 0.12, d + 1], [cx + 9.1 * side, cz, 0.12, d + 1]]) {
      this.addTrim(rw, 0.9, rd, x, h + 0.85, z, this.materials.rail);
    }
    // exterior roof access stairs on the outer side
    this.addStairs(xOuter - 4.6 * side, cz + 10.5, 'z', 2.4, 24, h + 0.4, 0.34, side === -1 ? 0 : Math.PI, 'roof');

    // roof vents
    for (let i = 0; i < 3; i++) {
      this.addBox(2.2, 1.1, 2.2, cx - 3 + i * 3, h + 0.9, cz - 4, this.materials.metal, { collide: false });
    }
    this.addBox(1.1, 1.4, 1.1, cx + 4, h + 1.9, cz + 5, this.materials.rust, { collide: false });

    // interior mezzanine along outer wall
    const mz = cx + 6.4 * side;
    this.addBox(4.2, 0.3, 12, mz, 3.5, cz - 2, this.materials.metal, { tag: 'mezz' });
    this.addTrim(0.1, 1, 12, mz - 2.1 * side, 4.1, cz - 2, this.materials.rail);
    // mezzanine supports
    for (const z of [cz - 7, cz + 3]) this.addTrim(0.3, 3.5, 0.3, mz, 1.75, z, this.materials.metalDark);
    // ladder-ish stairs to mezzanine
    this.addStairs(xInner + 1.2 * side, cz - 4, 'z', 1.4, 10, 3.5, 0.36, side === -1 ? Math.PI : 0, 'mezz');

    // interior crates
    this.addCrate(cx - 4 * side, 1.0, cz - 5.5, 2.0);
    this.addCrate(cx - 3 * side, 0.5, cz + 6.2, 1.0);
    this.addCrate(cx + 1.5 * side, 1.6, cz + 6.2, 1.6);
    // cover barrier near entrance
    this.addBarrier(xInner - 0.8 * side, cz + 6.5, 90);
    this.addBarrier(xInner - 0.8 * side, cz - 6.5, 90);

    // neon strip inside
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 13), this.materials.neonCyan);
    strip.position.set(mz - 2.2 * side, 3.3, cz - 2);
    this.group.add(strip);
    const strip2 = strip.clone(); strip2.material = this.materials.neonAmber;
    strip2.position.set(cx, 6.8, cz + 9.85);
    this.group.add(strip2);

    // warehouse sign on roof
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), new THREE.MeshBasicMaterial({
      map: neonTexture(side === -1 ? 'DOCK A' : 'DOCK C', side === -1 ? '#ffb454' : '#5ce8d4'),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    }));
    sign.position.set(cx, h + 2.2, cz + 10.35);
    this.group.add(sign);

    // graffiti inside
    this.addDecal(6, 3, xOuter + 0.4 * side, 2.2, cz + 3, side === -1 ? Math.PI / 2 : -Math.PI / 2, graffitiTexture(), 0.7);
  }

  buildCenter() {
    // central drop pod / holographic beacon
    const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.9, 0.35, 20), this.materials.metalDark);
    beaconBase.position.set(0, 0.18, -2);
    beaconBase.receiveShadow = true;
    this.group.add(beaconBase);

    const beamMat = new THREE.MeshBasicMaterial({ color: 0x5ce8d4, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 7, 16, 1, true), beamMat);
    beam.position.set(0, 3.8, -2);
    this.group.add(beam);
    this.beaconBeam = beam;

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x5ce8d4, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 6, 48), ringMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.6, -2);
    this.group.add(ring);
    this.beaconRing = ring;

    // cover ring around center
    const barriers = [
      [-8, 2, 0], [8, 2, 0], [-6, -11, 20], [6, -11, -20],
      [-11, -3, 90], [11, -3, 90], [0, 9, 0]
    ];
    for (const [x, z, r] of barriers) this.addBarrier(x, z, r);

    // central cargo truck
    this.buildTruck(4.5, 13, Math.PI / 2);
    this.buildTruck(-15, -1.5, -Math.PI / 2);

    // low platform near B with ramp
    this.addBox(6, 0.5, 4.5, -3, 0.25, -15, this.materials.concrete, { tag: 'platform' });
    this.addStairs(-3, -12.4, 'z', 3, 5, 0.5, 0.45, 0, 'step');

    // planters / pipes
    this.buildPipe(-21, 19, 0);
    this.buildPipe(22, 17, 90);
  }

  buildTruck(x, z, rotY) {
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = rotY;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.4, 2.4), this.materials.rust);
    cab.position.set(0, 1.35, 3.4); cab.castShadow = true; cab.receiveShadow = true; g.add(cab);
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 0.1), this.materials.glass);
    win.position.set(0, 1.9, 4.62); g.add(win);
    const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.55, 2.7, 6.2), this.containerMats.grey);
    trailer.position.set(0, 1.55, -0.4); trailer.castShadow = true; trailer.receiveShadow = true; g.add(trailer);
    for (const [wx, wz] of [[-1.2, 3.2], [1.2, 3.2], [-1.2, -2.2], [1.2, -2.2]]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 14), this.materials.rubber);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(wx, 0.5, wz); g.add(wheel);
    }
    this.group.add(g);
    const swap = Math.abs(Math.round(Math.sin(rotY))) === 1;
    this.colliders.push(makeAABB(x, 1.3, z, swap ? 7.4 : 2.7, 2.8, swap ? 2.7 : 7.4, 'vehicle'));
  }

  buildPipe(x, z, rot) {
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = rot;
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.6, 16), this.materials.rust);
      p.rotation.z = Math.PI / 2; p.position.set(-0.7 + i * 0.7, 0.65 + (i === 1 ? 1.15 : 0), 0);
      p.castShadow = true; p.receiveShadow = true; g.add(p);
    }
    this.group.add(g);
    this.colliders.push(makeAABB(x, 0.9, z, Math.abs(Math.cos(rot)) > 0.5 ? 2.6 : 2.2, 1.8, Math.abs(Math.cos(rot)) > 0.5 ? 2.2 : 2.6, 'pipe'));
  }

  buildContainers() {
    const list = [
      [-13.5, 23, 0, 'teal', 2], [13.5, 23, 0, 'blue', 1], [-13.5, 15.5, 0, 'rust', 1],
      [13.5, 15.5, 0, 'yellow', 2], [-20.5, -14, 0, 'blue', 1], [20.5, -14, 0, 'rust', 2],
      [-7, -18, 90, 'grey', 1], [7, -18, 90, 'teal', 1], [0, 22.5, 90, 'yellow', 1],
      [-38, 28, 0, 'rust', 1], [38, 28, 90, 'blue', 1], [-38, -30, 90, 'grey', 1], [38, -29, 0, 'teal', 1],
      [-24, -37, 0, 'yellow', 2], [24, -37, 90, 'grey', 1]
    ];
    for (const [x, z, r, color, levels] of list) this.addContainer(x, z, r, color, levels);

    // crate staircases to climb containers
    this.addCrate(-17.6, 0.45, 23, 0.9);
    this.addCrate(-16.4, 1.35, 23, 0.9);
    this.addCrate(-16.4, 0.45, 21.9, 0.9);
    this.addCrate(17.7, 0.45, 23, 0.9);
    this.addCrate(16.5, 1.35, 23, 0.9);
    this.addCrate(16.5, 0.45, 21.9, 0.9);
    this.addCrate(24.2, 0.45, -14, 0.9);
    this.addCrate(23, 1.35, -14, 0.9);
  }

  addContainer(x, z, rotY, color, levels = 1) {
    const h = 2.6 * levels;
    const swap = Math.abs(Math.round(Math.sin(rotY))) === 1;
    const w = swap ? 2.44 : 6.06;
    const d = swap ? 6.06 : 2.44;
    const m = new THREE.Mesh(new THREE.BoxGeometry(6.06, h, 2.44), this.containerMats[color] || this.containerMats.rust);
    m.position.set(x, h / 2, z);
    m.rotation.y = rotY;
    m.castShadow = true; m.receiveShadow = true;
    this.group.add(m);
    // corner castings
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), this.materials.metalDark);
      c.position.set(x + Math.cos(rotY) * sx * 2.9 - Math.sin(rotY) * sz * 1.1, h - 0.12, z + Math.sin(rotY) * sx * 2.9 + Math.cos(rotY) * sz * 1.1);
      this.group.add(c);
    }
    // door lines on ends
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.04, h - 0.4), this.materials.metalDark);
    door.position.set(x + Math.cos(rotY) * 3.03, h / 2, z + Math.sin(rotY) * 3.03);
    door.rotation.y = rotY + Math.PI / 2;
    this.group.add(door);
    this.colliders.push(makeAABB(x, h / 2, z, w, h, d, 'container'));
  }

  addCrate(x, y, z, size) {
    const m = this.addBox(size, size, size, x, y, z, this.materials.crate, { tag: 'crate' });
    return m;
  }

  addBarrier(x, z, rotY) {
    const swap = Math.abs(Math.round(Math.sin(rotY * Math.PI / 180))) === 1;
    this.addBox(3.4, 1.25, 0.5, x, 0.63, z, this.materials.concrete, { rotY: rotY * Math.PI / 180, tag: 'barrier' });
    this.addTrim(3.5, 0.1, 0.56, x, 1.28, z, this.materials.hazard, rotY * Math.PI / 180);
  }

  addStairs(x, z, axis, width, steps, totalHeight, stepDepth, rotY = 0, tag = 'stairs') {
    // stairs ascend along -z when rotY=0, toward +z when rotY=PI
    const stepH = totalHeight / steps;
    const dir = Math.abs(rotY) > 1 ? 1 : -1;
    for (let i = 0; i < steps; i++) {
      const h = stepH * (i + 1);
      const zz = z + dir * stepDepth * i;
      const xx = x;
      this.addBox(width, h, stepDepth, xx, h / 2, zz, i % 3 === 0 ? this.materials.metal : this.materials.metalDark, { tag: 'step', shadow: i === steps - 1 });
    }
    // side rails
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, steps * stepDepth + 0.4), this.materials.rail);
      rail.position.set(x + s * width / 2, totalHeight + 0.55, z + dir * (steps * stepDepth - stepDepth) / 2);
      rail.rotation.x = Math.atan2(totalHeight, steps * stepDepth) * (dir > 0 ? -1 : 1);
      this.group.add(rail);
    }
  }

  buildCatwalk() {
    const y = 3.5, z = -25.5, len = 66, w = 3.6;
    this.addBox(len, 0.35, w, 0, y, z, this.materials.metal, { tag: 'catwalk' });
    // underside supports
    for (let x = -30; x <= 30; x += 10) {
      this.addTrim(0.35, y, 0.35, x, y / 2, z - 1.4, this.materials.metalDark);
      this.addTrim(0.35, y, 0.35, x, y / 2, z + 1.4, this.materials.metalDark);
    }
    // railings (two sides), leave gaps at stairs x=±29
    for (const side of [-1, 1]) {
      for (const [x0, x1] of [[-33, -31], [-29, 29], [31, 33]]) {
        if (x1 <= x0) continue;
        const cx = (x0 + x1) / 2, l = x1 - x0;
        this.addTrim(l, 0.08, 0.08, cx, y + 1.15, z + side * (w / 2), this.materials.rail);
        this.addTrim(l, 0.08, 0.08, cx, y + 0.55, z + side * (w / 2), this.materials.rail);
        const posts = Math.max(2, Math.round(l / 3));
        for (let i = 0; i <= posts; i++) {
          this.addTrim(0.07, 1.2, 0.07, x0 + (l * i) / posts, y + 0.6, z + side * (w / 2), this.materials.rail);
        }
      }
    }
    // neon strips on catwalk edge
    for (const side of [-1, 1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.05), side === -1 ? this.materials.neonAmber : this.materials.neonCyan);
      strip.position.set(0, y - 0.18, z + side * (w / 2));
      this.group.add(strip);
    }
    // stairs down at both ends toward center
    this.addStairs(-31, z + 2.2, 'z', 2.6, 13, y, 0.55, 0, 'stairs');
    this.addStairs(31, z + 2.2, 'z', 2.6, 13, y, 0.55, 0, 'stairs');
    // platform at both ends
    this.addBox(5, 0.35, 5, -31, y, z, this.materials.metal, { tag: 'catwalk' });
    this.addBox(5, 0.35, 5, 31, y, z, this.materials.metal, { tag: 'catwalk' });

    // hanging lights under catwalk
    for (let x = -24; x <= 24; x += 12) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.3), this.materials.neonAmber);
      lamp.position.set(x, y - 0.6, z);
      this.group.add(lamp);
    }
  }

  buildDetails() {
    // crane at NE
    this.buildCrane(37, -36);
    // floodlight poles
    for (const [x, z] of [[-42, 38], [42, 38], [-42, -38], [42, -38], [-5, 0]]) {
      this.buildLightPole(x, z);
    }
    // guard shack south-west
    this.addBox(5, 3.2, 4.4, -37, 1.6, 37, this.materials.metalDark, { tag: 'shack' });
    this.addBox(5.6, 0.3, 5, -37, 3.35, 37, this.materials.metal, { tag: 'roof' });
    this.addBox(2.6, 1.1, 0.05, -37, 1.9, 34.78, this.materials.glass, { collide: false });
    this.addDecal(4, 1.4, -37, 3.9, 34.7, 0, neonTexture('GATE 3', '#ffb454'), 1);
    // jersey barriers along lanes
    for (const [x, z, r] of [[-33, 20, 90], [-33, -6, 90], [33, 20, 90], [33, -6, 90], [0, 32, 0], [0, 30, 0]]) {
      this.addBarrier(x, z, r);
    }
    // north lane cover
    for (const [x, z] of [[-6, -32], [6, -32], [-18, -30], [18, -30]]) this.addBarrier(x, z, 0);
    // south approach
    for (const [x, z] of [[-17, 29], [17, 29], [0, 27]]) this.addBarrier(x, z, 0);
    // scattered crates
    for (const [x, z, s] of [[-8, 34, 1.1], [9, 34, 0.9], [-22, 34, 1.3], [23, 34, 1.0], [-28, -35, 1.0], [28, -35, 1.2]]) {
      this.addCrate(x, s / 2, z, s);
    }
    // pipes near walls
    // antenna tower
    const tower = new THREE.Group();
    tower.position.set(-43, 0, -40);
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 14, 5), this.materials.rail);
      leg.position.set(Math.cos(i * 2.1) * 0.8, 7, Math.sin(i * 2.1) * 0.8);
      leg.rotation.z = Math.cos(i * 2.1) * 0.06; leg.rotation.x = -Math.sin(i * 2.1) * 0.06;
      tower.add(leg);
    }
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.materials.neonPink);
    beacon.position.y = 14.2; tower.add(beacon);
    this.group.add(tower);
    this.colliders.push(makeAABB(-43, 7, -40, 2, 14, 2, 'tower'));

    // ambience: crates near spawn
    this.addBox(4, 1, 1, -6, 0.5, 44, this.materials.concrete, { tag: 'cover' });
    this.addBox(4, 1, 1, 6, 0.5, -44, this.materials.concrete, { tag: 'cover' });
  }

  buildCrane(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 5), this.materials.metalDark);
    base.position.y = 0.6; base.castShadow = true; g.add(base);
    const towerH = 20;
    for (const [sx, sz] of [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.32, towerH, 0.32), this.materials.rust);
      leg.position.set(sx, 1.2 + towerH / 2, sz); leg.castShadow = true; g.add(leg);
    }
    for (let i = 0; i < 7; i++) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.1), this.materials.rail);
      brace.position.set(0, 3 + i * 2.6, 0); brace.rotation.z = i % 2 ? 0.5 : -0.5; g.add(brace);
      const brace2 = brace.clone(); brace2.rotation.z = -brace.rotation.z; g.add(brace2);
    }
    const cab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 3), this.materials.metal);
    cab.position.set(0, towerH + 1.4, 0); cab.castShadow = true; g.add(cab);
    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1, 0.1), this.materials.glass);
    cabWin.position.set(0, towerH + 1.6, 1.51); g.add(cabWin);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(24, 0.45, 0.6), this.materials.metal);
    jib.position.set(-7, towerH + 2.4, 0); jib.castShadow = true; g.add(jib);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5, 0.45, 0.7), this.materials.metal);
    counter.position.set(6.5, towerH + 2.4, 0); g.add(counter);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 12, 4), this.materials.rail);
    cable.position.set(-15, towerH - 3.8, 0); g.add(cable);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), this.materials.hazard);
    hook.position.set(-15, towerH - 10, 0); g.add(hook);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), this.materials.neonPink);
    light.position.set(-18.5, towerH + 2.7, 0); g.add(light);
    this.group.add(g);
    this.colliders.push(makeAABB(x, 1.5, z, 5, 3, 5, 'crane'));
  }

  buildLightPole(x, z) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 9, 6), this.materials.rail);
    pole.position.set(x, 4.5, z); pole.castShadow = true; this.group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), this.materials.rail);
    arm.position.set(x, 8.9, z); this.group.add(arm);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.4), this.materials.neonAmber);
    lamp.position.set(x, 8.75, z); this.group.add(lamp);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    cone.position.set(x, 8.1, z); cone.rotation.x = Math.PI;
    this.group.add(cone);
    this.colliders.push(makeAABB(x, 4.5, z, 0.5, 9, 0.5, 'pole'));
  }

  buildCapturePoints() {
    for (const p of CONTROL_POINTS) {
      const g = new THREE.Group();
      g.position.set(p.x, 0, p.z);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8e8e6, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(p.r - 0.25, p.r, 64), ringMat);
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
      const inner = new THREE.Mesh(new THREE.RingGeometry(p.r - 1.1, p.r - 1.0, 64), ringMat);
      inner.rotation.x = -Math.PI / 2; inner.position.y = 0.03; g.add(inner);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xd8e8e6, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(p.r * 0.10, p.r * 0.16, 12, 32, 1, true), beamMat);
      beam.position.y = 6; g.add(beam);
      const label = makeTextSprite(p.id, '#d8e8e6', 2.2);
      label.position.y = 3.3; g.add(label);
      this.group.add(g);
      this.captureVisuals[p.id] = { group: g, ring, inner, beam, label, ringMat, beamMat, ring2: inner.material };
    }
  }

  setCaptureState(id, team, progress = 0) {
    const v = this.captureVisuals[id];
    if (!v) return;
    const col = new THREE.Color(TEAM_COLORS[team] || TEAM_COLORS.neutral);
    v.ringMat.color.copy(col);
    v.beamMat.color.copy(col);
    v.beamMat.opacity = team === 'neutral' ? 0.035 : 0.10 + progress * 0.06;
    v.ringMat.opacity = team === 'neutral' ? 0.4 : 0.75;
    v.label.material.color.copy(col);
  }

  buildSkyline() {
    const rng = seeded;
    const winTex = (() => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 64, 128);
      for (let y = 5; y < 124; y += 7) {
        for (let x = 5; x < 60; x += 7) {
          if (rng() > 0.66) {
            ctx.fillStyle = rng() > 0.5 ? 'rgba(120,210,205,.85)' : 'rgba(255,180,84,.7)';
            ctx.fillRect(x, y, 3, 2);
          }
        }
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    })();
    const bmat = new THREE.MeshStandardMaterial({ color: 0x0a141b, roughness: 0.9, metalness: 0.2, emissive: 0x2a6470, emissiveMap: winTex, emissiveIntensity: 0.55 });
    const bmat2 = new THREE.MeshStandardMaterial({ color: 0x0d1018, roughness: 0.9, emissive: 0xffb454, emissiveMap: winTex, emissiveIntensity: 0.35 });
    for (let i = 0; i < 34; i++) {
      const ang = (i / 34) * Math.PI * 2 + rng() * 0.12;
      const radius = 72 + rng() * 40;
      const x = Math.cos(ang) * radius, z = Math.sin(ang) * radius;
      const h = 14 + rng() * 48;
      const w = 8 + rng() * 11;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), rng() > 0.72 ? bmat2 : bmat);
      b.position.set(x, h / 2 - 2, z);
      b.rotation.y = rng() * Math.PI;
      this.group.add(b);
      // roof beacon
      if (rng() > 0.7) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), this.materials.neonPink);
        dot.position.set(x, h, z);
        this.group.add(dot);
      }
    }
    // distant cranes silhouettes
    for (let i = 0; i < 5; i++) {
      const x = -90 + i * 45, z = -95 - rng() * 25;
      const mast = new THREE.Mesh(new THREE.BoxGeometry(2, 40 + i * 4, 2), this.materials.metalDark);
      mast.position.set(x, 20, z); this.group.add(mast);
      const jib = new THREE.Mesh(new THREE.BoxGeometry(34, 1.2, 1.2), this.materials.metalDark);
      jib.position.set(x - 8, 38 + i * 4, z); this.group.add(jib);
    }
  }

  buildDust() {
    const count = 700;
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 96;
      pos[i * 3 + 1] = Math.random() * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 96;
      speed[i] = 0.15 + Math.random() * 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x9fd8d4, size: 0.055, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    this.dust = { pts, pos, speed, count };
  }

  // ---------- queries ----------
  raycast(origin, dir, maxDist = 200, ignoreTag = null) {
    let best = null, bestT = maxDist;
    for (const c of this.colliders) {
      if (ignoreTag && c.tag === ignoreTag) continue;
      const t = rayAABB(origin, dir, c, bestT);
      if (t !== null && t < bestT && t >= 0) {
        bestT = t; best = c;
      }
    }
    if (!best) return null;
    const point = new THREE.Vector3().copy(dir).multiplyScalar(bestT).add(origin);
    // approximate normal
    const eps = 0.002;
    let normal = new THREE.Vector3();
    const cx = (best.min.x + best.max.x) / 2, cy = (best.min.y + best.max.y) / 2, cz = (best.min.z + best.max.z) / 2;
    const dx = Math.abs(point.x - best.min.x), dx2 = Math.abs(best.max.x - point.x);
    const dy = Math.abs(point.y - best.min.y), dy2 = Math.abs(best.max.y - point.y);
    const dz = Math.abs(point.z - best.min.z), dz2 = Math.abs(best.max.z - point.z);
    const m = Math.min(dx, dx2, dy, dy2, dz, dz2);
    if (m === dx) normal.set(-1, 0, 0); else if (m === dx2) normal.set(1, 0, 0);
    else if (m === dy) normal.set(0, -1, 0); else if (m === dy2) normal.set(0, 1, 0);
    else if (m === dz) normal.set(0, 0, -1); else normal.set(0, 0, 1);
    return { dist: bestT, point, normal, collider: best };
  }

  lineOfSight(a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const dist = dir.length();
    if (dist < 0.01) return true;
    dir.multiplyScalar(1 / dist);
    const hit = this.raycast(a, dir, dist - 0.2);
    return !hit;
  }

  // horizontal ray check for bot avoidance
  blocked(x, z, dirX, dirZ, dist = 2.2) {
    const o = new THREE.Vector3(x, 1.0, z);
    const d = new THREE.Vector3(dirX, 0, dirZ).normalize();
    for (const c of this.colliders) {
      if (c.max.y < 0.4 || c.min.y > 2.2) continue;
      const t = rayAABB(o, d, c, dist);
      if (t !== null && t > 0.1) return true;
    }
    return false;
  }

  update(dt) {
    this.time += dt;
    // dust drift
    const d = this.dust;
    if (d) {
      for (let i = 0; i < d.count; i++) {
        d.pos[i * 3 + 1] += d.speed[i] * dt * 0.35;
        d.pos[i * 3] += Math.sin(this.time * 0.3 + i) * dt * 0.05;
        if (d.pos[i * 3 + 1] > 23) d.pos[i * 3 + 1] = 0;
      }
      d.pts.geometry.attributes.position.needsUpdate = true;
    }
    if (this.beaconRing) {
      this.beaconRing.rotation.z += dt * 0.6;
      this.beaconRing.material.opacity = 0.35 + Math.sin(this.time * 2) * 0.15;
    }
    if (this.beaconBeam) {
      this.beaconBeam.material.opacity = 0.09 + Math.sin(this.time * 1.4) * 0.04;
    }
    // blinking crane light
    for (const l of this.lights) l.intensity *= 0.999;
  }

  setQuality(level) {
    const high = level === 'high';
    const med = level === 'medium';
    this.sun.castShadow = level !== 'low';
    this.sun.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);
    if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
    this.dust.pts.visible = !med && !high ? true : true;
    this.dust.pts.material.opacity = high ? 0.5 : 0.35;
    this.scene.fog.density = high ? 0.0075 : 0.0095;
  }
}
