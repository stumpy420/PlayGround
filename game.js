import * as THREE from './vendor/three.module.js';

/* ------------------------------------------------------------------ *
 * BELLINGHAM HEAT — a real-time 3D crime game
 * Three.js renderer, procedural city, driving, pursuit, missions.
 * ------------------------------------------------------------------ */

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a1b18, 0.0011);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.5, 4000);
camera.position.set(0, 20, 30);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(innerWidth, innerHeight);
});

/* ----------------------------- helpers ---------------------------- */
let seed = 20261123;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const pick = (a) => a[Math.floor(rnd() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const WORLD = 900;
const ROADS_X = [-615, -235, 145, 525];
const ROADS_Z = [-595, -205, 185, 575];
const BLOCK_X = [[-900, -660], [-570, -280], [-190, 100], [190, 480], [570, 900]];
const BLOCK_Z = [[-900, -640], [-550, -250], [-160, 140], [230, 530], [620, 900]];

const colliders = [];
const vehicles = [];
const policeCars = [];
const missionMarkers = [];
const flashLights = [];
const puddleMats = [];

const player = {
  pos: new THREE.Vector3(-607, 0, -238),
  heading: Math.PI,
  walk: 0,
  hp: 100,
  onFoot: true,
  car: null
};
let cash = 2450;
let wanted = 0;
let wantedTimer = 0;
let stage = 0;
let started = false;
let over = false;
let toastTimer = 0;
let clockTime = 0;
let lastHurt = -10000;
let audio = null;

const keys = {};
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (!keys[k] && k === 'e') toggleVehicle();
  keys[k] = true;
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

/* ------------------------------ lights ---------------------------- */
const hemi = new THREE.HemisphereLight(0x7fa3bb, 0x2f3a2e, 1.45);
scene.add(hemi);

const ambient = new THREE.AmbientLight(0x2c4242, 0.62);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0xb6d2ff, 2.25);
moon.position.set(-260, 380, -160);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -520;
moon.shadow.camera.right = 520;
moon.shadow.camera.top = 520;
moon.shadow.camera.bottom = -520;
moon.shadow.camera.far = 1200;
moon.shadow.bias = -0.0004;
scene.add(moon);
scene.add(moon.target);

const fill = new THREE.DirectionalLight(0xff8866, 0.55);
fill.position.set(300, 120, 300);
scene.add(fill);

// gradient night sky dome
{
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x03070d) },
      horizon: { value: new THREE.Color(0x142b2a) },
      warm: { value: new THREE.Color(0x4a2f1c) }
    },
    vertexShader: 'varying vec3 vDir; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vDir = normalize(wp.xyz); gl_Position = projectionMatrix*viewMatrix*wp; }',
    fragmentShader: 'varying vec3 vDir; uniform vec3 top; uniform vec3 horizon; uniform vec3 warm; void main(){ float h = vDir.y; vec3 c = mix(horizon, top, smoothstep(-0.03,0.7,h)); float band = pow(max(0.0, 1.0-abs(h)), 4.0); c += warm*band*mix(0.05,0.5,smoothstep(-0.9,-0.2,vDir.x)); gl_FragColor=vec4(c,1.0); }'
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), skyMat);
  scene.add(sky);
}

/* ---------------------------- materials --------------------------- */
const MAT = {
  asphalt: new THREE.MeshStandardMaterial({ color: 0x20282a, roughness: 0.28, metalness: 0.58 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0x3a4744, roughness: 0.9 }),
  curb: new THREE.MeshStandardMaterial({ color: 0x66736d, roughness: 0.8 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x1d2422, roughness: 0.85 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x39433f, roughness: 0.55, metalness: 0.65 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x22463a, roughness: 1 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x16272c, roughness: 0.16, metalness: 0.45 }),
  water: new THREE.MeshStandardMaterial({ color: 0x0a2531, roughness: 0.18, metalness: 0.85 }),
  white: new THREE.MeshStandardMaterial({ color: 0xdfe9e4, roughness: 0.6 })
};

/* --------------------------- base world --------------------------- */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1900, 1900), MAT.asphalt);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const water = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000), MAT.water);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.4;
scene.add(water);

