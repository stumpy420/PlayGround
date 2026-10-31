import * as THREE from '../vendor/three.module.js';
import {
  terrainHeight, HUB, REFINERY, ELEVATOR, MAP_HALF,
  rand, randInt, pick, TAU, clamp, smoothstep, fbm,
} from './util.js';

/* ------------------------------------------------------------------ */
/* Procedural textures                                                 */
/* ------------------------------------------------------------------ */

function grainTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 168 + Math.random() * 78;
    img.data[i] = v;
    img.data[i + 1] = v * 0.96;
    img.data[i + 2] = v * 0.9;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(180, 180);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function padTexture(label, accent = '#79f2ff', sub = 'EXTRACTION LIFT') {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 3;
  for (const r of [250, 205, 120, 62]) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, TAU);
    ctx.stroke();
  }

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(256, 256, 232, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // hazard ticks
  ctx.strokeStyle = 'rgba(255,176,87,0.5)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190);
    ctx.lineTo(256 + Math.cos(a) * 205, 256 + Math.sin(a) * 205);
    ctx.stroke();
  }

  ctx.fillStyle = accent;
  ctx.font = '700 74px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 262);
  ctx.font = '600 20px Rajdhani, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(sub, 256, 318);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function signTexture(text, accent = '#ffb057') {  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(7,6,5,0.94)';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, 502, 118);
  ctx.fillStyle = accent;
  ctx.font = '700 40px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function dustTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export function createWorld(scene, renderer) {
  const colliders = [];
  const shootables = [];
  const crates = [];
  const crystals = [];
  const animated = [];

  /* --- lighting & atmosphere ------------------------------------- */
  const clearFog = new THREE.Color(0xc08a5e);
  const stormFog = new THREE.Color(0x74351c);
  scene.fog = new THREE.FogExp2(clearFog.clone(), 0.0031);

  const hemi = new THREE.HemisphereLight(0x9fc4e8, 0x6b3d26, 1.45);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffd9b5, 0.36);
  scene.add(ambient);

  // cool bounce from the far ridge keeps silhouettes readable
  const backLight = new THREE.DirectionalLight(0x7fa6d6, 0.85);
  backLight.position.set(80, 45, 90);
  scene.add(backLight);

  const sunDir = new THREE.Vector3(-0.48, 0.31, -0.62).normalize();
  const sun = new THREE.DirectionalLight(0xffc18a, 3.3);
  sun.position.copy(sunDir).multiplyScalar(170);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 380;
  sun.shadow.camera.left = -85;
  sun.shadow.camera.right = 85;
  sun.shadow.camera.top = 85;
  sun.shadow.camera.bottom = -85;
  sun.shadow.bias = -0.0007;
  sun.shadow.normalBias = 0.7;
  scene.add(sun);
  scene.add(sun.target);

  /* --- sky dome --------------------------------------------------- */
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x2d2545) },
      horizonColor: { value: new THREE.Color(0xf0a76d) },
      sunColor: { value: new THREE.Color(0xffc98a) },
      sunDir: { value: sunDir.clone() },
      storm: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorld;
      void main() {
        vWorld = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 sunColor;
      uniform vec3 sunDir;
      uniform float storm;
      varying vec3 vWorld;
      void main() {
        vec3 dir = normalize(vWorld);
        float h = clamp(dir.y * 1.35, 0.0, 1.0);
        vec3 col = mix(horizonColor, topColor, pow(h, 0.62));
        float sun = max(dot(dir, normalize(sunDir)), 0.0);
        col += sunColor * pow(sun, 900.0) * 2.0;
        col += sunColor * pow(sun, 14.0) * 0.14;
        col = mix(col, vec3(0.26, 0.11, 0.06), storm * 0.72 * (1.0 - h * 0.35));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(620, 32, 20), skyMat);
  sky.frustumCulled = false;
  scene.add(sky);

  /* --- terrain ---------------------------------------------------- */
  const SIZE = MAP_HALF * 2;
  const SEG = 170;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cLow = new THREE.Color(0x7a5a3f);
  const cMid = new THREE.Color(0xab8155);
  const cHigh = new THREE.Color(0xd6b083);
  const cAsh = new THREE.Color(0x574941);
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);

    const n = fbm(x * 0.055 + 4, z * 0.055 - 2, 3);
    const m = fbm(x * 0.012 - 8, z * 0.012 + 3, 2);
    tmpColor.copy(cLow)
      .lerp(cMid, clamp((h + 9) / 20, 0, 1))
      .lerp(cHigh, clamp(n * 0.85, 0, 1) * 0.6)
      .lerp(cAsh, smoothstep(0.58, 0.78, m) * 0.45);
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: grainTexture(),
    roughness: 0.97,
    metalness: 0.02,
  });
  const terrain = new THREE.Mesh(geo, terrainMat);
  terrain.receiveShadow = true;
  scene.add(terrain);
  shootables.push(terrain);

  /* --- shared materials ------------------------------------------- */
  const MAT = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x8a7b6b, roughness: 0.92, metalness: 0.05 }),
    darkConcrete: new THREE.MeshStandardMaterial({ color: 0x5c5249, roughness: 0.95 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x4a4c4f, roughness: 0.5, metalness: 0.72 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x26282b, roughness: 0.45, metalness: 0.8 }),
    rust: new THREE.MeshStandardMaterial({ color: 0x8a4a2b, roughness: 0.86, metalness: 0.3 }),
    rustDark: new THREE.MeshStandardMaterial({ color: 0x5b3220, roughness: 0.9, metalness: 0.25 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xd06a22, roughness: 0.6, metalness: 0.3 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x1f5c63, roughness: 0.65, metalness: 0.4 }),
    amberGlow: new THREE.MeshBasicMaterial({ color: 0xffb057 }),
    cyanGlow: new THREE.MeshBasicMaterial({ color: 0x79f2ff }),
    redGlow: new THREE.MeshBasicMaterial({ color: 0xff3b46 }),
    window: new THREE.MeshBasicMaterial({ color: 0xffcf8a }),
    rock: new THREE.MeshStandardMaterial({ color: 0x6a4a36, roughness: 0.98, flatShading: true }),
    rockDark: new THREE.MeshStandardMaterial({ color: 0x493227, roughness: 0.98, flatShading: true }),
  };

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

  function addBox(w, h, d, x, y, z, mat, opts = {}) {
    const mesh = new THREE.Mesh(boxGeo, mat);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    if (opts.rotY) mesh.rotation.y = opts.rotY;
    mesh.castShadow = opts.shadow !== false;
    mesh.receiveShadow = true;
    (opts.parent || scene).add(mesh);
    if (opts.collide) {
      const r = opts.rotY ? Math.abs(Math.cos(opts.rotY)) * w + Math.abs(Math.sin(opts.rotY)) * d : w;
      const r2 = opts.rotY ? Math.abs(Math.sin(opts.rotY)) * w + Math.abs(Math.cos(opts.rotY)) * d : d;
      colliders.push({
        type: 'box',
        minX: x - r / 2, maxX: x + r / 2,
        minZ: z - r2 / 2, maxZ: z + r2 / 2,
        minY: y - h / 2, maxY: y + h / 2,
      });
    }
    shootables.push(mesh);
    return mesh;
  }

  function addCyl(rt, rb, h, x, y, z, mat, opts = {}) {
    const mesh = new THREE.Mesh(cylGeo, mat);
    mesh.scale.set(rt, h, rb);
    mesh.position.set(x, y, z);
    if (opts.rot) mesh.rotation.set(opts.rot.x || 0, opts.rot.y || 0, opts.rot.z || 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (opts.parent || scene).add(mesh);
    if (opts.collide) {
      const rad = Math.max(rt, rb);
      colliders.push({ type: 'circle', x, z, r: rad, minY: y - h / 2, maxY: y + h / 2 });
    }
    shootables.push(mesh);
    return mesh;
  }

  function addSign(text, accent, w, h, x, y, z, rotY = 0) {
    const mat = new THREE.MeshBasicMaterial({
      map: signTexture(text, accent),
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    scene.add(mesh);
    return mesh;
  }

  function addPad(x, z, label, radius, accent, sub) {
    const mat = new THREE.MeshBasicMaterial({
      map: padTexture(label, accent, sub),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.55,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, terrainHeight(x, z) + 0.06, z);
    mesh.renderOrder = 1;
    scene.add(mesh);
    return mesh;
  }

  /* --- Sanctuary 7 (hub) ------------------------------------------ */
  const hubY = terrainHeight(HUB.x, HUB.z);
  addPad(HUB.x, HUB.z, 'S7', 13, '#ffb057', 'SANCTUARY 7');

  const safehouse = addBox(16, 6.4, 11, HUB.x, hubY + 3.2, HUB.z - 5, MAT.concrete, { collide: true });
  addBox(16.8, 0.5, 11.8, HUB.x, hubY + 6.5, HUB.z - 5, MAT.darkConcrete);
  addBox(16.2, 0.25, 11.2, HUB.x, hubY + 0.14, HUB.z - 5, MAT.darkMetal, { shadow: false });
  // lit window band
  addBox(13, 0.7, 0.16, HUB.x, hubY + 4.4, HUB.z + 0.55, MAT.window, { shadow: false });
  addBox(0.16, 3.2, 6, HUB.x - 7.2, hubY + 2.2, HUB.z - 5, MAT.darkMetal);
  // door
  addBox(2.2, 3.4, 0.2, HUB.x + 3.4, hubY + 1.7, HUB.z + 0.62, MAT.darkMetal, { shadow: false });
  addBox(1.9, 2.9, 0.1, HUB.x + 3.4, hubY + 1.6, HUB.z + 0.74, MAT.window, { shadow: false });
  addSign('SANCTUARY 7', '#ffb057', 5.6, 1.4, HUB.x, hubY + 5.6, HUB.z + 0.7);
  addSign('FREE-SCRAPPERS ONLY', '#79f2ff', 3.4, 0.85, HUB.x + 3.4, hubY + 3.75, HUB.z + 0.8);

  // antenna mast
  addCyl(0.18, 0.26, 17, HUB.x + 12, hubY + 8.5, HUB.z - 8, MAT.metal, { collide: true });
  addBox(3.2, 0.16, 0.16, HUB.x + 12, hubY + 13.4, HUB.z - 8, MAT.metal);
  addBox(0.16, 0.16, 3.2, HUB.x + 12, hubY + 12.2, HUB.z - 8, MAT.metal);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), MAT.redGlow);
  beacon.position.set(HUB.x + 12, hubY + 17.2, HUB.z - 8);
  scene.add(beacon);
  animated.push({ type: 'blink', mesh: beacon, speed: 1.1, base: 1 });

  // containers
  const containerA = addBox(7, 2.7, 2.8, HUB.x - 12.5, hubY + 1.35, HUB.z + 4, MAT.teal, { rotY: 0.12, collide: true });
  addBox(7.02, 0.14, 0.14, HUB.x - 12.5, hubY + 2.55, HUB.z + 5.35, MAT.darkMetal);
  const containerB = addBox(6.4, 2.7, 2.7, HUB.x + 11.5, hubY + 1.35, HUB.z + 6, MAT.rust, { rotY: -0.22, collide: true });
  addSign('SALVAGE', '#ffb057', 2.4, 0.6, HUB.x + 11.5, hubY + 2.1, HUB.z + 7.38, -0.22);

  // floodlights
  for (const [dx, dz, rot] of [[-9, 9, 0.6], [9, 10, -0.5]]) {
    addCyl(0.12, 0.16, 8, HUB.x + dx, hubY + 4, HUB.z + dz, MAT.darkMetal);
    const head = addBox(1.1, 0.3, 0.5, HUB.x + dx, hubY + 8, HUB.z + dz, MAT.darkMetal, { shadow: false });
    head.rotation.y = rot;
    const light = new THREE.PointLight(0xffb870, 90, 38, 2);
    light.position.set(HUB.x + dx, hubY + 7.8, HUB.z + dz);
    scene.add(light);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.3), MAT.window);
    lamp.position.set(HUB.x + dx, hubY + 7.83, HUB.z + dz);
    scene.add(lamp);
  }

  // barrels
  for (let i = 0; i < 5; i++) {
    const a = rand(0, TAU);
    const r = rand(4, 9);
    addCyl(0.45, 0.45, 1.15, HUB.x + Math.cos(a) * r, hubY + 0.6, HUB.z + Math.sin(a) * r - 1,
      i % 2 ? MAT.rust : MAT.orange);
  }

  // north gate — frames the spawn view and points you at the badlands
  const gateZ = HUB.z - 40;
  addBox(1.15, 5.4, 1.15, HUB.x - 7.5, hubY + 2.7, gateZ, MAT.concrete, { collide: true });
  addBox(1.15, 5.4, 1.15, HUB.x + 7.5, hubY + 2.7, gateZ, MAT.concrete, { collide: true });
  addBox(16.5, 0.5, 0.85, HUB.x, hubY + 5.2, gateZ, MAT.darkMetal);
  addBox(0.16, 3.6, 0.16, HUB.x - 7.5, hubY + 3.4, gateZ + 0.65, MAT.amberGlow, { shadow: false });
  addBox(0.16, 3.6, 0.16, HUB.x + 7.5, hubY + 3.4, gateZ + 0.65, MAT.amberGlow, { shadow: false });
  addSign('SECTOR 7 // BADLANDS', '#ffb057', 6.2, 1.3, HUB.x, hubY + 6.0, gateZ + 0.5);

  const gateLight = new THREE.PointLight(0xffa860, 70, 26, 2);
  gateLight.position.set(HUB.x, hubY + 5.6, gateZ + 1.4);
  scene.add(gateLight);

  /* --- Refinery 09 ------------------------------------------------ */
  const refY = terrainHeight(REFINERY.x, REFINERY.z);
  const rx = REFINERY.x, rz = REFINERY.z;

  addBox(13, 8.5, 10, rx, refY + 4.25, rz + 2, MAT.rust, { collide: true });
  addBox(13.6, 0.6, 10.6, rx, refY + 8.6, rz + 2, MAT.rustDark);
  addBox(5.4, 0.14, 0.2, rx - 2, refY + 5.4, rz + 7.05, MAT.amberGlow, { shadow: false });
  addBox(5.4, 0.14, 0.2, rx - 2, refY + 4.1, rz + 7.05, MAT.amberGlow, { shadow: false });
  addSign('REFINERY 09', '#ffb057', 6.2, 1.55, rx + 2.4, refY + 7.1, rz + 7.08);

  addCyl(2.4, 2.9, 25, rx - 8, refY + 12.5, rz - 7, MAT.rust, { collide: true });
  addCyl(1.6, 2.0, 17, rx + 6.5, refY + 8.5, rz - 5, MAT.metal, { collide: true });
  addCyl(1.15, 1.35, 29, rx + 3.5, refY + 14.5, rz + 8, MAT.rustDark, { collide: true });
  addBox(9, 0.35, 0.35, rx - 1, refY + 9.5, rz - 7, MAT.metal, { rotY: 0 });
  // cross pipes
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 9.5, 10), MAT.metal);
  pipe.position.set(rx - 1, refY + 9.5, rz - 7);
  pipe.rotation.z = Math.PI / 2;
  pipe.castShadow = true;
  scene.add(pipe);
  shootables.push(pipe);

  addBox(1.2, 1.2, 1.2, rx + 3.5, refY + 29.6, rz + 8, MAT.darkMetal);
  const stackLight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), MAT.redGlow);
  stackLight.position.set(rx + 3.5, refY + 30.4, rz + 8);
  scene.add(stackLight);
  animated.push({ type: 'blink', mesh: stackLight, speed: 0.8, base: 1 });

  // catwalk
  addBox(20, 0.35, 2.2, rx + 1, refY + 6.8, rz + 8.5, MAT.darkMetal);
  for (let i = -9; i <= 9; i += 3) {
    addBox(0.1, 1.2, 0.1, rx + 1 + i, refY + 7.55, rz + 9.5, MAT.metal, { shadow: false });
  }
  addBox(20, 0.1, 0.1, rx + 1, refY + 8.15, rz + 9.5, MAT.metal, { shadow: false });

  // warning sign
  addSign('RADIATION // KEEP OUT', '#ff4d5e', 4.6, 1.15, rx - 3, refY + 2.4, rz + 7.1);

  // floodlight at refinery
  const refLight = new THREE.PointLight(0xff9a4a, 120, 46, 2);
  refLight.position.set(rx + 6, refY + 7, rz + 8);
  scene.add(refLight);

  /* --- Lift 04 ---------------------------------------------------- */
  const liftY = terrainHeight(ELEVATOR.x, ELEVATOR.z);
  addPad(ELEVATOR.x, ELEVATOR.z, '04', 8.2, '#79f2ff');

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(8.2, 0.12, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x79f2ff, toneMapped: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(ELEVATOR.x, liftY + 0.1, ELEVATOR.z);
  scene.add(ring);

  const liftPosts = [];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const px = ELEVATOR.x + Math.cos(a) * 8.6;
    const pz = ELEVATOR.z + Math.sin(a) * 8.6;
    addBox(0.55, 5.4, 0.55, px, liftY + 2.7, pz, MAT.darkMetal, { collide: true });
    addBox(0.12, 4.2, 0.12, px, liftY + 2.9, pz + 0.3, MAT.cyanGlow, { shadow: false });
    liftPosts.push({ x: px, z: pz });
  }
  addBox(19, 0.5, 0.7, ELEVATOR.x, liftY + 5.6, ELEVATOR.z + 9.1, MAT.darkMetal);
  addBox(0.7, 5.6, 0.7, ELEVATOR.x - 9.3, liftY + 2.8, ELEVATOR.z + 9.1, MAT.darkMetal);
  addBox(0.7, 5.6, 0.7, ELEVATOR.x + 9.3, liftY + 2.8, ELEVATOR.z + 9.1, MAT.darkMetal);
  addSign('LIFT 04 // EXTRACTION', '#79f2ff', 8.4, 2.1, ELEVATOR.x, liftY + 6.9, ELEVATOR.z + 9.1);

  // elevator car (decorative, sits flush in the pad)
  addBox(4.4, 0.3, 4.4, ELEVATOR.x, liftY + 0.18, ELEVATOR.z, MAT.metal, { shadow: false });
  addBox(4.6, 0.9, 0.18, ELEVATOR.x, liftY + 0.75, ELEVATOR.z - 2.2, MAT.darkMetal);
  addBox(4.6, 0.9, 0.18, ELEVATOR.x, liftY + 0.75, ELEVATOR.z + 2.2, MAT.darkMetal);
  addBox(0.18, 0.9, 4.4, ELEVATOR.x - 2.2, liftY + 0.75, ELEVATOR.z, MAT.darkMetal);
  addBox(0.18, 0.9, 4.4, ELEVATOR.x + 2.2, liftY + 0.75, ELEVATOR.z, MAT.darkMetal);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x79f2ff, transparent: true, opacity: 0.10,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    toneMapped: false,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 110, 16, 1, true), beamMat);
  beam.position.set(ELEVATOR.x, liftY + 55, ELEVATOR.z);
  scene.add(beam);

  const beamCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 110, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xc8feff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  beamCore.position.copy(beam.position);
  scene.add(beamCore);

  const liftLight = new THREE.PointLight(0x79f2ff, 160, 70, 2);
  liftLight.position.set(ELEVATOR.x, liftY + 5, ELEVATOR.z);
  scene.add(liftLight);

  const lift = {
    x: ELEVATOR.x, z: ELEVATOR.z, y: liftY,
    beam, beamCore, light: liftLight, ring,
    called: false,
  };

  /* --- Rocks ------------------------------------------------------ */
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockCount = 190;
  const rocks = new THREE.InstancedMesh(rockGeo, MAT.rock, rockCount);
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const colA = new THREE.Color(0x7a563e);
  const colB = new THREE.Color(0x4b3428);

  for (let i = 0; i < rockCount; i++) {
    let x, z, d;
    do {
      x = rand(-MAP_HALF + 15, MAP_HALF - 15);
      z = rand(-MAP_HALF + 15, MAP_HALF - 15);
      d = Math.min(
        Math.hypot(x - HUB.x, z - HUB.z) - 20,
        Math.hypot(x - REFINERY.x, z - REFINERY.z) - 26,
        Math.hypot(x - ELEVATOR.x, z - ELEVATOR.z) - 16,
      );
    } while (d < 4);

    const s = Math.pow(Math.random(), 1.8) * 3.6 + 0.45;
    const sy = s * rand(0.55, 1.25);
    dummy.position.set(x, terrainHeight(x, z) + sy * 0.22, z);
    dummy.rotation.set(rand(-0.3, 0.3), rand(0, TAU), rand(-0.3, 0.3));
    dummy.scale.set(s, sy, s * rand(0.75, 1.3));
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);

    const cc = colA.clone().lerp(colB, Math.random());
    rocks.setColorAt(i, cc);

    if (s > 1.5) {
      colliders.push({ type: 'circle', x, z, r: s * 0.78, minY: -20, maxY: 40 });
    }
  }
  rocks.instanceColor.needsUpdate = true;
  scene.add(rocks);
  shootables.push(rocks);

  // pebbles
  const pebbleCount = 900;
  const pebbles = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(0.28, 0), MAT.rockDark, pebbleCount);
  for (let i = 0; i < pebbleCount; i++) {
    const x = rand(-MAP_HALF + 8, MAP_HALF - 8);
    const z = rand(-MAP_HALF + 8, MAP_HALF - 8);
    const s = rand(0.4, 1.2);
    dummy.position.set(x, terrainHeight(x, z) + 0.05, z);
    dummy.rotation.set(rand(0, TAU), rand(0, TAU), rand(0, TAU));
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    pebbles.setMatrixAt(i, dummy.matrix);
  }
  pebbles.castShadow = false;
  scene.add(pebbles);

  /* --- Distant mesas & the Corefall ring -------------------------- */
  const mesaGeo = new THREE.CylinderGeometry(0.72, 1, 1, 6);
  const mesaMat = new THREE.MeshStandardMaterial({ color: 0x3b261e, roughness: 1, flatShading: true });
  const mesaCount = 22;
  const mesas = new THREE.InstancedMesh(mesaGeo, mesaMat, mesaCount);
  for (let i = 0; i < mesaCount; i++) {
    const a = (i / mesaCount) * TAU + rand(-0.1, 0.1);
    const r = rand(185, 280);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = rand(30, 95);
    dummy.position.set(x, h * 0.3 - 4, z);
    dummy.rotation.set(0, rand(0, TAU), 0);
    dummy.scale.set(rand(26, 70), h, rand(26, 70));
    dummy.updateMatrix();
    mesas.setMatrixAt(i, dummy.matrix);
  }
  mesas.castShadow = false;
  scene.add(mesas);

  const ringMesh = new THREE.Mesh(
    new THREE.TorusGeometry(88, 4.2, 6, 60, Math.PI * 0.82),
    new THREE.MeshStandardMaterial({ color: 0x352b2c, roughness: 0.6, metalness: 0.7, emissive: 0x1e6a78, emissiveIntensity: 0.45 })
  );
  ringMesh.position.set(30, 42, -268);
  ringMesh.rotation.set(0.35, -0.35, -0.55);
  scene.add(ringMesh);

  /* --- Roads ------------------------------------------------------ */
  const roadTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#7d5c40';
    ctx.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 2600; i++) {
      const v = 70 + Math.random() * 80;
      ctx.fillStyle = `rgba(${v},${v * 0.78},${v * 0.55},0.35)`;
      ctx.fillRect(Math.random() * 128, Math.random() * 256, 2, 2);
    }
    ctx.fillStyle = 'rgba(40,26,16,0.4)';
    ctx.fillRect(34, 0, 13, 256);
    ctx.fillRect(81, 0, 13, 256);
    ctx.fillStyle = 'rgba(60,40,24,0.25)';
    ctx.fillRect(46, 0, 36, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  })();

  function createRoad(waypoints, width = 8) {
    const pts = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const segLen = Math.hypot(b.x - a.x, b.z - a.z);
      const steps = Math.max(1, Math.ceil(segLen / 2.5));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        pts.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
      }
    }
    pts.push(waypoints[waypoints.length - 1]);

    const positions = [];
    const uvs = [];
    const indices = [];
    let run = 0;
    const half = width / 2;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(pts.length - 1, i + 1)];
      let dx = next.x - prev.x;
      let dz = next.z - prev.z;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      const nx = -dz;
      const nz = dx;
      if (i > 0) run += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z);
      const y = terrainHeight(p.x, p.z) + 0.07;
      positions.push(p.x + nx * half, y, p.z + nz * half);
      positions.push(p.x - nx * half, y, p.z - nz * half);
      uvs.push(0, run / 9, 1, run / 9);
      if (i > 0) {
        const k = i * 2;
        indices.push(k - 2, k - 1, k, k - 1, k + 1, k);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.98,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      side: THREE.DoubleSide,
    }));
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  createRoad([
    { x: HUB.x, z: HUB.z },
    { x: 0, z: 34 },
    { x: REFINERY.x, z: REFINERY.z + 10 },
    { x: REFINERY.x, z: REFINERY.z },
  ], 8);
  createRoad([
    { x: REFINERY.x, z: REFINERY.z },
    { x: 12, z: -58 },
    { x: ELEVATOR.x - 10, z: ELEVATOR.z + 14 },
    { x: ELEVATOR.x, z: ELEVATOR.z },
  ], 7);

  // giant ether spire landmark
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0x0d5560, emissive: 0x2fd6ea, emissiveIntensity: 0.8,
    roughness: 0.2, metalness: 0.1, flatShading: true,
  });
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(rand(3, 7), rand(28, 62), 5), spireMat);
    s.position.set(-152 + rand(-10, 10), 12 + rand(0, 8), -72 + rand(-10, 10));
    s.rotation.z = rand(-0.16, 0.16);
    s.castShadow = true;
    scene.add(s);
  }
  const spireLight = new THREE.PointLight(0x2fd6ea, 220, 120, 2);
  spireLight.position.set(-152, 30, -72);
  scene.add(spireLight);

  /* --- Loot props: crates & crystal nodes ------------------------- */
  const crateGeo = new THREE.BoxGeometry(1.4, 1.0, 1.4);
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.8, metalness: 0.35 });
  const crateTrim = new THREE.MeshStandardMaterial({ color: 0xc2702a, roughness: 0.6, metalness: 0.4 });
  const crateLatch = new THREE.MeshBasicMaterial({ color: 0xffb057 });

  function createCrate(x, z, rotY = 0) {
    const y = terrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const body = new THREE.Mesh(crateGeo, crateMat);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    for (const dz of [-0.56, 0.56]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.1, 0.12), crateTrim);
      strip.position.set(0, 0.5, dz);
      group.add(strip);
    }
    for (const dx of [-0.56, 0.56]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.44), crateTrim);
      strip.position.set(dx, 0.5, 0);
      group.add(strip);
    }

    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.06), crateLatch);
    latch.position.set(0, 0.58, 0.71);
    group.add(latch);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 1.0, -0.7);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.16, 1.42), crateMat);
    lid.position.set(0, 0.08, 0.7);
    lid.castShadow = true;
    lidPivot.add(lid);
    group.add(lidPivot);

    scene.add(group);
    const crate = { group, lidPivot, x, z, y, opened: false, opening: 0 };
    crates.push(crate);
    return crate;
  }

  createCrate(HUB.x + 4.5, HUB.z + 8, 0.3);
  createCrate(HUB.x - 6, HUB.z + 11, -0.4);
  createCrate(HUB.x + 5.5, HUB.z - 15, 0.6);
  createCrate(HUB.x - 7, HUB.z - 11, -0.8);
  createCrate(HUB.x - 1.5, HUB.z + 14, 0.8);

  createCrate(rx + 9, rz + 10, 0.2);
  createCrate(rx - 10, rz + 9, -0.5);
  createCrate(rx + 11, rz - 2, 1.1);
  createCrate(rx - 6, rz + 13, 0.6);
  createCrate(12, 4, 0.3);
  createCrate(-6, -54, 1.2);
  createCrate(28, -72, -0.8);
  createCrate(ELEVATOR.x - 12, ELEVATOR.z + 6, 0.4);

  const shardGeo = new THREE.OctahedronGeometry(0.5, 0);
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0x0d5560,
    emissive: 0x3fe6ff,
    emissiveIntensity: 0.95,
    roughness: 0.15,
    metalness: 0.25,
    transparent: true,
    opacity: 0.94,
    flatShading: true,
  });

  function createCrystalNode(x, z, charges = 2, major = false) {
    const y = terrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const base = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), MAT.rockDark);
    base.scale.set(1.5, 0.55, 1.4);
    base.position.y = 0.1;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const shards = [];
    const n = randInt(4, 7);
    for (let i = 0; i < n; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat);
      const a = rand(0, TAU);
      const r = rand(0.1, 0.75);
      const s = rand(0.55, 1.25);
      shard.position.set(Math.cos(a) * r, rand(0.5, 1.5), Math.sin(a) * r);
      shard.rotation.set(rand(-0.35, 0.35), rand(0, TAU), rand(-0.35, 0.35));
      shard.scale.set(s * 0.62, s * 2.1, s * 0.62);
      shard.castShadow = true;
      group.add(shard);
      shards.push(shard);
    }

    if (major) {
      const light = new THREE.PointLight(0x3fe6ff, 55, 26, 2);
      light.position.set(0, 1.6, 0);
      group.add(light);
    }

    scene.add(group);
    const node = { group, x, z, y, charges, maxCharges: charges, shards, base };
    crystals.push(node);
    return node;
  }

  // refinery cluster
  createCrystalNode(rx + 6, rz + 14, 2, true);
  createCrystalNode(rx - 12, rz + 4, 2, false);
  createCrystalNode(rx + 13, rz + 5, 1, false);
  createCrystalNode(rx - 4, rz + 17, 2, false);
  createCrystalNode(rx - 14, rz - 2, 1, false);
  // field nodes
  createCrystalNode(8, -18, 2, false);
  createCrystalNode(9, 48, 1, false);
  createCrystalNode(-12, -62, 2, true);
  createCrystalNode(30, -40, 1, false);
  createCrystalNode(38, -84, 2, false);
  createCrystalNode(-38, -88, 1, false);
  createCrystalNode(20, -140, 2, false);
  createCrystalNode(-8, -120, 1, false);
  createCrystalNode(70, -58, 1, false);
  createCrystalNode(-64, -40, 2, false);

  /* --- Dust ------------------------------------------------------- */
  const dustCount = 1500;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = rand(-MAP_HALF, MAP_HALF);
    dustPos[i * 3 + 1] = rand(0.5, 55);
    dustPos[i * 3 + 2] = rand(-MAP_HALF, MAP_HALF);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffd2a0,
    size: 0.42,
    map: dustTexture(),
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.01,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* --- Animation -------------------------------------------------- */
  let stormMix = 0;
  let flash = 0;
  let flashTimer = rand(2, 5);
  const fogColor = new THREE.Color();
  const horizonBase = new THREE.Color(0xf0a76d);
  const horizonStorm = new THREE.Color(0x7a3a22);

  function update(dt, t, stormActive, playerPos) {
    // storm transition
    stormMix += ((stormActive ? 1 : 0) - stormMix) * Math.min(1, dt * 1.1);
    scene.fog.density = 0.0031 + stormMix * 0.0085;
    fogColor.copy(clearFog).lerp(stormFog, stormMix);
    scene.fog.color.copy(fogColor);
    skyMat.uniforms.storm.value = stormMix;
    sun.intensity = 3.3 - stormMix * 2.2;
    hemi.intensity = 1.45 - stormMix * 0.65;
    ambient.intensity = 0.36 + stormMix * 0.1;

    // lightning
    if (stormMix > 0.4) {
      flashTimer -= dt;
      if (flashTimer <= 0) {
        flash = 1;
        flashTimer = rand(2.2, 6.5);
      }
    }
    flash = Math.max(0, flash - dt * 5.5);
    ambient.intensity += flash * 1.8;
    skyMat.uniforms.horizonColor.value.copy(horizonBase).lerp(horizonStorm, stormMix);

    // dust drift
    dust.rotation.y += dt * (0.004 + stormMix * 0.02);
    dust.position.y = Math.sin(t * 0.15) * 1.5;

    // beacons
    for (const a of animated) {
      const k = 0.55 + Math.abs(Math.sin(t * a.speed)) * 0.45;
      a.mesh.scale.setScalar(k * 1.2);
    }
    beamMat.opacity = 0.08 + Math.sin(t * 1.6) * 0.02 + (lift.called ? 0.1 : 0);
    beamCore.material.opacity = 0.38 + Math.sin(t * 2.3) * 0.12 + (lift.called ? 0.3 : 0);
    liftLight.intensity = 160 + Math.sin(t * 2) * 30 + (lift.called ? 260 : 0);

    // shadow camera follows the player
    if (playerPos) {
      sun.target.position.set(playerPos.x, 0, playerPos.z);
      sun.position.set(playerPos.x + sunDir.x * 170, sunDir.y * 170, playerPos.z + sunDir.z * 170);
      sun.target.updateMatrixWorld();
    }
  }

  return {
    colliders, shootables, crates, crystals, lift,
    update,
    terrain,
    sun, sky, hemi,
    get stormMix() { return stormMix; },
  };
}
