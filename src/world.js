import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createTextures } from './textures.js';
import { NavGrid } from './nav.js';

function scaleBoxUV(geo, w, h, d, scale = 0.48) {
  const uv = geo.attributes.uv;
  const n = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i));
    const ny = Math.abs(n.getY(i));
    let u;
    let v;
    if (nx > 0.5) { u = d; v = h; }
    else if (ny > 0.5) { u = w; v = d; }
    else { u = w; v = h; }
    uv.setXY(i, uv.getX(i) * u * scale, uv.getY(i) * v * scale);
  }
  uv.needsUpdate = true;
}

function std(opts) { return new THREE.MeshStandardMaterial(opts); }

export class World {
  constructor(scene, renderer, { mobile = false } = {}) {
    this.scene = scene;
    this.renderer = renderer;
    this.mobile = mobile;
    this.colliders = [];
    this.shootables = [];
    this.stations = [];
    this.vents = [];
    this.decor = [];
    this.mobile = mobile;
    this.dark = false;
    this.darkAmount = 0;
    this.spawn = { x: 0, z: 23.4 };
    this.tex = createTextures(renderer);
    this.buildMaterials();
    this.buildSky();
    this.buildLighting();
    this.buildMap();
    this.buildAtmosphere();
    this.buildStations();
    this.optimizeStatic();
    this.nav = new NavGrid(this.colliders, { minX: -28.8, maxX: 28.8, minZ: -28.8, maxZ: 28.8, cell: 1, pad: 0.62 });
    this.shadowSize = mobile ? 1024 : 2048;
  }

  buildMaterials() {
    const t = this.tex;
    this.mat = {
      sand: std({ map: t.sand, color: 0xffffff, roughness: 0.96, metalness: 0 }),
      wall: std({ map: t.wall, bumpMap: t.wallBump, bumpScale: 0.055, roughness: 0.94, metalness: 0 }),
      wallDark: std({ map: t.wall, bumpMap: t.wallBump, bumpScale: 0.05, color: 0x8a714f, roughness: 0.95 }),
      crate: std({ map: t.crate, bumpMap: t.crateBump, bumpScale: 0.035, roughness: 0.82, metalness: 0.04 }),
      crateDark: std({ map: t.crate, bumpMap: t.crateBump, bumpScale: 0.035, color: 0x9b8b70, roughness: 0.88 }),
      metal: std({ map: t.metal, bumpMap: t.metalBump, bumpScale: 0.02, roughness: 0.46, metalness: 0.62 }),
      metalDark: std({ map: t.metal, color: 0x5a5c4f, roughness: 0.6, metalness: 0.55 }),
      tarp: std({ map: t.tarp, roughness: 0.98, metalness: 0, side: THREE.DoubleSide }),
      tarpRed: std({ map: t.tarp, color: 0xb24e3d, roughness: 0.98, side: THREE.DoubleSide }),
      screen: std({ map: t.screen, emissiveMap: t.screen, emissive: 0x64e6c2, emissiveIntensity: 1.25, color: 0x0a1a12, roughness: 0.35 }),
      hazard: std({ map: t.hazard, roughness: 0.75, metalness: 0.2 }),
      concrete: std({ color: 0x9c8c6d, roughness: 0.97 }),
      dark: std({ color: 0x1b1d17, roughness: 0.7, metalness: 0.35 }),
      red: std({ color: 0x8d241c, roughness: 0.55, metalness: 0.35, emissive: 0x390b06, emissiveIntensity: 0.5 }),
      white: std({ color: 0xd8cfb9, roughness: 0.85 }),
      wire: std({ color: 0x181b16, roughness: 0.8 }),
      pipe: std({ color: 0x4f5147, roughness: 0.55, metalness: 0.5 }),
    };
    this.mat.wall.userData = { texScale: 0.42 };
  }