// road strips + sidewalks
// asphalt grain
function makeAsphaltTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#697377'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 7000; i++) {
    const v = 70 + Math.floor(Math.random() * 55);
    g.fillStyle = `rgba(${v},${v + 5},${v + 7},${0.05 + Math.random() * 0.13})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.2, 1.2);
  }
  for (let i = 0; i < 20; i++) {
    g.fillStyle = `rgba(40,46,48,${0.04 + Math.random() * 0.06})`;
    g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 14, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const asphaltBase = makeAsphaltTexture();
const asphaltFine = makeAsphaltTexture();
const roadMatV = new THREE.MeshStandardMaterial({ map: asphaltBase, color: 0x788285, roughness: 0.34, metalness: 0.38 });
roadMatV.map.repeat.set(3.2, 52);
const roadMatH = new THREE.MeshStandardMaterial({ map: asphaltFine, color: 0x788285, roughness: 0.34, metalness: 0.38 });
roadMatH.map.repeat.set(52, 3.2);
const walkMat = new THREE.MeshStandardMaterial({ color: 0x424d48, roughness: 0.92 });
for (const x of ROADS_X) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(28, 1800), roadMatV);
  r.rotation.x = -Math.PI / 2; r.position.set(x, 0.012, 0); r.receiveShadow = true; scene.add(r);
}
for (const z of ROADS_Z) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(1800, 28), roadMatH);
  r.rotation.x = -Math.PI / 2; r.position.set(0, 0.013, z); r.receiveShadow = true; scene.add(r);
}
// sidewalk strips stop at every intersection instead of paving across it
{
  const strips = [];
  for (const x of ROADS_X) for (const bz of BLOCK_Z) {
    const d = bz[1] - bz[0], cz = (bz[0] + bz[1]) / 2;
    for (const s of [-1, 1]) strips.push([x + s * 29.5, cz, 31, d]);
  }
  for (const z of ROADS_Z) for (const bx of BLOCK_X) {
    const d = bx[1] - bx[0], cx = (bx[0] + bx[1]) / 2;
    for (const s of [-1, 1]) strips.push([cx, z + s * 29.5, d, 31]);
  }
  const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), walkMat, strips.length);
  const dummy = new THREE.Object3D();
  strips.forEach(([x, z, w, d], i) => {
    dummy.position.set(x, 0.02, z); dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.set(w, d, 1); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
  });
  inst.receiveShadow = true; scene.add(inst);
}

// lane dashes (instanced) - dense spacing reads as real road markings
{
  const dashGeo = new THREE.BoxGeometry(0.3, 0.03, 4.2);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0x6e6949, emissive: 0x131107, emissiveIntensity: 0.3, roughness: 0.95 });
  const inst = new THREE.InstancedMesh(dashGeo, dashMat, 4 * 80 + 4 * 80);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
  const s = new THREE.Vector3(1, 1, 1);
  let i = 0;
  for (const x of ROADS_X) for (let z = -860; z <= 860; z += 22) {
    m.compose(new THREE.Vector3(x, 0.035, z), q, s); inst.setMatrixAt(i++, m);
  }
  for (const z of ROADS_Z) for (let x = -860; x <= 860; x += 22) {
    m.compose(new THREE.Vector3(x, 0.035, z), qy, s); inst.setMatrixAt(i++, m);
  }
  inst.count = i;
  inst.receiveShadow = true;
  scene.add(inst);
}

// crosswalks are intentionally omitted; wet lane paint reads cleaner at night

/* ------------------------- city buildings ------------------------- */
function makeFacadeTextures() {
  const c = document.createElement('canvas');
  const e = document.createElement('canvas');
  c.width = e.width = 128; c.height = e.height = 256;
  const g = c.getContext('2d'), ge = e.getContext('2d');
  const walls = ['#3c4540', '#484138', '#35423f', '#4d453c', '#3a4441'];
  g.fillStyle = pick(walls); g.fillRect(0, 0, 128, 256);
  ge.fillStyle = '#000000'; ge.fillRect(0, 0, 128, 256);
  for (let y = 18; y < 246; y += 42) {
    for (let x = 12; x < 118; x += 38) {
      const lit = rnd() < 0.34;
      g.fillStyle = lit ? '#f2debc' : '#0c1314';
      g.fillRect(x, y, 23, 22);
      g.fillStyle = '#00000055'; g.fillRect(x, y + 18, 23, 4);
      if (lit) {
        ge.fillStyle = pick(['#ffc678', '#ffe2a6', '#7fbcc9', '#ff9d5e']);
        ge.fillRect(x, y, 23, 22);
      }
    }
    g.fillStyle = '#00000030'; g.fillRect(0, y + 30, 128, 3);
  }
  g.fillStyle = '#ffffff0d'; g.fillRect(0, 0, 5, 256);
  const map = new THREE.CanvasTexture(c);
  const emissive = new THREE.CanvasTexture(e);
  for (const t of [map, emissive]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
  }
  return { map, emissive };
}
const facadeBases = [makeFacadeTextures(), makeFacadeTextures(), makeFacadeTextures(), makeFacadeTextures()];

function neonTexture(text, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#070d0c'; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = color; g.lineWidth = 6; g.strokeRect(8, 8, 496, 112);
  g.font = 'italic 900 70px Impact, Arial';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 28;
  g.fillStyle = color; g.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const glowCanvas = document.createElement('canvas');
glowCanvas.width = glowCanvas.height = 128;
{
  const g = glowCanvas.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,240,205,1)');
  gr.addColorStop(0.25, 'rgba(255,214,150,.55)');
  gr.addColorStop(1, 'rgba(255,190,110,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
}
const glowTex = new THREE.CanvasTexture(glowCanvas);
const whiteCanvas = document.createElement('canvas');
whiteCanvas.width = whiteCanvas.height = 128;
{
  const g = whiteCanvas.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.3, 'rgba(255,255,255,.5)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
}
const whiteGlowTex = new THREE.CanvasTexture(whiteCanvas);
{
  const moonSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xdce8ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  moonSpr.position.set(-1500, 1150, -2300); moonSpr.scale.set(260, 260, 1); scene.add(moonSpr);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: whiteGlowTex, color: 0xe8f2ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.position.copy(moonSpr.position); core.scale.set(90, 90, 1); scene.add(core);
}
// stars
{
  const starPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const el = 0.12 + Math.random() * 1.25;
    const r = 2900;
    starPos[i * 3] = Math.cos(a) * Math.cos(el) * r;
    starPos[i * 3 + 1] = Math.sin(el) * r;
    starPos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xbfd7e8, size: 2.2, transparent: true, opacity: 0.75, fog: false, depthWrite: false })));
}

const signs = ['BAY CITY', 'MOTEL', 'NOODLES', 'DOCK 7', 'PAWN', 'RAIL & ALE', 'SEAMART'];
const signColors = ['#ff5f4a', '#59c7d8', '#ffcf5c', '#ff5fa2', '#7ef0a0'];
const neonMats = [];

function addBuilding(x, z, w, d, h) {
  const base = pick(facadeBases);
  const repX = Math.max(1, Math.round(d / 17)), repY = Math.max(1, Math.round(h / 17));
  const repZ = Math.max(1, Math.round(w / 17));
  const tx = base.map.clone(); tx.needsUpdate = true; tx.repeat.set(repX, repY);
  const tz = base.map.clone(); tz.needsUpdate = true; tz.repeat.set(repZ, repY);
  const ex = base.emissive.clone(); ex.needsUpdate = true; ex.repeat.set(repX, repY);
  const ez = base.emissive.clone(); ez.needsUpdate = true; ez.repeat.set(repZ, repY);
  const mx = new THREE.MeshStandardMaterial({ map: tx, emissiveMap: ex, emissive: 0xffffff, emissiveIntensity: 0.82, roughness: 0.82 });
  const mz = new THREE.MeshStandardMaterial({ map: tz, emissiveMap: ez, emissive: 0xffffff, emissiveIntensity: 0.82, roughness: 0.82 });
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, [mx, mx, MAT.roof, MAT.roof, mz, mz]);
  mesh.position.set(x, h / 2 + 0.18, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });

  if (h > 42) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.35, 4, d * 0.35), MAT.roof);
    top.position.set(x + (rnd() - 0.5) * w * 0.3, h + 2.2, z + (rnd() - 0.5) * d * 0.3);
    top.castShadow = true; scene.add(top);
    if (rnd() < 0.5) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 12, 5), MAT.metal);
      ant.position.set(x, h + 8, z); scene.add(ant);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3344 }));
      tip.position.set(x, h + 14, z); scene.add(tip);
    }
  }

  if (rnd() < 0.55) {
    const color = pick(signColors);
    const t = neonTexture(pick(signs), color);
    const sw = Math.min(w * 0.8, 14);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(sw, sw / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide }));
    const face = rnd() < 0.5;
    sign.position.set(face ? x + w / 2 + 0.3 : x, 5 + rnd() * 8, face ? z : z + d / 2 + 0.3);
    sign.rotation.y = face ? -Math.PI / 2 : 0;
    scene.add(sign);
    neonMats.push(sign.material);
  }
}

const treeDefs = [];
function addTree(x, z, s = 1) {
  treeDefs.push({ x, z, s });
}

let buildingCount = 0;
const blockWalks = [];
const blockCurbs = [];
BLOCK_X.forEach((bx, ix) => {
  BLOCK_Z.forEach((bz, iz) => {
    const w = bx[1] - bx[0], d = bz[1] - bz[0];
    const cx = (bx[0] + bx[1]) / 2, cz = (bz[0] + bz[1]) / 2;
    const pad = 10;
    blockWalks.push([cx, cz, w, d]);
    blockCurbs.push([cx, cz, w + 5, d + 5]);

    const cols = w > 270 ? 2 : 1;
    const innerW = w - pad * 2, innerD = d - pad * 2;
    const slotW = innerW / cols;
    for (let k = 0; k < cols; k++) {
      const bw = slotW * (cols === 1 ? (0.62 + rnd() * 0.2) : (0.72 + rnd() * 0.16));
      const bd = innerD * (0.6 + rnd() * 0.26);
      const edge = ix === 0 || ix === 4 || iz === 0 || iz === 4;
      const h = 16 + rnd() * (edge ? 44 : 78);
      const bxc = bx[0] + pad + slotW * (k + 0.5) + (rnd() - 0.5) * 6;
      const bzc = cz + (rnd() - 0.5) * (innerD - bd - 6) * 0.5;
      addBuilding(bxc, bzc, bw, bd, h);
      buildingCount++;
    }
    if (rnd() < 0.5) addTree(bx[0] + 12, bz[0] + 12, 0.85 + rnd() * 0.4);
    if (rnd() < 0.5) addTree(bx[1] - 12, bz[1] - 12, 0.85 + rnd() * 0.4);
  });
});

// block platforms and trees are instanced to keep draw calls low
{
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const dummy = new THREE.Object3D();
  const walks = new THREE.InstancedMesh(boxGeo, MAT.sidewalk, blockWalks.length);
  blockWalks.forEach(([x, z, w, d], i) => {
    dummy.position.set(x, 0.18, z); dummy.scale.set(w, 0.36, d); dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix(); walks.setMatrixAt(i, dummy.matrix);
  });
  walks.receiveShadow = true; scene.add(walks);
  const curbs = new THREE.InstancedMesh(boxGeo, MAT.curb, blockCurbs.length);
  blockCurbs.forEach(([x, z, w, d], i) => {
    dummy.position.set(x, 0.06, z); dummy.scale.set(w, 0.22, d); dummy.updateMatrix(); curbs.setMatrixAt(i, dummy.matrix);
  });
  curbs.receiveShadow = true; scene.add(curbs);

  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.45, 2.6, 6), MAT.trunk, treeDefs.length);
  treeDefs.forEach((t, i) => {
    dummy.position.set(t.x, 1.3 * t.s, t.z); dummy.scale.setScalar(t.s);
    dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
  });
  trunks.castShadow = true; scene.add(trunks);
  for (let layer = 0; layer < 3; layer++) {
    const cone = new THREE.InstancedMesh(
      new THREE.ConeGeometry(2.5 - layer * 0.55, 4 - layer * 0.5, 7), MAT.leaf, treeDefs.length
    );
    treeDefs.forEach((t, i) => {
      dummy.position.set(t.x, (2.6 + layer * 1.75) * t.s, t.z);
      dummy.scale.setScalar(t.s); dummy.updateMatrix(); cone.setMatrixAt(i, dummy.matrix);
    });
    cone.castShadow = true; scene.add(cone);
  }
}

/* --------------------------- street lights ------------------------ */
const lampGeo = new THREE.CylinderGeometry(0.13, 0.18, 8, 6);
const lampHeadGeo = new THREE.SphereGeometry(0.42, 8, 8);
const lampMat = new THREE.MeshStandardMaterial({ color: 0x2b3434, roughness: 0.5, metalness: 0.7 });
const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0 });
const coneMat = new THREE.MeshBasicMaterial({ color: 0xffcf8a, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const coneGeo = new THREE.ConeGeometry(5, 8, 10, 1, true);
const poolGeo = new THREE.PlaneGeometry(34, 34);
const poolMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffb877, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false });
const lampPositions = [];
function addLamp(x, z) {
  lampPositions.push(new THREE.Vector3(x, 0, z));
}
for (const x of ROADS_X) for (const z of ROADS_Z) {
  addLamp(x - 17, z - 17); addLamp(x + 17, z + 17);
}
for (const x of ROADS_X) {
  addLamp(x - 17, -800); addLamp(x + 17, 800);
}
for (const z of ROADS_Z) {
  addLamp(-800, z + 17); addLamp(800, z - 17);
}
// mid-block lamps keep the long streets readable
[-400, -10, 380].forEach((z, i) => ROADS_X.forEach((x, j) => addLamp(x + ((i + j) % 2 ? 54 : -54), z)));
[-425, -45, 335].forEach((x, i) => ROADS_Z.forEach((z, j) => addLamp(x, z + ((i + j) % 2 ? 54 : -54))));
// denser lamp spacing so blocks never fall fully dark
for (const x of ROADS_X) {
  let side = -1;
  for (let z = -700; z <= 700; z += 200) {
    if (ROADS_Z.some(rz => Math.abs(z - rz) < 80)) continue;
    addLamp(x + side * 17, z); side *= -1;
  }
}
for (const z of ROADS_Z) {
  let side = -1;
  for (let x = -700; x <= 700; x += 200) {
    if (ROADS_X.some(rx => Math.abs(x - rx) < 80)) continue;
    addLamp(x, z + side * 17); side *= -1;
  }
}

// all lamp geometry is instanced, and the glows are drawn as one point cloud
{
  const n = lampPositions.length;
  const dummy = new THREE.Object3D();
  const poles = new THREE.InstancedMesh(lampGeo, lampMat, n);
  const heads = new THREE.InstancedMesh(lampHeadGeo, lampGlowMat, n);
  const cones = new THREE.InstancedMesh(coneGeo, coneMat, n);
  const pools = new THREE.InstancedMesh(poolGeo, poolMat, n);
  lampPositions.forEach((p, i) => {
    dummy.position.set(p.x, 4, p.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
    dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p.x, 8.05, p.z);
    dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p.x, 4, p.z);
    dummy.updateMatrix(); cones.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p.x, 0.045, p.z); dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix(); pools.setMatrixAt(i, dummy.matrix);
  });
  scene.add(poles, heads, cones, pools);

  const glowPos = new Float32Array(n * 3);
  lampPositions.forEach((p, i) => { glowPos[i * 3] = p.x; glowPos[i * 3 + 1] = 8.05; glowPos[i * 3 + 2] = p.z; });
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
  scene.add(new THREE.Points(glowGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xffd7a0, size: 9, sizeAttenuation: true,
    transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending,
    depthWrite: false, fog: false
  })));
}

// A small pool of real point lights follows the nearest street lamps.
const lampLights = [];
for (let i = 0; i < 7; i++) {
  const l = new THREE.PointLight(0xffc98a, 170, 34, 1.8);
  l.position.set(0, 7.6, 0);
  scene.add(l);
  lampLights.push(l);
}
function updateLampLights() {
  const chosen = [];
  for (let n = 0; n < lampLights.length; n++) {
    let best = null, bd = Infinity;
    for (const p of lampPositions) {
      if (chosen.includes(p)) continue;
      const d = (p.x - player.pos.x) ** 2 + (p.z - player.pos.z) ** 2;
      if (d < bd) { bd = d; best = p; }
    }
    if (best) {
      chosen.push(best);
      lampLights[n].position.set(best.x, 7.6, best.z);
      lampLights[n].intensity = 150;
    }
  }
}

/* --------------------------- puddles ------------------------------ */
{
  const pgeo = new THREE.PlaneGeometry(18, 7);
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: pick([0x18343a, 0x2e1f33, 0x1d3330]),
      transparent: true, opacity: 0.65, roughness: 0.06, metalness: 0.95,
      emissive: pick([0x0d3540, 0x2b1026, 0x0e2b29]), emissiveIntensity: 0.7
    });
    const p = new THREE.Mesh(pgeo, mat);
    const onX = rnd() < 0.5;
    if (onX) p.position.set(pick(ROADS_X) + (rnd() - 0.5) * 55, 0.025, (rnd() - 0.5) * 1700);
    else p.position.set((rnd() - 0.5) * 1700, 0.025, pick(ROADS_Z) + (rnd() - 0.5) * 55);
    p.rotation.x = -Math.PI / 2;
    p.scale.set(0.6 + rnd() * 1.5, 0.5 + rnd(), 1);
    p.receiveShadow = true;
    scene.add(p); puddleMats.push(mat);
  }
  const reflGeo = new THREE.PlaneGeometry(26, 2.4);
  for (let i = 0; i < 22; i++) {
    const m = new THREE.MeshBasicMaterial({ color: pick([0xff5f4a, 0x59c7d8, 0xffcf5c, 0x9ee5e9]), transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false });
    const r = new THREE.Mesh(reflGeo, m);
    r.rotation.x = -Math.PI / 2;
    r.position.set(pick(ROADS_X) + (rnd() - 0.5) * 45, 0.03, (rnd() - 0.5) * 1600);
    scene.add(r);
  }
}

/* ------------------------ mountains / skyline -------------------- */
// distant skyline so the horizon never reads as an empty void
{
  const wins = document.createElement('canvas');
  wins.width = 64; wins.height = 128;
  const g = wins.getContext('2d');
  g.fillStyle = '#0b1518'; g.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 124; y += 8) for (let x = 3; x < 62; x += 8) {
    if (Math.random() < 0.3) {
      g.fillStyle = ['#ffcf8a', '#ffe6b8', '#8fc4cf'][Math.floor(Math.random() * 3)];
      g.fillRect(x, y, 3, 4);
    }
  }
  const wt = new THREE.CanvasTexture(wins);
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
  wt.colorSpace = THREE.SRGBColorSpace;
  const skyMat = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: wt, emissive: 0xffffff, emissiveIntensity: 0.9, color: 0x1a2528, roughness: 0.9 });
  const geos = [];
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 1150 + Math.random() * 750;
    const w = 60 + Math.random() * 130;
    const h = 60 + Math.random() * 220;
    const geo = new THREE.BoxGeometry(w, h, w);
    geo.translate(Math.cos(a) * rad, h / 2, Math.sin(a) * rad);
    geos.push(geo);
  }
  // merge identical-material boxes into one mesh via instancing
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), skyMat, geos.length);
  const dummy = new THREE.Object3D();
  geos.forEach((geo, i) => {
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    dummy.position.set((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2);
    dummy.scale.set(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  });
  scene.add(inst);
}

{
  // distant waterfront cranes
  const craneMat = new THREE.MeshStandardMaterial({ color: 0x1b2626, roughness: 0.8 });
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(2, 40, 2), craneMat); leg1.position.set(-8, 20, 0);
    const leg2 = leg1.clone(); leg2.position.x = 8;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(46, 2, 3), craneMat); beam.position.y = 40;
    g.add(leg1, leg2, beam);
    g.position.set(950 + i * 90, 0, -500 + i * 260);
    g.rotation.y = -0.4;
    scene.add(g);
  }
}

/* ------------------------- environment probe ---------------------- */
// A one-off probe of the night sky and city gives wet asphalt and car paint
// believable reflections without loading an HDRI.
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromScene(scene, 0.04, 0.5, 2200);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();
} catch (e) { /* reflections are a bonus, not a requirement */ }

/* ----------------------------- vehicles --------------------------- */
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x3a4147, roughness: 0.9, metalness: 0.2 });
const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff1c0 });
const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2b2b });
const copRed = new THREE.MeshBasicMaterial({ color: 0xff1e3a });
const copBlue = new THREE.MeshBasicMaterial({ color: 0x2b6bff });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a1f21, metalness: 0.55, roughness: 0.55 });

// merge simple boxes so each car costs a handful of draw calls instead of dozens
function mergeParts(parts) {
  const pos = [], nrm = [], uvs = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1);
  const v = new THREE.Vector3(), nm = new THREE.Matrix3();
  for (const part of parts) {
    const g = part.geo.index ? part.geo.toNonIndexed() : part.geo;
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    const pv = part.pos || [0, 0, 0];
    q.setFromEuler(new THREE.Euler(...(part.rot || [0, 0, 0])));
    m.compose(new THREE.Vector3(pv[0], pv[1], pv[2]), q, sc);
    nm.getNormalMatrix(m);
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m);
      pos.push(v.x, v.y, v.z);
      if (n) { v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nrm.push(v.x, v.y, v.z); }
      if (u) uvs.push(u.getX(i), u.getY(i));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (nrm.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  if (uvs.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return out;
}

const bodyGeo = new THREE.BoxGeometry(1.95, 0.62, 4.3);
const hoodGeo = new THREE.BoxGeometry(1.82, 0.2, 1.25);
const roofGeo = new THREE.BoxGeometry(1.56, 0.08, 1.78);
const cabinGeo = new THREE.BoxGeometry(1.5, 0.44, 1.86);
const bumperGeo = new THREE.BoxGeometry(1.9, 0.22, 0.26);
const lightGeo = new THREE.BoxGeometry(0.42, 0.18, 0.1);
const carShellGeo = mergeParts([
  { geo: bodyGeo, pos: [0, 0.68, 0] },
  { geo: hoodGeo, pos: [0, 0.92, 1.42] },
  { geo: roofGeo, pos: [0, 1.4, -0.22] }
]);
const carTrimGeo = mergeParts([
  { geo: bumperGeo, pos: [0, 0.44, 2.18] },
  { geo: bumperGeo, pos: [0, 0.44, -2.18] }
]);
const carGlassGeo = cabinGeo;
const carHeadGeo = mergeParts([
  { geo: lightGeo, pos: [-0.6, 0.78, 2.16] },
  { geo: lightGeo, pos: [0.6, 0.78, 2.16] }
]);
const carTailGeo = mergeParts([
  { geo: lightGeo, pos: [-0.6, 0.8, -2.16] },
  { geo: lightGeo, pos: [0.6, 0.8, -2.16] }
]);
const wheelInstGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 12);
const carWheelMatrices = [-1, 1].flatMap(sx => [-1.35, 1.35].map(sz => {
  const m = new THREE.Matrix4();
  m.compose(
    new THREE.Vector3(sx * 1.02, 0.38, sz),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)),
    new THREE.Vector3(1, 1, 1)
  );
  return m;
}));

function makeCar(color, cop = false) {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.34, metalness: 0.32 });

  const shell = new THREE.Mesh(carShellGeo, paint);
  shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
  const trim = new THREE.Mesh(carTrimGeo, trimMat);
  trim.castShadow = true; g.add(trim);
  const under = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.34, 3.9), trimMat);
  under.position.y = 0.25; under.castShadow = true; g.add(under);
  const cabin = new THREE.Mesh(carGlassGeo, MAT.glass);
  cabin.position.set(0, 1.16, -0.22); cabin.castShadow = true; g.add(cabin);
  const wheels = new THREE.InstancedMesh(wheelInstGeo, wheelMat, 4);
  carWheelMatrices.forEach((m, i) => wheels.setMatrixAt(i, m));
  wheels.castShadow = true; g.add(wheels);
  const head = new THREE.Mesh(carHeadGeo, headlightMat); g.add(head);
  const tail = new THREE.Mesh(carTailGeo, taillightMat); g.add(tail);

  if (cop) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.36), MAT.metal);
    bar.position.set(0, 1.53, -0.2); g.add(bar);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.34), copRed.clone());
    red.position.set(-0.42, 1.66, -0.2); g.add(red);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.34), copBlue.clone());
    blue.position.set(0.42, 1.66, -0.2); g.add(blue);
    const redGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: whiteGlowTex, color: 0xff2038, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    redGlow.position.set(-0.42, 1.78, -0.2); redGlow.scale.set(6, 6, 1); g.add(redGlow);
    const blueGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: whiteGlowTex, color: 0x2f6bff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    blueGlow.position.set(0.42, 1.78, -0.2); blueGlow.scale.set(6, 6, 1); g.add(blueGlow);
    flashLights.push({ red, blue, redGlow, blueGlow, phase: rnd() * 6 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.3, 2.6), new THREE.MeshStandardMaterial({ color: 0xe8eef0, roughness: 0.5 }));
    stripe.position.set(0, 0.62, 0.2); g.add(stripe);
  }
  scene.add(g);
  return g;
}

// painted light cone on the asphalt reads as headlights far better than a
// grazing spot light at this camera angle
let headlightCone = null;
{
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,.95)');
  v.addColorStop(0.1, 'rgba(255,255,255,.6)');
  v.addColorStop(0.35, 'rgba(255,255,255,.14)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, 128, 256);
  const h = g.createLinearGradient(0, 0, 128, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)');
  h.addColorStop(0.18, 'rgba(0,0,0,1)');
  h.addColorStop(0.82, 'rgba(0,0,0,1)');
  h.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = h; g.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(c);
  headlightCone = new THREE.MeshBasicMaterial({ map: t, color: 0xff9a38, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
}

function addHeadlights(group) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    -1.25, 0, 2.35, 1.25, 0, 2.35, 5.4, 0, 24, -5.4, 0, 24
  ], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  const beam = new THREE.Mesh(geo, headlightCone);
  beam.position.y = 0.08;
  beam.renderOrder = 2;
  group.add(beam);
  const fill = new THREE.PointLight(0xffb877, 12, 12, 1.7);
  fill.position.set(0, 0.6, 4.2);
  group.add(fill);
}

function spawnTraffic() {
  const palette = [0xc84e3e, 0xb9a363, 0x5f7c86, 0xd5cfba, 0x7c4f72, 0x3f6f5c];
  for (let i = 0; i < 16; i++) {
    const vertical = i % 2 === 0;
    const color = pick(palette);
    const mesh = makeCar(color);
    const road = vertical ? pick(ROADS_X) : pick(ROADS_Z);
    const dir = rnd() < 0.5 ? 1 : -1;
    const lane = road + dir * 7;
    const pos = new THREE.Vector3(
      vertical ? lane : (rnd() - 0.5) * 1600,
      0,
      vertical ? (rnd() - 0.5) * 1600 : lane
    );
    const heading = vertical ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    mesh.position.copy(pos);
    mesh.rotation.y = heading;
    const v = { mesh, pos, heading, speed: 10 + rnd() * 6, ai: true, vertical, dir, color, cop: false, radius: 2.2 };
    vehicles.push(v);
  }
}
spawnTraffic();

// parked player-adjacent car so the first step isn't a long walk
{
  const mesh = makeCar(0xe95b42);
  const p = new THREE.Vector3(-610, 0, -243);
  mesh.position.copy(p);
  mesh.rotation.y = Math.PI;
  const v = { mesh, pos: p, heading: Math.PI, speed: 0, ai: false, vertical: true, dir: -1, color: 0xe95b42, cop: false, radius: 2.2 };
  vehicles.push(v);
  addHeadlights(mesh);
}

// populate the opening street so the city feels occupied
{
  const parked = [
    [-625, -340, 0, 0x5f7c86], [-605, -430, Math.PI, 0xb9a363],
    [-625, -560, 0, 0x7c4f72], [-605, -680, Math.PI, 0x3f6f5c],
    [-625, -790, 0, 0xc84e3e]
  ];
  for (const [x, z, h, col] of parked) {
    const mesh = makeCar(col);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = h;
    vehicles.push({ mesh, pos: new THREE.Vector3(x, 0, z), heading: h, speed: 0, ai: false, vertical: true, dir: 1, color: col, cop: false, radius: 2.2 });
  }
  const moving = [
    [-608, -400, 0, 0xd5cfba, 0], [-622, -520, Math.PI, 0x3f6f5c, 0],
    [-608, -690, 0, 0x7c4f72, 0], [-622, -820, Math.PI, 0xb9a363, 0]
  ];
  for (const [x, z, h, col] of moving) {
    const mesh = makeCar(col);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = h;
    vehicles.push({ mesh, pos: new THREE.Vector3(x, 0, z), heading: h, speed: 9, ai: true, vertical: true, dir: h === 0 ? 1 : -1, color: col, cop: false, radius: 2.2 });
  }
}

/* ------------------------------ player ---------------------------- */
const avatar = new THREE.Group();
{
  const jacket = new THREE.MeshStandardMaterial({ color: 0x28323a, roughness: 0.8 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x151b20, roughness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x8e6146, roughness: 0.8 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 0.46), jacket);
  torso.position.y = 1.5; torso.castShadow = true; avatar.add(torso);
  const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.12, 0.42), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.78 }));
  scarf.position.y = 2.03; avatar.add(scarf);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.72, 0.28), new THREE.MeshStandardMaterial({ color: 0x1b2328, roughness: 0.9 }));
  pack.position.set(0, 1.62, -0.36); pack.castShadow = true; avatar.add(pack);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.04), new THREE.MeshStandardMaterial({ color: 0x0f1418, roughness: 1 }));
  strap.position.set(0.26, 1.55, 0.25); avatar.add(strap);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8), skin);
  neck.position.y = 2.04; avatar.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), skin);
  head.position.y = 2.24; head.castShadow = true; avatar.add(head);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x222e36, roughness: 0.85 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.258, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), capMat);
  cap.position.y = 2.26; cap.castShadow = true; avatar.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.75 }));
  brim.position.set(0, 2.26, 0.23); avatar.add(brim);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.32), pants);
  const legR = legL.clone();
  legL.position.set(-0.21, 0.55, 0); legR.position.set(0.21, 0.55, 0);
  legL.castShadow = legR.castShadow = true;
  avatar.add(legL, legR);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.26), jacket);
  const armR = armL.clone();
  armL.position.set(-0.55, 1.48, 0); armR.position.set(0.55, 1.48, 0);
  avatar.add(armL, armR);
  avatar.userData = { legL, legR, armL, armR };
}
avatar.position.copy(player.pos);
avatar.scale.setScalar(0.72);
scene.add(avatar);

// soft key light that keeps the player readable in dark streets
const playerLight = new THREE.PointLight(0xc4dae4, 12, 7.5, 1.9);
playerLight.position.set(0, 5, 0);
scene.add(playerLight);

/* ---------------------------- missions ---------------------------- */
const missionDefs = [
  { x: -615, z: -655, title: 'THE RENDEZVOUS', text: 'Reach the north waterfront' },
  { x: 525, z: -655, title: 'THE RIDE', text: 'Steal a ride & reach the docks' },
  { x: 525, z: 575, title: 'HEAT', text: 'Lose the patrols, reach the garage' },
  { x: -615, z: 575, title: 'THE DROP', text: 'Deliver the package at the waterfront' }
];
const objectiveBase = [
  'Find a car, then reach the north marker',
  'Reach the north-east docks',
  'Shake the patrols, reach the south garage',
  'Final drop at the south-west waterfront',
  'Night complete. You made it out.'
];

const ringGeo = new THREE.TorusGeometry(6, 0.22, 10, 48);
const markerMats = [];
const beamCanvas = document.createElement('canvas');
beamCanvas.width = 64; beamCanvas.height = 256;
{
  const g = beamCanvas.getContext('2d');
  const v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,.95)');
  v.addColorStop(0.3, 'rgba(255,255,255,.4)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v; g.fillRect(0, 0, 64, 256);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)');
  h.addColorStop(0.5, 'rgba(0,0,0,1)');
  h.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'destination-in';
  g.fillStyle = h; g.fillRect(0, 0, 64, 256);
}
const beamTex = new THREE.CanvasTexture(beamCanvas);
for (let i = 0; i < missionDefs.length; i++) {
  const d = missionDefs[i];
  const group = new THREE.Group();
  const color = i === 3 ? 0x6ef0a0 : 0xffd35c;
  const mat = new THREE.MeshBasicMaterial({ color });
  const ring = new THREE.Mesh(ringGeo, mat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.3;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.14, 8, 36), mat);
  ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.2;
  const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: beamTex, color, transparent: true, opacity: 0.34, depthWrite: false }));
  beam.position.y = 104;
  beam.scale.set(13, 208, 1);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.4, 0), new THREE.MeshBasicMaterial({ color }));
  gem.position.y = 13;
  group.add(ring, ring2, beam, gem);
  group.position.set(d.x, 0, d.z);
  scene.add(group);
  missionMarkers.push({ group, mat, d, phase: i * 1.3, beam, gem });
  markerMats.push(mat);
}

/* ------------------------------ rain ------------------------------ */
const RAIN_COUNT = 900;
const rainDrops = [];
const rainGeo = new THREE.BufferGeometry();
{
  const pos = new Float32Array(RAIN_COUNT * 6);
  for (let i = 0; i < RAIN_COUNT; i++) {
    const x = (Math.random() - 0.5) * 160;
    const y = Math.random() * 60;
    const z = (Math.random() - 0.5) * 160;
    const len = 0.8 + Math.random() * 1.2;
    rainDrops.push({ x, y, z, len, speed: 34 + Math.random() * 26 });
    const k = i * 6;
    pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    pos[k + 3] = x; pos[k + 4] = y + len; pos[k + 5] = z;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
}
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xa9c6d8, transparent: true, opacity: 0.34, depthWrite: false }));
scene.add(rain);

/* --------------------------- police lights ------------------------ */
function spawnPolice() {
  for (let i = 0; i < 3; i++) {
    const mesh = makeCar(0x2d3f63, true);
    const a = (i / 3) * Math.PI * 2;
    const p = new THREE.Vector3(player.pos.x + Math.cos(a) * 180, 0, player.pos.z + Math.sin(a) * 180);
    mesh.position.copy(p);
    const v = { mesh, pos: p, heading: 0, speed: 0, ai: false, cop: true, radius: 2.2 };
    policeCars.push(v);
  }
}

/* --------------------------- collisions -------------------------- */
function resolveCollision(obj, radius) {
  const p = obj.pos;
  for (const c of colliders) {
    const cx = clamp(p.x, c.x0, c.x1);
    const cz = clamp(p.z, c.z0, c.z1);
    let dx = p.x - cx, dz = p.z - cz;
    let d = Math.hypot(dx, dz);
    if (d < radius) {
      if (d < 0.001) {
        // inside the box, push toward the nearest edge
        const left = Math.abs(p.x - c.x0), right = Math.abs(c.x1 - p.x);
        const back = Math.abs(p.z - c.z0), front = Math.abs(c.z1 - p.z);
        const m = Math.min(left, right, back, front);
        if (m === left) p.x = c.x0 - radius;
        else if (m === right) p.x = c.x1 + radius;
        else if (m === back) p.z = c.z0 - radius;
        else p.z = c.z1 + radius;
      } else {
        const push = (radius - d) / d;
        p.x += dx * push; p.z += dz * push;
      }
      obj.speed = Math.min(obj.speed || 0, 4);
      obj.hit = true;
    }
  }
  p.x = clamp(p.x, -890, 890);
  p.z = clamp(p.z, -890, 890);
}

/* --------------------------- game state -------------------------- */
function showToast(t) {
  const el = document.getElementById('toast');
  el.textContent = t; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2100);
}
function setObjective() {
  const d = missionDefs[Math.min(stage, missionDefs.length - 1)];
  document.getElementById('objectiveTitle').textContent = stage >= missionDefs.length ? 'JOB COMPLETE' : 'JOB 0' + (stage + 1) + ' · ' + d.title;
  document.getElementById('objective').textContent = objectiveBase[Math.min(stage, 4)];
}
function toggleVehicle() {
  if (!started || over) return;
  if (player.onFoot) {
    let best = null, bd = 9;
    for (const v of vehicles) {
      const d = Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z);
      if (d < bd) { bd = d; best = v; }
    }
    if (best) {
      player.onFoot = false;
      player.car = best;
      best.ai = false;
      best.speed = 0;
      avatar.visible = false;
      showToast('VEHICLE ACQUIRED · ' + (best.color === 0xe95b42 ? 'RUST RUNNER' : 'STREET CAR'));
      setObjective();
    } else showToast('NO CAR CLOSE ENOUGH');
  } else if (player.car) {
    const c = player.car;
    player.onFoot = true;
    player.car = null;
    const side = c.heading + Math.PI / 2;
    player.pos.set(c.pos.x + Math.sin(side) * 3.2, 0, c.pos.z + Math.cos(side) * 3.2);
    avatar.position.copy(player.pos);
    avatar.visible = true;
    showToast('ON FOOT');
  }
}
window.toggleVehicle = toggleVehicle;

function endGame(title, sub, button) {
  over = true;
  const s = document.getElementById('start');
  s.querySelector('h1').innerHTML = title === 'NIGHT COMPLETE' ? 'NIGHT <span>COMPLETE</span>' : 'BUSTED';
  s.querySelector('p').textContent = sub;
  const b = s.querySelector('button');
  b.textContent = button;
  b.onclick = () => location.reload();
  s.querySelector('.badge').textContent = title === 'NIGHT COMPLETE' ? '$' + cash.toLocaleString() + ' BANKED' : 'THE CITY NEVER SLEEPS';
  document.querySelector('.hud').classList.remove('live');
  s.classList.remove('hidden');
}

function checkMission() {
  const d = missionDefs[Math.min(stage, 3)];
  if (Math.hypot(player.pos.x - d.x, player.pos.z - d.z) < 9) {
    if (stage === 0) { stage = 1; showToast('RENDEZVOUS CLEAR · GET TO THE DOCKS'); }
    else if (stage === 1) { stage = 2; wanted = Math.max(wanted, 2); if (!policeCars.length) spawnPolice(); showToast('HEAT RISING · LOSE THE PATROLS'); }
    else if (stage === 2) { stage = 3; wanted = Math.max(wanted, 3); if (!policeCars.length) spawnPolice(); showToast('GARAGE CLEAR · ONE LAST DROP'); }
    else if (stage === 3) {
      stage = 4; wanted = 0; cash += 5000;
      policeCars.forEach(p => scene.remove(p.mesh)); policeCars.length = 0;
      showToast('DELIVERY COMPLETE · +$5,000');
      setObjective();
      setTimeout(() => endGame('NIGHT COMPLETE', 'The package is gone. The money is clean. Bellingham belongs to somebody else tonight.', 'PLAY AGAIN'), 900);
    }
    setObjective();
  }
}

function damage(amount) {
  if (over) return;
  player.hp = Math.max(0, player.hp - amount);
  lastHurt = performance.now();
  if (player.hp <= 0) endGame('BUSTED', 'The patrol boxed you in. The package is gone, and so is your night.', 'TRY AGAIN');
}

/* ----------------------------- update ---------------------------- */
const touch = { x: 0, y: 0, go: false, brake: false, hand: false };
const touchMode = matchMedia('(pointer:coarse)').matches;
const tmpV = new THREE.Vector3();
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
let camInit = false;

function updatePlayer(dt) {
  const driving = !player.onFoot && player.car;
  if (driving) {
    const car = player.car;
    const throttle = (keys['w'] || keys['arrowup'] || touch.go) ? 1 : 0;
    const brake = (keys['s'] || keys['arrowdown'] || touch.brake) ? 1 : 0;
    let steer = 0;
    if (keys['a'] || keys['arrowleft']) steer -= 1;
    if (keys['d'] || keys['arrowright']) steer += 1;
    if (touch.x < -0.25) steer -= 1;
    if (touch.x > 0.25) steer += 1;

    car.speed += throttle * 34 * dt;
    car.speed -= brake * 44 * dt;
    if (keys[' '] || touch.hand) car.speed *= 1 - 1.4 * dt;
    car.speed *= 1 - 0.55 * dt;
    car.speed = clamp(car.speed, -16, 62);

    const turn = steer * (0.9 + Math.abs(car.speed) * 0.032) * (car.speed < 0 ? -1 : 1);
    car.heading += turn * dt;
    car.pos.x += Math.sin(car.heading) * car.speed * dt;
    car.pos.z += Math.cos(car.heading) * car.speed * dt;
    resolveCollision(car, 2.5);
    car.mesh.position.copy(car.pos);
    car.mesh.rotation.y = car.heading;

    if (audio) {
      const now = audio.ctx.currentTime;
      audio.osc.frequency.setTargetAtTime(42 + Math.abs(car.speed) * 2.3, now, 0.08);
      audio.eg.gain.setTargetAtTime(0.022 + Math.abs(car.speed) * 0.00035, now, 0.12);
    }

    player.pos.set(car.pos.x, 0, car.pos.z);
    player.heading = car.heading;

    // speed-based camera shake and FOV
    const spd = Math.abs(car.speed);
    camera.fov = lerp(camera.fov, 59 + spd * 0.18, 1 - Math.exp(-dt * 3));
    camera.updateProjectionMatrix();

    camTarget.set(
      car.pos.x - Math.sin(car.heading) * (10.8 + spd * 0.055),
      6.2 + spd * 0.022,
      car.pos.z - Math.cos(car.heading) * (10.8 + spd * 0.055)
    );
    lookTarget.set(car.pos.x + Math.sin(car.heading) * 11, 2.2, car.pos.z + Math.cos(car.heading) * 11);
  } else {
    if (audio) audio.eg.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15);
    let ix = 0, iz = 0;
    if (keys['w'] || keys['arrowup']) iz -= 1;
    if (keys['s'] || keys['arrowdown']) iz += 1;
    if (keys['a'] || keys['arrowleft']) ix -= 1;
    if (keys['d'] || keys['arrowright']) ix += 1;
    ix += touch.x;
    iz += touch.y;
    const len = Math.hypot(ix, iz);
    if (len > 0.1) {
      ix /= Math.max(1, len); iz /= Math.max(1, len);
      const speed = 7.4;
      player.pos.x += ix * speed * dt;
      player.pos.z += iz * speed * dt;
      player.heading = Math.atan2(ix, iz);
      player.walk += dt * 10;
      avatar.userData.legL.rotation.x = Math.sin(player.walk) * 0.6;
      avatar.userData.legR.rotation.x = -Math.sin(player.walk) * 0.6;
      avatar.userData.armL.rotation.x = -Math.sin(player.walk) * 0.45;
      avatar.userData.armR.rotation.x = Math.sin(player.walk) * 0.45;
    } else {
      for (const k of ['legL', 'legR', 'armL', 'armR']) avatar.userData[k].rotation.x *= 0.85;
    }
    resolveCollision(player, 0.75);
    avatar.position.copy(player.pos);
    avatar.rotation.y = player.heading;
    document.getElementById('speed').textContent = Math.round(len > 0.1 ? speedMph(7.4) : 0);

    camTarget.set(player.pos.x, 5.6, player.pos.z + 8.6);
    lookTarget.set(player.pos.x, 1.35, player.pos.z - 2.2);
    camera.fov = lerp(camera.fov, 52, 1 - Math.exp(-dt * 3));
    camera.updateProjectionMatrix();
  }
  if (driving) document.getElementById('speed').textContent = Math.round(Math.abs(player.car.speed) * 2.2);
  document.getElementById('mode').textContent = driving ? 'DRIVING' : 'ON FOOT';
}

function speedMph(u) { return u * 2.2; }

function updateTraffic(dt) {
  for (const v of vehicles) {
    if (!v.ai) continue;
    if (v.vertical) {
      v.pos.z += v.dir * v.speed * dt;
      if (v.pos.z > 900) v.pos.z = -900;
      if (v.pos.z < -900) v.pos.z = 900;
    } else {
      v.pos.x += v.dir * v.speed * dt;
      if (v.pos.x > 900) v.pos.x = -900;
      if (v.pos.x < -900) v.pos.x = 900;
    }
    v.mesh.position.copy(v.pos);
    v.mesh.rotation.y = v.heading;
    // simple mutual separation
    const dx = player.pos.x - v.pos.x, dz = player.pos.z - v.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 3.4) {
      v.pos.x -= dx * 0.02; v.pos.z -= dz * 0.02;
      if (!player.onFoot) { player.car.speed *= 0.985; wanted = Math.max(wanted, 1); }
    }
  }
}

function updatePolice(dt) {
  if (wanted <= 0) {
    if (policeCars.length) {
      for (const p of policeCars) scene.remove(p.mesh);
      policeCars.length = 0;
    }
    wantedTimer = 0;
    return;
  }
  if (!policeCars.length) spawnPolice();
  wantedTimer += dt;
  let near = false;
  for (const p of policeCars) {
    const dx = player.pos.x - p.pos.x, dz = player.pos.z - p.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 55) near = true;
    const desired = Math.atan2(dx, dz);
    let diff = ((desired - p.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    p.heading += clamp(diff, -2.1 * dt, 2.1 * dt);
    const targetSpeed = d > 22 ? 30 : 0;
    p.speed = lerp(p.speed, targetSpeed, 1 - Math.exp(-dt * 2));
    p.pos.x += Math.sin(p.heading) * p.speed * dt;
    p.pos.z += Math.cos(p.heading) * p.speed * dt;
    resolveCollision(p, 2.5);
    p.mesh.position.copy(p.pos);
    p.mesh.rotation.y = p.heading;
    if (d < 7) damage(16 * dt);
  }
  if (!near && wantedTimer > 16) {
    wanted = 0;
    showToast('HEAT LOST · STAY LOW');
    for (const p of policeCars) scene.remove(p.mesh);
    policeCars.length = 0;
    wantedTimer = 0;
  }
  if (near) wantedTimer = 0;
}

function animateWorld(dt) {
  const t = clockTime;
  for (const m of missionMarkers) {
    m.group.rotation.y += dt * 0.6;
    const bob = Math.sin(t * 2 + m.phase) * 0.6;
    m.group.position.y = bob;
    m.mat.opacity = 1;
    const active = m.d === missionDefs[Math.min(stage, 3)];
    m.group.visible = stage < 4;
    m.beam.visible = active;
    m.gem.visible = active;
    m.mat.color.setHex(active ? (stage === 3 ? 0x6ef0a0 : 0xffd35c) : 0x343a32);
    m.gem.rotation.y = t * 1.2;
    m.gem.position.y = 13 + Math.sin(t * 2 + m.phase) * 1.2;
    if (active) m.beam.material.opacity = 0.3 + Math.sin(t * 1.6) * 0.05;
  }
  for (const f of flashLights) {
    const on = Math.sin(t * 14 + f.phase) > 0;
    f.red.material.color.setHex(on ? 0xff1e3a : 0x3a0a10);
    f.blue.material.color.setHex(!on ? 0x2b6bff : 0x0a163a);
    if (f.redGlow) {
      f.redGlow.material.opacity = on ? 0.8 : 0.05;
      f.blueGlow.material.opacity = on ? 0.05 : 0.8;
    }
  }
  for (let i = 0; i < puddleMats.length; i++) puddleMats[i].emissiveIntensity = 0.5 + Math.sin(t * 1.4 + i) * 0.18;
  // rain
  const arr = rainGeo.attributes.position.array;
  for (let i = 0; i < RAIN_COUNT; i++) {
    const d = rainDrops[i];
    d.y -= d.speed * dt;
    if (d.y < 0) {
      d.y = 58;
      d.x = (Math.random() - 0.5) * 160;
      d.z = (Math.random() - 0.5) * 160;
    }
    const k = i * 6;
    arr[k] = d.x; arr[k + 1] = d.y; arr[k + 2] = d.z;
    arr[k + 3] = d.x; arr[k + 4] = d.y + d.len; arr[k + 5] = d.z;
  }
  rainGeo.attributes.position.needsUpdate = true;
  rain.position.set(player.pos.x, 0, player.pos.z);
}

function updateCamera(dt) {
  if (!camInit) { camera.position.copy(camTarget); camInit = true; }
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * 5));
  if (!player.onFoot && player.car) {
    const spd = Math.abs(player.car.speed);
    if (spd > 18) {
      const shake = Math.min(0.42, spd * 0.003);
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake * 0.5;
    }
  }
  const lx = lerp(camera.userData.lx ?? lookTarget.x, lookTarget.x, 1 - Math.exp(-dt * 8));
  const ly = lerp(camera.userData.ly ?? lookTarget.y, lookTarget.y, 1 - Math.exp(-dt * 8));
  const lz = lerp(camera.userData.lz ?? lookTarget.z, lookTarget.z, 1 - Math.exp(-dt * 8));
  camera.userData.lx = lx; camera.userData.ly = ly; camera.userData.lz = lz;
  camera.lookAt(lx, ly, lz);
}

/* ------------------------------- HUD ----------------------------- */
const mapCv = document.getElementById('map');
const mctx = mapCv.getContext('2d');
function drawMinimap() {
  const S = 190, world = 620, k = S / world;
  mctx.clearRect(0, 0, S, S);
  mctx.fillStyle = '#0d1a18'; mctx.fillRect(0, 0, S, S);
  mctx.save();
  mctx.translate(S / 2, S / 2);
  mctx.scale(k, k);
  mctx.translate(-player.pos.x, -player.pos.z);
  mctx.fillStyle = '#2a3f38';
  for (const bx of BLOCK_X) for (const bz of BLOCK_Z) {
    mctx.fillRect(bx[0], bz[0], bx[1] - bx[0], bz[1] - bz[0]);
  }
  mctx.fillStyle = '#1a2a25';
  for (const c of colliders) mctx.fillRect(c.x0, c.z0, c.x1 - c.x0, c.z1 - c.z0);
  mctx.lineWidth = 28; mctx.strokeStyle = '#485a53';
  for (const x of ROADS_X) { mctx.beginPath(); mctx.moveTo(x, -world / 2); mctx.lineTo(x, world / 2); mctx.stroke(); }
  for (const z of ROADS_Z) { mctx.beginPath(); mctx.moveTo(-world / 2, z); mctx.lineTo(world / 2, z); mctx.stroke(); }
  mctx.lineWidth = 6; mctx.strokeStyle = '#8b7b3f';
  const d = missionDefs[Math.min(stage, 3)];
  if (stage < 4) {
    mctx.save();
    mctx.shadowColor = '#ffd35c'; mctx.shadowBlur = 16;
    mctx.fillStyle = '#ffd35c';
    mctx.beginPath(); mctx.arc(d.x, d.z, 42, 0, Math.PI * 2); mctx.fill();
    mctx.restore();
  }
  for (const p of policeCars) {
    mctx.fillStyle = '#5b8cff'; mctx.beginPath(); mctx.arc(p.pos.x, p.pos.z, 14, 0, Math.PI * 2); mctx.fill();
  }
  mctx.restore();

  // player arrow
  const px = S / 2 + player.pos.x * k, pz = S / 2 + player.pos.z * k;
  mctx.save();
  mctx.translate(px, pz);
  mctx.rotate(-player.heading + Math.PI);
  mctx.fillStyle = '#ffffff';
  mctx.beginPath(); mctx.moveTo(0, -7); mctx.lineTo(5, 5); mctx.lineTo(0, 2); mctx.lineTo(-5, 5); mctx.closePath(); mctx.fill();
  mctx.restore();
  mctx.strokeStyle = '#ffffff66'; mctx.lineWidth = 2; mctx.beginPath(); mctx.arc(S / 2, S / 2, 86, 0, Math.PI * 2); mctx.stroke();
}

function updateHUD() {
  document.getElementById('cash').textContent = '$' + cash.toLocaleString();
  document.getElementById('wanted').textContent = '★'.repeat(wanted) + '☆'.repeat(5 - wanted);
  document.getElementById('health').style.width = player.hp + '%';
  if (stage < 4) {
    const d = missionDefs[stage];
    const meters = Math.round(Math.hypot(d.x - player.pos.x, d.z - player.pos.z));
    document.getElementById('objective').textContent = objectiveBase[stage] + ' · ' + meters + 'm';
  } else {
    document.getElementById('objective').textContent = objectiveBase[4];
  }
  let nearCar = false;
  if (player.onFoot && stage < 4) {
    for (const v of vehicles) if (Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) < 9) { nearCar = true; break; }
  }
  const promptEl = document.getElementById('prompt');
  if (nearCar) promptEl.textContent = touchMode ? 'TAP CAR TO STEAL' : 'E · STEAL THIS CAR';
  promptEl.classList.toggle('show', nearCar);
  document.getElementById('hurt').style.opacity = Math.max(0, 1 - (performance.now() - lastHurt) / 380) * 0.8;
  playerLight.position.set(player.pos.x, 3.6, player.pos.z + 1.2);
  playerLight.visible = player.onFoot;
}

/* ----------------------------- touch ----------------------------- */
const stick = document.getElementById('stick');
const knob = document.getElementById('knob');
let stickId = null;
function moveStick(e) {
  const r = stick.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width / 2);
  const y = e.clientY - (r.top + r.height / 2);
  const len = Math.hypot(x, y) || 1;
  const f = Math.min(len, 44) / len;
  touch.x = (x / len) * Math.min(1, len / 44);
  touch.y = (y / len) * Math.min(1, len / 44);
  knob.style.transform = `translate(${(x / len) * f}px,${(y / len) * f}px)`;
}
stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; stick.setPointerCapture(e.pointerId); moveStick(e); });
stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) moveStick(e); });
function endStick(e) { if (e.pointerId === stickId) { stickId = null; touch.x = 0; touch.y = 0; knob.style.transform = 'translate(0,0)'; } }
stick.addEventListener('pointerup', endStick);
stick.addEventListener('pointercancel', endStick);

function bindPedal(id, prop) {
  const el = document.getElementById(id);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); touch[prop] = true; el.classList.add('on'); });
  const off = () => { touch[prop] = false; el.classList.remove('on'); };
  el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
}
bindPedal('go', 'go'); bindPedal('brake', 'brake'); bindPedal('hand', 'hand');
const enterBtn = document.getElementById('enter');
enterBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); toggleVehicle(); });

/* ------------------------------ start ---------------------------- */
function startAudio() {
  if (audio) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.55;
    const rainSrc = ctx.createBufferSource(); rainSrc.buffer = buf; rainSrc.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300;
    const rainGain = ctx.createGain(); rainGain.gain.value = 0.032;
    rainSrc.connect(lp).connect(rainGain).connect(ctx.destination); rainSrc.start();

    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 52;
    const ef = ctx.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 420;
    const eg = ctx.createGain(); eg.gain.value = 0;
    osc.connect(ef).connect(eg).connect(ctx.destination); osc.start();

    audio = { ctx, osc, eg, rainGain };
  } catch (e) { /* audio is optional */ }
}

document.getElementById('play').addEventListener('click', () => {
  startAudio();
  if (audio && audio.ctx.state === 'suspended') audio.ctx.resume();
  document.getElementById('start').classList.add('hidden');
  document.querySelector('.hud').classList.add('live');
  started = true;
  setObjective();
  showToast('NIGHT 01 · PACIFIC NORTHWEST');
});
setObjective();
document.getElementById('loading').classList.add('gone');

/* --------------------------- adaptive quality -------------------- */
let qualityLevel = 1;
let perfAccum = 0, perfFrames = 0;
function autoQuality(dt) {
  if (qualityLevel === 0 || clockTime < 5) return;
  perfAccum += dt; perfFrames++;
  if (perfAccum < 3) return;
  const avg = perfAccum / perfFrames;
  perfAccum = 0; perfFrames = 0;
  if (avg > 1 / 30) {
    qualityLevel = 0;
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    scene.traverse(o => { if (o.isMesh || o.isInstancedMesh) o.castShadow = false; });
    moon.intensity = 1.4;
    rain.visible = false;
    showToast('GRAPHICS ADAPTED FOR SMOOTH PLAY');
  }
}

/* ------------------------------- loop ---------------------------- */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!started || over) { renderer.render(scene, camera); return; }
  clockTime += dt;
  updatePlayer(dt);
  updateTraffic(dt);
  updatePolice(dt);
  checkMission();
  animateWorld(dt);
  updateLampLights();
  autoQuality(dt);
  updateCamera(dt);
  updateHUD();
  drawMinimap();
  // keep moon shadow volume around the player
  moon.position.set(player.pos.x - 260, 380, player.pos.z - 160);
  moon.target.position.set(player.pos.x, 0, player.pos.z);
  moon.target.updateMatrixWorld();
  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

// expose a small debug/testing surface without changing gameplay
window.BH = { player, vehicles, policeCars, missionDefs, scene, camera, renderer, THREE, keys, touch, get stage() { return stage; }, get wanted() { return wanted; } };