  buildSky() {
    const geo = new THREE.SphereGeometry(150, 24, 14);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x507fa3) },
        mid: { value: new THREE.Color(0xc7b48d) },
        bottom: { value: new THREE.Color(0xe3c9a0) },
        dark: { value: 0 },
        sunDir: { value: new THREE.Vector3(0.5, 0.56, -0.66).normalize() },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; uniform float dark; uniform vec3 sunDir; varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 col = mix(bottom, mid, smoothstep(0.46, 0.58, h));
          col = mix(col, top, smoothstep(0.56, 0.95, h));
          float sun = pow(max(dot(normalize(vDir), sunDir), 0.0), 420.0);
          float glow = pow(max(dot(normalize(vDir), sunDir), 0.0), 7.0);
          col += vec3(1.0, .82, .55) * sun * 2.2 + vec3(1.0, .68, .34) * glow * .17;
          col *= mix(1.0, 0.12, dark);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
    this.scene.fog = new THREE.FogExp2(0xc9ad82, 0.0125);
    this.scene.background = new THREE.Color(0xc9ad82);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const g = glowCanvas.getContext('2d');
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, 'rgba(255,246,218,.95)');
    rg.addColorStop(0.18, 'rgba(255,218,150,.5)');
    rg.addColorStop(1, 'rgba(255,200,110,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
    const sunTex = new THREE.CanvasTexture(glowCanvas);
    sunTex.colorSpace = THREE.SRGBColorSpace;
    const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
    sun.scale.set(32, 32, 1);
    sun.position.set(64, 58, -84);
    this.scene.add(sun);
    this.sunSprite = sun;
  }

  buildLighting() {
    this.hemi = new THREE.HemisphereLight(0xc6dcf2, 0x6f5737, 0.92);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffdfae, 2.6);
    this.sun.position.set(28, 38, 20);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(this.mobile ? 1024 : 2048, this.mobile ? 1024 : 2048);
    this.sun.shadow.camera.left = -42;
    this.sun.shadow.camera.right = 42;
    this.sun.shadow.camera.top = 42;
    this.sun.shadow.camera.bottom = -42;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 110;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.sun.target.position.set(0, 0, 0);

    this.fill = new THREE.DirectionalLight(0x8fa8c2, 0.3);
    this.fill.position.set(-24, 20, -26);
    this.scene.add(this.fill);

    this.lampLights = [];
    const addLamp = (x, y, z, color, intensity, distance) => {
      const light = new THREE.PointLight(color, intensity, distance, 2);
      light.position.set(x, y, z);
      this.scene.add(light);
      this.lampLights.push(light);
      return light;
    };
    this.tunnelLight = addLamp(25.5, 2.65, 0, 0xffb15f, 10, 16);
    this.siteLight = addLamp(21, 4.6, -21, 0xffc27a, 13, 22);
    this.marketLight = addLamp(-22, 3.2, 22, 0xffb877, 7, 14);
    this.emLights = [];
    const addEm = (x, y, z) => {
      const light = new THREE.PointLight(0xff2a1a, 0, 10, 2);
      light.position.set(x, y, z);
      this.scene.add(light);
      this.emLights.push(light);
    };
    addEm(16, 3.4, -20);
    addEm(-18, 3.2, 4);
    addEm(3, 3, 22);
  }

  addBox(w, h, d, x, z, mat, opts = {}) {
    const { y = 0, rotY = 0, collide = true, cast = true, receive = true, shoot = true, playerBlock = true } = opts;
    const geo = new THREE.BoxGeometry(w, h, d);
    scaleBoxUV(geo, w, h, d, 0.48);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    this.scene.add(mesh);
    if (shoot) {
      mesh.userData.world = true;
      this.shootables.push(mesh);
    }
    if (collide && playerBlock) {
      const cw = Math.abs(Math.cos(rotY)) * w + Math.abs(Math.sin(rotY)) * d;
      const cd = Math.abs(Math.sin(rotY)) * w + Math.abs(Math.cos(rotY)) * d;
      this.colliders.push({
        minX: x - cw / 2, maxX: x + cw / 2,
        minZ: z - cd / 2, maxZ: z + cd / 2,
        height: y + h,
      });
    }
    return mesh;
  }

  wall(x1, z1, x2, z2, h, t, mat = this.mat.wall, opts = {}) {
    const w = Math.max(Math.abs(x2 - x1), t);
    const d = Math.max(Math.abs(z2 - z1), t);
    return this.addBox(w, h, d, (x1 + x2) / 2, (z1 + z2) / 2, mat, { y: opts.y ?? 0, collide: opts.collide ?? true, cast: opts.cast ?? true });
  }

  arch(x, z, { axis = 'x', width = 3.6, height = 3.4, t = 0.9, mat = this.mat.wall } = {}) {
    const pw = 0.8;
    if (axis === 'x') {
      this.addBox(pw, height, t, x - width / 2 - pw / 2, z, mat);
      this.addBox(pw, height, t, x + width / 2 + pw / 2, z, mat);
      this.addBox(width + pw * 2, 0.7, t, x, z, mat, { y: height - 0.35, collide: false });
      this.addBox(width + pw * 2, 0.25, t + 0.3, x, z, this.mat.metalDark, { y: height + 0.35, collide: false });
    } else {
      this.addBox(t, height, pw, x, z - width / 2 - pw / 2, mat);
      this.addBox(t, height, pw, x, z + width / 2 + pw / 2, mat);
      this.addBox(t, 0.7, width + pw * 2, x, z, mat, { y: height - 0.35, collide: false });
      this.addBox(t + 0.3, 0.25, width + pw * 2, x, z, this.mat.metalDark, { y: height + 0.35, collide: false });
    }
  }

  crate(x, z, size = 1.2, opts = {}) {
    const { y = 0, rot = 0.1, mat = this.mat.crate, collide = true } = opts;
    const mesh = this.addBox(size, size, size, x, z, mat, { y, rotY: rot, collide });
    // corner straps
    const strapMat = this.mat.metalDark;
    const sw = size + 0.02;
    this.addBox(sw, 0.05, 0.07, x, z - size * 0.28, strapMat, { y: y + size - 0.12, collide: false, cast: false, rotY: rot });
    this.addBox(sw, 0.05, 0.07, x, z + size * 0.28, strapMat, { y: y + size - 0.12, collide: false, cast: false, rotY: rot });
    return mesh;
  }

  crateStack(x, z, n = 2, size = 1.2) {
    for (let i = 0; i < n; i++) {
      const s = size * (1 - i * 0.08);
      this.crate(x + (i % 2 ? 0.05 : -0.03), z + (i % 2 ? -0.03 : 0.04), s, { y: i * size, rot: (i % 2 ? 0.16 : -0.09), mat: i === 1 ? this.mat.crateDark : this.mat.crate, collide: i === 0 });
    }
  }

  barrel(x, z, color = 0x4f5a4a, y = 0) {
    const geo = new THREE.CylinderGeometry(0.42, 0.42, 1.15, 12);
    const mat = std({ color, roughness: 0.6, metalness: 0.42, map: this.tex.metal, bumpMap: this.tex.metalBump, bumpScale: 0.02 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 0.575, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.world = true;
    this.scene.add(mesh);
    this.shootables.push(mesh);
    const ringGeo = new THREE.TorusGeometry(0.43, 0.035, 5, 14);
    for (const ry of [0.28, 0.88]) {
      const ring = new THREE.Mesh(ringGeo, this.mat.dark);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y + ry, z);
      this.scene.add(ring);
    }
    this.colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z - 0.45, maxZ: z + 0.45, height: y + 1.15 });
    return mesh;
  }

  sandbagRow(x, z, length, horizontal = true, height = 2) {
    const bagW = 0.74;
    const bagH = 0.3;
    const bagD = 0.46;
    const count = Math.max(1, Math.round(length / bagW));
    for (let row = 0; row < height; row++) {
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * bagW + (row % 2 ? bagW * 0.25 : 0);
        const bx = horizontal ? x + offset : x + (row % 2 ? 0.05 : -0.03);
        const bz = horizontal ? z + (row % 2 ? 0.04 : -0.04) : z + offset;
        const mesh = this.addBox(bagW - 0.05, bagH, bagD, bx, bz, this.mat.tarp, {
          y: row * bagH, rotY: horizontal ? 0 : Math.PI / 2, collide: false, cast: true,
        });
        mesh.scale.set(1, 0.9 + Math.random() * 0.2, 1);
      }
    }
    const w = horizontal ? length : 0.8;
    const d = horizontal ? 0.8 : length;
    this.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, height: height * bagH });
  }

  tarpRoof(x, z, w, d, colorMat = this.mat.tarp, y = 2.7) {
    const geo = new THREE.PlaneGeometry(w, d, 8, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      pos.setZ(i, Math.sin(px * 1.3) * 0.08 + Math.cos(py * 1.7) * 0.06 + (Math.abs(px) / w) * 0.2);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, colorMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    const poleMat = this.mat.metalDark;
    for (const [dx, dz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, y, 5), poleMat);
      pole.position.set(x + dx, y / 2, z + dz);
      pole.castShadow = true;
      this.scene.add(pole);
    }
    return mesh;
  }

  decalPlane(tex, x, z, w, h, rotY = 0, y = 0.02, opacity = 1) {
    const mat = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, opacity, roughness: 0.9, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.rotation.set(-Math.PI / 2, 0, rotY);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    return mesh;
  }

  wallDecal(tex, x, y, z, w, h, rotY = 0) {
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    this.scene.add(mesh);
    return mesh;
  }

  buildMap() {
    const M = this.mat;
    // ---------- ground ----------
    const groundTex = this.tex.sand.clone();
    groundTex.needsUpdate = true;
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 16);
    groundTex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const groundMat = std({ map: groundTex, roughness: 0.98, metalness: 0 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(63, 63), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.userData.world = true;
    this.scene.add(ground);
    this.shootables.push(ground);

    // ---------- perimeter ----------
    const T = 1.4;
    const H = 7.2;
    this.wall(-31, -31, 31, -31, H, T);
    this.wall(-31, 31, 31, 31, H, T);
    this.wall(-31, -31, -31, 31, H, T);
    this.wall(31, -31, 31, 31, H, T);
    // parapets / broken silhouettes
    for (let i = 0; i < 10; i++) {
      const x = -27 + i * 6;
      this.addBox(4.4, 0.7 + Math.random() * 0.5, 1.8, x, -31, M.wallDark, { y: H, collide: false });
      this.addBox(3.6, 0.5 + Math.random() * 0.4, 1.7, -x * 0.94, 31, M.wallDark, { y: H, collide: false });
    }
    // outer trim
    this.addBox(63, 0.3, 0.4, 0, -30.2, M.concrete, { y: 0.0, collide: false });
    this.addBox(63, 0.3, 0.4, 0, 30.2, M.concrete, { y: 0.0, collide: false });

    // ---------- spawn pocket ----------
    this.sandbagRow(-7.4, 17.3, 5.4, true, 2);
    this.sandbagRow(7.4, 17.3, 5.4, true, 2);
    this.crateStack(-8.6, 22.4, 2);
    this.crateStack(8.8, 22.8, 3);
    this.crate(-8.8, 25.6, 1.1, { rot: 0.3 });
    this.barrel(-11, 20.3, 0x42523f);
    // faded round marking
    this.decalPlane(this.tex.paintA, 0, 26.2, 3.2, 3.2, 0, 0.015, 0.16);

    // spawn awning
    this.tarpRoof(-5.6, 27.2, 9, 4.4, M.tarp, 3.2);
    this.addBox(0.5, 3.2, 0.5, -10, 25.1, M.metalDark, { collide: false });
    this.addBox(0.5, 3.2, 0.5, -1.2, 25.1, M.metalDark, { collide: false });

    // ---------- mid ruin ----------
    // gateway pillars + lintel
    this.addBox(1.5, 4.4, 1.5, -6.5, 0.4, M.wall);
    this.addBox(1.5, 4.4, 1.5, 6.5, 0.4, M.wall);
    this.addBox(14.5, 0.9, 1.7, 0, 0.4, M.wall, { y: 4.4, collide: false });
    this.addBox(14.8, 0.24, 2.1, 0, 0.4, M.metalDark, { y: 5.2, collide: false });
    this.wall(-6.5, 0.4, -6.5, 6.2, 3.1, 0.8);
    this.wall(6.5, 0.4, 6.5, 6.2, 3.1, 0.8);
    this.wall(-6.5, 6.2, -2.2, 6.2, 3.1, 0.8);
    this.wall(2.2, 6.2, 6.5, 6.2, 3.1, 0.8);
    // central cover
    this.crateStack(-2.1, 2.5, 2);
    this.crate(1.4, 2.8, 1.25, { rot: -0.22 });
    this.sandbagRow(0, 4.8, 5.2, true, 2);
    this.barrel(4.4, 4.4, 0x59493a);
    this.wallDecal(this.tex.graffiti.mid, -6.9, 2.6, 3.2, 0.6, 2.5, -Math.PI / 2);

    // mid to A alley cover
    this.crate(8.2, -2.2, 1.15, { rot: 0.4 });
    this.sandbagRow(11.4, -5.1, 4.2, true, 2);

    // ---------- A site ----------
    // south wall with two gaps (west entry / tunnel exit)
    this.wall(8, -8, 14.6, -8, 4.6, 0.9);
    this.wall(17.8, -8, 23.1, -8, 4.6, 0.9);
    this.wall(26.2, -8, 31, -8, 4.6, 0.9);
    // west wall with arch
    this.wall(8, -8, 8, -11.8, 4.6, 0.9);
    this.arch(8, -13.7, { axis: 'z', width: 3.0, height: 3.5, t: 0.9 });
    this.wall(8, -15.6, 8, -31, 4.6, 0.9);
    // A sign above south entry
    this.addBox(5.2, 2.2, 0.35, 16.2, -7.5, M.metalDark, { y: 4.8, collide: false });
    this.wallDecal(this.tex.paintA, 16.2, 5.9, -7.28, 2.0, 2.0, 0);
    // floor marking
    this.decalPlane(this.tex.paintA, 18.6, -20.4, 8.6, 8.6, 0.04, 0.015, 0.95);
    // crates / cover
    this.crateStack(12.2, -17.4, 2);
    this.crateStack(15.4, -23.2, 3, 1.25);
    this.crate(21.2, -14.7, 1.3, { rot: 0.35 });
    this.crateStack(24.8, -17.5, 2, 1.15);
    this.sandbagRow(17.4, -13.4, 3.8, true, 2);
    this.barrel(20.0, -25.4, 0x5c3f31);
    this.barrel(12.8, -25.6, 0x3f4c40);
    // scaffolding along east wall
    for (const [sx, sz] of [[28.1, -22.5], [28.1, -18.5], [24.6, -22.5], [24.6, -18.5]]) {
      this.addBox(0.16, 4.1, 0.16, sx, sz, M.metalDark, { collide: false });
    }
    this.addBox(4.2, 0.16, 0.24, 26.35, -18.5, M.metal, { y: 2.2, collide: false });
    this.addBox(4.2, 0.16, 0.24, 26.35, -22.5, M.metal, { y: 2.2, collide: false });
    this.addBox(0.24, 0.16, 4.2, 28.1, -20.5, M.metal, { y: 2.2, collide: false });
    this.addBox(4.2, 0.12, 1.0, 26.35, -20.5, M.crate, { y: 2.35, collide: false });
    // bomb prop terminal
    this.addBox(1.0, 0.45, 0.8, 20.0, -28.2, M.dark, { y: 0 });
    this.addBox(0.7, 0.28, 0.5, 20.0, -28.2, M.red, { y: 0.45 });
    this.addBox(0.9, 0.06, 0.62, 20.0, -28.2, M.metal, { y: 0.74, collide: false });
    // warning stripes
    this.wall(12.4, -7.95, 14.4, -7.95, 0.35, 0.14, M.hazard, { y: 1.7, collide: false });
    this.wall(18.0, -7.95, 20.0, -7.95, 0.35, 0.14, M.hazard, { y: 1.7, collide: false });

    // ---------- long corridor ----------
    this.wall(-12, -31, -12, -19.4, 4.2, 0.85);
    this.arch(-12, -17.2, { axis: 'z', width: 3.0, height: 3.4, t: 0.85 });
    this.wall(-12, -15, -12, -2.2, 4.2, 0.85);
    this.arch(-12, -0.2, { axis: 'z', width: 3.0, height: 3.4, t: 0.85 });
    this.wall(-12, 2, -12, 14.5, 4.2, 0.85);
    this.wall(-12, 18.2, -12, 31, 4.2, 0.85);
    this.arch(-12, 16.1, { axis: 'z', width: 2.8, height: 3.4, t: 0.85 });
    // long cover
    this.crateStack(-24.4, -11.2, 2);
    this.crate(-18.2, -6.4, 1.2, { rot: 0.2 });
    this.crateStack(-21.3, 6.4, 2, 1.15);
    this.sandbagRow(-18.2, 10.4, 4.6, true, 2);
    this.barrel(-26.2, -1.8, 0x514239);
    this.barrel(-25.4, -0.5, 0x4b5544);
    this.barrel(-14.6, -23.4, 0x5a463a);
    this.wallDecal(this.tex.graffiti.long, -12.45, 2.7, -22.4, 4.0, 1.0, -Math.PI / 2);
    // overhead cables
    this.cable(new THREE.Vector3(-27, 4.8, -22), new THREE.Vector3(-14, 4.2, -12), 0.6);
    this.cable(new THREE.Vector3(-27, 4.4, 8), new THREE.Vector3(-15, 4.9, 13), -0.4);

    // ---------- market ----------
    // stalls
    this.stall(-20.5, 21.2, 4.4, 3.2, M.tarpRed);
    this.stall(-25.2, 26.1, 3.8, 2.8, M.tarp);
    this.stall(-16.2, 26.2, 3.4, 2.8, M.tarpRed);
    this.crateStack(-26.9, 19.2, 2);
    this.crate(-14.8, 25.4, 1.2, { rot: 0.25 });
    this.barrel(-18.4, 17.2, 0x58453b);
    this.barrel(-17.6, 18.0, 0x425044);

    // ---------- tunnels ----------
    // covering walls & roof from z=-8 to 8 along east
    this.wall(22.0, 8.5, 22.0, 13.6, 4.0, 0.9);
    this.wall(22.0, -7.4, 22.0, 4.2, 4.0, 0.9);
    // roof
    const roof = this.addBox(7.4, 0.35, 22.8, 25.5, 0.0, M.concrete, { y: 3.35, collide: false, cast: true });
    roof.receiveShadow = true;
    // support beams
    for (let z = -6; z <= 6; z += 4) {
      this.addBox(0.22, 3.35, 0.35, 22.2, z, M.metalDark, { collide: false });
      this.addBox(7.2, 0.22, 0.35, 25.5, z, M.metalDark, { y: 3.15, collide: false });
    }
    // tunnel mouth
    this.arch(22.0, 9.0, { axis: 'z', width: 2.4, height: 3.3, t: 0.9 });
    this.arch(22.0, -8.2, { axis: 'z', width: 2.4, height: 3.3, t: 0.9 });
    // pipes
    const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 14, 6);
    for (const [px, py] of [[28.3, 2.8], [28.1, 2.45], [22.6, 2.9]]) {
      const pipe = new THREE.Mesh(pipeGeo, M.pipe);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(px, py, -1);
      this.scene.add(pipe);
    }
    // tunnel crates / lights
    this.crate(27.2, 4.8, 1.05, { rot: 0.2 });
    this.crate(26.4, -4.8, 1.1, { rot: -0.3 });
    const lampGeo = new THREE.BoxGeometry(1.5, 0.1, 0.3);
    for (const z of [-4, 1, 6]) {
      const lamp = new THREE.Mesh(lampGeo, new THREE.MeshStandardMaterial({ color: 0xf5e4bc, emissive: 0xffb15f, emissiveIntensity: 2.2 }));
      lamp.position.set(25.5, 3.02, z);
      this.scene.add(lamp);
    }
    // cables in tunnel
    this.cable(new THREE.Vector3(22.6, 3.0, -7), new THREE.Vector3(23.2, 2.7, 7), 0.3);

    // ---------- detailing ----------
    // distant ridges beyond walls
    const ridgeMat = std({ color: 0xb59a70, roughness: 1, fog: true });
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + 0.1;
      const r = 54 + Math.random() * 18;
      const geo = new THREE.ConeGeometry(8 + Math.random() * 10, 5 + Math.random() * 8, 5);
      const ridge = new THREE.Mesh(geo, ridgeMat);
      ridge.position.set(Math.cos(ang) * r, 1.4, Math.sin(ang) * r);
      ridge.rotation.y = Math.random() * Math.PI;
      this.scene.add(ridge);
    }
    // random ground stains
    for (let i = 0; i < 22; i++) {
      const stain = this.decalPlane(this.tex.soft, (Math.random() - 0.5) * 54, (Math.random() - 0.5) * 54, 2 + Math.random() * 6, 2 + Math.random() * 6, Math.random() * Math.PI, 0.008, 0.13);
      stain.material.color = new THREE.Color(0x3c2e1c);
      stain.material.blending = THREE.NormalBlending;
    }
    // scattered papers / debris
    const debrisMat = std({ color: 0xb7ab8b, roughness: 1, side: THREE.DoubleSide });
    for (let i = 0; i < 26; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.18 + Math.random() * 0.35, 0.12 + Math.random() * 0.3), debrisMat);
      p.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
      p.position.set((Math.random() - 0.5) * 52, 0.015, (Math.random() - 0.5) * 52);
      p.receiveShadow = true;
      this.scene.add(p);
    }
    // hanging cables near market
    this.cable(new THREE.Vector3(-28, 5.2, 16), new THREE.Vector3(-13, 4.4, 24), 0.4);
  }

  stall(x, z, w, d, mat) {
    this.tarpRoof(x, z, w, d, mat, 2.55);
    // table
    this.addBox(w * 0.78, 0.18, d * 0.55, x, z, this.mat.crateDark, { y: 0.85 });
    for (const [dx, dz] of [[-w * 0.34, -d * 0.2], [w * 0.34, -d * 0.2], [-w * 0.34, d * 0.2], [w * 0.34, d * 0.2]]) {
      this.addBox(0.12, 0.85, 0.12, x + dx, z + dz, this.mat.metalDark, { collide: false });
    }
    // goods
    for (let i = 0; i < 4; i++) {
      const bx = x + (Math.random() - 0.5) * w * 0.55;
      const bz = z + (Math.random() - 0.5) * d * 0.35;
      const box = this.addBox(0.25, 0.18 + Math.random() * 0.2, 0.25, bx, bz, this.mat.crate, { y: 1.03, rotY: Math.random(), collide: false });
      box.castShadow = false;
    }
  }

  cable(a, b, sag = 0.6) {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y -= sag;
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    const geo = new THREE.TubeGeometry(curve, 14, 0.025, 4, false);
    const mesh = new THREE.Mesh(geo, this.mat.wire);
    this.scene.add(mesh);
  }

  buildAtmosphere() {
    const count = this.mobile ? 260 : 520;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
      seed[i] = Math.random() * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.PointsMaterial({
      map: this.tex.soft, color: 0xffe8bd, size: 0.11, transparent: true, opacity: 0.4,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.dust = new THREE.Points(geo, mat);
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  buildStations() {
    const defs = [
      { id: 'uplink', name: 'DEFUSE UPLINK', type: 'keypad', x: -2.4, z: 26.4, code: 'TASK 01', rot: Math.PI },
      { id: 'valve', name: 'COOLANT VALVE', type: 'calibrate', x: -24.2, z: 22.0, code: 'TASK 02', rot: Math.PI * 0.5 },
      { id: 'fiber', name: 'FIBER OPTIC LINK', type: 'wires', x: -26.7, z: 3.8, code: 'TASK 03', rot: Math.PI * 0.5 },
      { id: 'relay', name: 'SIGNAL RELAY', type: 'wires', x: -4.2, z: 7.4, code: 'TASK 04', rot: 0 },
      { id: 'coolant', name: 'PRESSURE BYPASS', type: 'calibrate', x: 26.6, z: 0.0, code: 'TASK 05', rot: -Math.PI * 0.5 },
      { id: 'detonator', name: 'DETONATOR LOOP', type: 'keypad', x: 23.6, z: -26.4, code: 'TASK 06', rot: 0 },
    ];
    const marker = this.tex.marker;
    for (const def of defs) {
      const group = new THREE.Group();
      group.position.set(def.x, 0, def.z);
      group.rotation.y = def.rot;
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.05, 0.52), this.mat.metalDark);
      base.position.y = 0.525;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.12, 0.66), this.mat.metal);
      top.position.y = 1.11;
      group.add(top);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.42), this.mat.screen.clone());
      screen.position.set(0, 0.94, 0.27);
      group.add(screen);
      const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.2), this.mat.dark);
      keypad.position.set(0, 0.72, 0.29);
      keypad.rotation.x = -0.25;
      group.add(keypad);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.035, 0.02), new THREE.MeshStandardMaterial({ color: 0x120d06, emissive: 0xf5b942, emissiveIntensity: 1.6 }));
      strip.position.set(0, 0.2, 0.275);
      group.add(strip);
      this.scene.add(group);
      // collision
      const s = Math.abs(Math.sin(def.rot)) > 0.5 ? 0.62 : 1.02;
      const d = Math.abs(Math.sin(def.rot)) > 0.5 ? 1.02 : 0.62;
      this.colliders.push({ minX: def.x - s / 2, maxX: def.x + s / 2, minZ: def.z - d / 2, maxZ: def.z + d / 2, height: 1.2 });
      // marker sprite
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: marker, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
      sprite.scale.set(0.62, 0.62, 1);
      sprite.position.set(def.x, 2.15, def.z);
      sprite.renderOrder = 20;
      this.scene.add(sprite);
      this.stations.push({ ...def, group, screen, strip, sprite, done: false, markerBase: 2.15 });
    }

    // sabotage electrical panel on tunnel exterior wall
    this.panel = { x: 21.85, z: 2.0, mesh: null, light: null };
    const panel = new THREE.Group();
    panel.position.set(21.82, 1.55, 2.0);
    panel.rotation.y = -Math.PI / 2;
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.35, 0.22), this.mat.metalDark);
    panel.add(box);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), this.mat.hazard);
    face.position.z = 0.12;
    panel.add(face);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0x220603, emissive: 0xff2a1a, emissiveIntensity: 2 }));
    light.position.set(0.34, 0.48, 0.16);
    panel.add(light);
    this.scene.add(panel);
    this.panel.mesh = panel;
    this.panel.light = light;
    this.panel.marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: marker, color: 0xff4b3e, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    this.panel.marker.scale.set(0.7, 0.7, 1);
    this.panel.marker.position.set(21.6, 2.6, 2.0);
    this.scene.add(this.panel.marker);

    // vents
    const ventPositions = [[4.6, 8.6, 0.3], [-14.1, -8.8, Math.PI / 2], [24.6, -5.4, 0], [-26.0, 15.4, Math.PI / 2]];
    for (const [x, z, r] of ventPositions) {
      const g = new THREE.Group();
      g.position.set(x, 0.02, z);
      g.rotation.y = r;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.72), this.mat.metalDark);
      frame.receiveShadow = true;
      g.add(frame);
      for (let i = -2; i <= 2; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.6), this.mat.dark);
        bar.position.x = i * 0.18;
        bar.position.y = 0.045;
        g.add(bar);
      }
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.58), new THREE.MeshBasicMaterial({ color: 0x2a0b06, transparent: true, opacity: 0.4 }));
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.005;
      g.add(glow);
      this.scene.add(g);
      this.vents.push({ x, z, mesh: g });
    }
  }

  optimizeStatic() {
    this.scene.updateMatrixWorld(true);
    const candidates = this.scene.children.filter((o) => o.isMesh && o !== this.sky && !Array.isArray(o.material));
    if (!candidates.length) return;

    const sig = (m) => [
      m.type, m.map?.uuid, m.alphaMap?.uuid, m.aoMap?.uuid, m.bumpMap?.uuid,
      m.emissiveMap?.uuid, m.metalnessMap?.uuid, m.normalMap?.uuid, m.roughnessMap?.uuid,
      m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity,
      m.roughness, m.metalness, m.opacity, m.transparent, m.side, m.depthWrite,
      m.depthTest, m.alphaTest, m.blending, m.vertexColors, m.wireframe, m.flatShading,
    ].join('|');

    const canonical = new Map();
    const groups = new Map();
    const candidateSet = new Set(candidates);

    for (const mesh of candidates) {
      const key = sig(mesh.material);
      let mat = canonical.get(key);
      if (!mat) {
        mat = mesh.material;
        canonical.set(key, mat);
      } else if (mat !== mesh.material) {
        mesh.material = mat;
      }
      const attrs = Object.keys(mesh.geometry.attributes).sort().join(',');
      const gkey = `${mat.uuid}|${mesh.castShadow ? 1 : 0}|${mesh.receiveShadow ? 1 : 0}|${attrs}`;
      let list = groups.get(gkey);
      if (!list) groups.set(gkey, (list = []));
      list.push(mesh);
    }

    const shootSet = new Set(this.shootables);
    const nextShootables = this.shootables.filter((o) => !candidateSet.has(o));

    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const geometries = list.map((mesh) => mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
      const geometry = mergeGeometries(geometries, false);
      geometries.forEach((g) => g.dispose());
      if (!geometry) continue;
      const merged = new THREE.Mesh(geometry, list[0].material);
      merged.castShadow = list[0].castShadow;
      merged.receiveShadow = list[0].receiveShadow;
      merged.userData.world = true;
      this.scene.add(merged);
      if (list.some((mesh) => shootSet.has(mesh))) nextShootables.push(merged);
      for (const mesh of list) mesh.removeFromParent();
    }
    this.shootables = nextShootables;
  }

  setLightsOut(on) {
    this.dark = on;
    this.panel.light.material.emissiveIntensity = on ? 4 : 1.2;
    this.panel.marker.material.opacity = on ? 1 : 0;
  }

  update(dt, elapsed) {
    this.darkAmount += ((this.dark ? 1 : 0) - this.darkAmount) * Math.min(1, dt * 2.2);
    const dark = this.darkAmount;

    // sky / fog / lights
    this.sky.material.uniforms.dark.value = dark * 0.88;
    const fog = new THREE.Color(0xc9ad82).lerp(new THREE.Color(0x090b0a), dark);
    this.scene.fog.color.copy(fog);
    this.scene.background.copy(fog);
    this.sun.intensity = 2.6 * (1 - dark * 0.96);
    this.hemi.intensity = 0.92 * (1 - dark * 0.82);
    this.fill.intensity = 0.3 * (1 - dark * 0.9);
    this.sunSprite.material.opacity = 0.85 * (1 - dark);
    const flick = 0.86 + Math.sin(elapsed * 31) * 0.035 + Math.sin(elapsed * 7.7) * 0.06;
    for (let i = 0; i < this.lampLights.length; i++) {
      const base = [10, 13, 7][i] ?? 8;
      const f = i === 0 ? (0.8 + Math.sin(elapsed * 23 + i) * 0.08) : flick;
      this.lampLights[i].intensity = base * f * (1 - dark * 0.3);
    }
    for (const l of this.emLights) {
      l.intensity = dark * (5 + Math.sin(elapsed * 5.1) * 1.1);
    }
    this.panel.light.material.emissiveIntensity = (this.dark ? 4 : 1.2) * (0.7 + Math.sin(elapsed * 6) * 0.3);

    // dust
    if (this.dust) {
      const pos = this.dust.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + dt * (0.18 + (i % 7) * 0.015);
        let y = pos.getY(i) + Math.sin(elapsed * 0.4 + i) * dt * 0.04;
        let z = pos.getZ(i) + dt * 0.05;
        if (x > 35) x = -35;
        if (z > 35) z = -35;
        if (y > 10) y = 0.3;
        if (y < 0) y = 9;
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // station markers + screens
    for (const st of this.stations) {
      if (st.done) {
        st.sprite.material.opacity = 0;
        st.screen.material.emissiveIntensity = 0.25;
        st.strip.material.emissive = new THREE.Color(0x64e6c2);
        st.strip.material.emissiveIntensity = 0.4;
        continue;
      }
      st.sprite.position.y = st.markerBase + Math.sin(elapsed * 2.4 + st.x) * 0.1;
      const s = 0.58 + Math.sin(elapsed * 2.4 + st.x) * 0.04;
      st.sprite.scale.set(s, s, 1);
      st.sprite.material.opacity = 0.78 + Math.sin(elapsed * 2.4 + st.x) * 0.16;
      st.screen.material.emissiveIntensity = 1.1 + Math.sin(elapsed * 3 + st.z) * 0.28;
    }
    if (this.panel.marker.material.opacity > 0) {
      this.panel.marker.position.y = 2.6 + Math.sin(elapsed * 5) * 0.09;
    }
    // bomb blink
    this.mat.red.emissiveIntensity = 0.3 + (Math.sin(elapsed * 6.5) > 0.55 ? 1.1 : 0);
  }
}
