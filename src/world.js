import * as THREE from "../vendor/three.module.min.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function randHash(x, z, seed = 0) {
  const value = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

const VILLAGE = new THREE.Vector2(0, 4);
const LAKE = new THREE.Vector2(-45, 1);
const BARROW = new THREE.Vector2(33, -65);
const SPAWN = new THREE.Vector2(4.5, 39);

export const worldLayout = {
  village: { x: VILLAGE.x, z: VILLAGE.y },
  elder: { x: 3.5, z: 4.2 },
  shrine: { x: 4, z: 7 },
  barrow: { x: BARROW.x, z: BARROW.y },
  sunstone: { x: 32.6, z: -69.5 },
  spawn: { x: SPAWN.x, z: SPAWN.y },
  lake: { x: LAKE.x, z: LAKE.y },
};

function baseTerrainHeight(x, z) {
  let h =
    1.2 +
    Math.sin(x * 0.044 + 0.4) * 0.85 +
    Math.cos(z * 0.051 - 0.2) * 0.7 +
    Math.sin((x + z) * 0.09) * 0.28 +
    Math.sin(x * 0.017 - 1.1) * Math.cos(z * 0.023 + 0.8) * 1.55 +
    Math.sin(x * 0.115) * Math.cos(z * 0.1) * 0.2;

  const villageDist = Math.hypot(x - VILLAGE.x, z - VILLAGE.y);
  const villageWeight = 1 - smoothstep(15, 31, villageDist);
  const villageHeight = 1.22 + Math.sin(x * 0.22) * 0.04 + Math.cos(z * 0.18) * 0.035;
  h = mix(h, villageHeight, villageWeight);

  const lakeDist = Math.hypot(x - LAKE.x, z - LAKE.y);
  const lakeWeight = 1 - smoothstep(17, 34, lakeDist);
  const lakeFloor = -3.7 - 0.9 * (1 - lakeDist / 34);
  h = mix(h, lakeFloor, lakeWeight);

  const barrowDist = Math.hypot(x - BARROW.x, z - BARROW.y);
  const barrowWeight = 1 - smoothstep(14, 31, barrowDist);
  const barrowHeight = 3.7 + Math.sin(x * 0.12) * 0.12;
  h = mix(h, barrowHeight, barrowWeight);

  const radius = Math.hypot(x, z);
  const edge = Math.max(0, radius - 96);
  h += edge * 0.26 + edge * edge * 0.0085;
  h += Math.pow(Math.max(0, radius - 118), 1.32) * 0.032;

  return h;
}

export function terrainHeight(x, z) {
  let h = baseTerrainHeight(x, z);
  const pathDist = distanceToQuestPath(x, z);
  if (pathDist < 4.2) {
    const pathWeight = 1 - smoothstep(1.5, 4.2, pathDist);
    h = mix(h, h * 0.72 + 0.42, pathWeight * 0.42);
  }
  return h;
}

let cachedPath = null;
function questPathCurve() {
  if (cachedPath) return cachedPath;
  const points = [
    new THREE.Vector3(7, 0, 48),
    new THREE.Vector3(4, 0, 35),
    new THREE.Vector3(1, 0, 22),
    new THREE.Vector3(0, 0, 12),
    new THREE.Vector3(2, 0, 5),
    new THREE.Vector3(7, 0, -3),
    new THREE.Vector3(12, 0, -14),
    new THREE.Vector3(19, 0, -29),
    new THREE.Vector3(24, 0, -43),
    new THREE.Vector3(30, 0, -55),
    new THREE.Vector3(32.7, 0, -62),
  ];
  for (const point of points) point.y = baseTerrainHeight(point.x, point.z);
  cachedPath = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
  return cachedPath;
}

let pathSamples = null;
function pathSamplePoints() {
  if (!pathSamples) pathSamples = questPathCurve().getPoints(260);
  return pathSamples;
}

export function distanceToQuestPath(x, z) {
  const samples = pathSamplePoints();
  let best = Infinity;
  for (let i = 0; i < samples.length; i += 3) {
    const dx = x - samples[i].x;
    const dz = z - samples[i].z;
    const d = dx * dx + dz * dz;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

function canvasTexture(size, draw, colorSpace = THREE.SRGBColorSpace) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
  return texture;
}

function softGlowTexture() {
  return canvasTexture(256, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(0.7, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

function snowflakeTexture() {
  return canvasTexture(64, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(240,251,255,0.8)");
    g.addColorStop(0.7, "rgba(220,245,255,0.12)");
    g.addColorStop(1, "rgba(220,245,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

function smokeTexture() {
  return canvasTexture(128, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(200,214,222,0.2)");
    g.addColorStop(0.45, "rgba(170,190,200,0.11)");
    g.addColorStop(1, "rgba(150,175,188,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

function moonTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const c = size / 2;
    const glow = ctx.createRadialGradient(c, c, 16, c, c, c);
    glow.addColorStop(0, "rgba(245,250,255,0.95)");
    glow.addColorStop(0.23, "rgba(210,236,249,0.75)");
    glow.addColorStop(0.48, "rgba(154,205,224,0.16)");
    glow.addColorStop(1, "rgba(130,190,215,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(c, c, 38, 0, TAU);
    ctx.fillStyle = "#e9f2f5";
    ctx.fill();
    const craters = [
      [0.42, 0.43, 7, 0.16], [0.58, 0.38, 4, 0.13], [0.56, 0.58, 9, 0.11],
      [0.38, 0.62, 5, 0.1], [0.65, 0.5, 3, 0.12],
    ];
    for (const [x, y, r, a] of craters) {
      ctx.beginPath();
      ctx.arc(size * x, size * y, r, 0, TAU);
      ctx.fillStyle = `rgba(107,137,153,${a})`;
      ctx.fill();
    }
  });
}

function bannerTexture() {
  return canvasTexture(256, (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#17313a");
    grad.addColorStop(1, "#0a1a24");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(231,189,119,0.72)";
    ctx.lineWidth = 5;
    ctx.strokeRect(14, 14, size - 28, size - 28);
    ctx.strokeStyle = "rgba(231,189,119,0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, 72);
    ctx.lineTo(size - 26, 72);
    ctx.stroke();
    ctx.fillStyle = "#d9b270";
    ctx.beginPath();
    ctx.ellipse(size / 2, 145, 32, 30, 0, 0, TAU);
    ctx.fill();
    for (const [x, y, rx, ry, rot] of [[-38, -33, 13, 18, -0.3], [-15, -48, 12, 17, -0.1], [14, -48, 12, 17, 0.1], [37, -33, 13, 18, 0.3]]) {
      ctx.beginPath();
      ctx.ellipse(size / 2 + x, 145 + y, rx, ry, rot, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(9,20,28,0.72)";
    ctx.font = "700 15px Cinzel, serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "3px";
    ctx.fillText("NINE LIVES", size / 2, 221);
  });
}

function runeTexture() {
  return canvasTexture(256, (ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(141,235,235,0.9)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(100,235,230,0.9)";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(58, 40);
    ctx.lineTo(58, 216);
    ctx.lineTo(105, 170);
    ctx.lineTo(128, 208);
    ctx.lineTo(151, 170);
    ctx.lineTo(198, 216);
    ctx.lineTo(198, 40);
    ctx.moveTo(80, 82);
    ctx.lineTo(176, 82);
    ctx.moveTo(100, 122);
    ctx.lineTo(156, 122);
    ctx.stroke();
  });
}

function snowCapTexture() {
  return canvasTexture(128, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(238,250,253,0.9)");
    g.addColorStop(0.5, "rgba(212,234,242,0.4)");
    g.addColorStop(1, "rgba(190,220,230,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

export function createWorld(scene) {
  const world = new THREE.Group();
  world.name = "Whiskerhold";
  scene.add(world);

  const glowTexture = softGlowTexture();
  const flakeTexture = snowflakeTexture();
  const smokeMap = smokeTexture();
  const runeMap = runeTexture();
  const animations = [];
  const smokePuffs = [];
  const mistPuffs = [];
  const colliders = [];
  const riverGlints = [];
  let auroraLevel = 1;

  // ------------------------------------------------------------------------
  // Sky, stars and moon
  // ------------------------------------------------------------------------
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAurora: { value: 1 },
      uMoonDir: { value: new THREE.Vector3(-0.42, 0.55, -0.72).normalize() },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uAurora;
      uniform vec3 uMoonDir;
      varying vec3 vWorldPosition;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 dir = normalize(vWorldPosition);
        float up = clamp(dir.y, 0.0, 1.0);
        vec3 top = vec3(0.006, 0.014, 0.038);
        vec3 mid = vec3(0.035, 0.075, 0.125);
        vec3 horizon = vec3(0.12, 0.185, 0.225);
        vec3 col = mix(horizon, mid, smoothstep(0.0, 0.16, up));
        col = mix(col, top, smoothstep(0.14, 0.72, up));

        float horizonGlow = pow(1.0 - up, 10.0);
        col += vec3(0.055, 0.15, 0.17) * horizonGlow;

        float auroraMask = smoothstep(0.015, 0.13, dir.y) * (1.0 - smoothstep(0.56, 0.86, dir.y));
        vec2 p = dir.xz / max(dir.y + 0.26, 0.1);
        float n = noise(p * 0.96 + vec2(uTime * 0.011, uTime * 0.003));
        float band = sin(p.x * 1.42 + p.y * 0.52 + uTime * 0.045 + n * 2.8);
        float ribbon = smoothstep(0.15, 0.95, band * 0.5 + 0.5);
        ribbon *= 0.52 + 0.48 * sin(p.y * 2.0 - uTime * 0.07 + n * 3.4);
        vec3 auroraColor = mix(vec3(0.045, 0.72, 0.58), vec3(0.29, 0.14, 0.72), 0.5 + 0.5 * sin(p.y * 1.15 + n * 2.2));
        col += auroraColor * ribbon * auroraMask * 0.62 * uAurora;

        float secondBand = sin(p.x * 2.7 - p.y * 0.9 - uTime * 0.035 + n * 1.6);
        float second = smoothstep(0.6, 1.0, secondBand * 0.5 + 0.5) * auroraMask;
        col += vec3(0.07, 0.48, 0.36) * second * 0.22 * uAurora;

        float moonGlow = max(dot(dir, uMoonDir), 0.0);
        col += vec3(0.58, 0.72, 0.85) * pow(moonGlow, 45.0) * 0.55;
        col += vec3(0.11, 0.16, 0.21) * pow(moonGlow, 5.0) * 0.2;

        col = mix(col, vec3(0.018, 0.035, 0.055), smoothstep(0.0, -0.34, dir.y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(290, 48, 28), skyMaterial);
  sky.frustumCulled = false;
  world.add(sky);

  const starPositions = [];
  for (let i = 0; i < 620; i += 1) {
    const theta = Math.random() * TAU;
    const phi = Math.acos(mix(0.06, 0.98, Math.random()));
    const radius = 255;
    starPositions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xdcebf2,
    size: 1.05,
    map: glowTexture,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  world.add(stars);

  const moonMap = moonTexture();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({
    map: moonMap,
    color: 0xcde6f4,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  moon.position.set(-115, 150, -198);
  moon.scale.set(62, 62, 1);
  world.add(moon);
  const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x9fd8ec,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  moonHalo.position.copy(moon.position).multiplyScalar(1.01);
  moonHalo.scale.set(145, 145, 1);
  world.add(moonHalo);

  // ------------------------------------------------------------------------
  // Lights
  // ------------------------------------------------------------------------
  const hemisphere = new THREE.HemisphereLight(0x9fcbe2, 0x141c25, 1.15);
  scene.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(0xbed9ff, 2.05);
  moonLight.position.set(-38, 62, -34);
  moonLight.target.position.set(0, 0, 0);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -49;
  moonLight.shadow.camera.right = 49;
  moonLight.shadow.camera.top = 54;
  moonLight.shadow.camera.bottom = -54;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 160;
  moonLight.shadow.bias = -0.0007;
  moonLight.shadow.normalBias = 0.035;
  scene.add(moonLight, moonLight.target);

  const rimLight = new THREE.DirectionalLight(0x4e7f8d, 0.55);
  rimLight.position.set(35, 23, 40);
  scene.add(rimLight);

  // ------------------------------------------------------------------------
  // Terrain
  // ------------------------------------------------------------------------
  const size = 330;
  const segments = 172;
  const groundGeometry = new THREE.PlaneGeometry(size, size, segments, segments);
  groundGeometry.rotateX(-Math.PI / 2);
  const groundPosition = groundGeometry.attributes.position;
  const colors = [];
  const snowA = new THREE.Color(0xdce9ed);
  const snowB = new THREE.Color(0xc0d5dc);
  const snowShadow = new THREE.Color(0x94adb8);
  const rock = new THREE.Color(0x5a6570);
  const darkRock = new THREE.Color(0x3c4650);
  const underwater = new THREE.Color(0x354b50);
  for (let i = 0; i < groundPosition.count; i += 1) {
    const x = groundPosition.getX(i);
    const z = groundPosition.getZ(i);
    const y = terrainHeight(x, z);
    groundPosition.setY(i, y);
    const slope = Math.min(1, Math.abs(terrainHeight(x + 0.8, z) - y) + Math.abs(terrainHeight(x, z + 0.8) - y));
    const variation = randHash(x * 0.13, z * 0.13, 3);
    let color = snowA.clone().lerp(snowB, variation);
    if (y < -2.1) color = underwater.clone().lerp(darkRock, clamp((-y - 2) / 4, 0, 1));
    else if (slope > 0.68) color = rock.clone().lerp(darkRock, clamp((slope - 0.68) / 1.4, 0, 1));
    else if (slope > 0.25) color.lerp(snowShadow, smoothstep(0.25, 0.68, slope));
    const highSnow = smoothstep(5, 28, y) * 0.6;
    color.lerp(snowA, highSnow);
    color.multiplyScalar(0.9 + variation * 0.13);
    colors.push(color.r, color.g, color.b);
  }
  groundGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  groundGeometry.computeVertexNormals();
  const groundMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.98,
    metalness: 0,
    flatShading: true,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;
  world.add(ground);

  // ------------------------------------------------------------------------
  // Lake
  // ------------------------------------------------------------------------
  const waterNoise = canvasTexture(128, (ctx, s) => {
    const image = ctx.createImageData(s, s);
    for (let y = 0; y < s; y += 1) {
      for (let x = 0; x < s; x += 1) {
        const v = 128 + Math.sin(x * 0.25 + Math.cos(y * 0.18) * 2) * 26 + Math.sin(y * 0.42) * 17 + (Math.random() - 0.5) * 18;
        const i = (y * s + x) * 4;
        image.data[i] = v;
        image.data[i + 1] = v;
        image.data[i + 2] = v;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }, THREE.NoColorSpace);
  waterNoise.wrapS = waterNoise.wrapT = THREE.RepeatWrapping;
  waterNoise.repeat.set(32, 32);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x143d4b,
    roughness: 0.22,
    metalness: 0.12,
    transparent: true,
    opacity: 0.87,
    bumpMap: waterNoise,
    bumpScale: 0.22,
    emissive: 0x03161d,
    emissiveIntensity: 0.7,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(340, 340), waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.88;
  water.receiveShadow = true;
  world.add(water);

  // Ice floes on the lake.
  const iceMaterial = new THREE.MeshStandardMaterial({ color: 0xd4e9ee, roughness: 0.6, metalness: 0, transparent: true, opacity: 0.9 });
  const iceGroup = new THREE.Group();
  for (let i = 0; i < 17; i += 1) {
    const angle = Math.random() * TAU;
    const r = 5 + Math.random() * 21;
    const x = LAKE.x + Math.cos(angle) * r;
    const z = LAKE.y + Math.sin(angle) * r;
    const radius = 0.7 + Math.random() * 2.2;
    const geo = new THREE.CylinderGeometry(radius, radius * 0.9, 0.11, 7);
    const floe = new THREE.Mesh(geo, iceMaterial);
    floe.position.set(x, -1.79, z);
    floe.rotation.y = Math.random() * TAU;
    floe.scale.z = 0.6 + Math.random() * 0.8;
    iceGroup.add(floe);
  }
  world.add(iceGroup);

  // ------------------------------------------------------------------------
  // Trees
  // ------------------------------------------------------------------------
  const treeCount = 255;
  const treeData = [];
  const occupied = (x, z) => {
    if (Math.hypot(x - VILLAGE.x, z - VILLAGE.y) < 23) return true;
    if (Math.hypot(x - BARROW.x, z - BARROW.y) < 21) return true;
    if (Math.hypot(x - LAKE.x, z - LAKE.y) < 25) return true;
    if (distanceToQuestPath(x, z) < 4.1) return true;
    return false;
  };
  for (let i = 0; i < treeCount; i += 1) {
    let x = 0;
    let z = 0;
    let tries = 0;
    do {
      const angle = Math.random() * TAU;
      const radius = 18 + Math.sqrt(Math.random()) * 108;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      tries += 1;
    } while (tries < 30 && occupied(x, z));
    if (tries >= 30) continue;
    const h = terrainHeight(x, z);
    if (h < -0.7) continue;
    const scale = 0.65 + Math.random() * 1.15;
    treeData.push({ x, z, y: h, scale, rot: Math.random() * TAU, tilt: (Math.random() - 0.5) * 0.08, tint: Math.random() });
  }

  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.23, 2.2, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2b24, roughness: 1, flatShading: true });
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeData.length);
  trunkMesh.receiveShadow = true;
  const foliageGeo = new THREE.ConeGeometry(1.65, 3.2, 7, 1);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true, vertexColors: false });
  const layers = [
    { y: 2.0, scale: 1.0, h: 3.4, color: 0x203b3c },
    { y: 3.35, scale: 0.77, h: 2.8, color: 0x294547 },
    { y: 4.55, scale: 0.52, h: 2.2, color: 0x345457 },
  ];
  const layerMeshes = layers.map((layer) => {
    const mesh = new THREE.InstancedMesh(foliageGeo, foliageMat.clone(), treeData.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.receiveShadow = true;
    return mesh;
  });
  const snowGeo = new THREE.ConeGeometry(1.68, 1.1, 7, 1);
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xdbe9ee, roughness: 0.86, flatShading: true });
  const snowLayers = new THREE.InstancedMesh(snowGeo, snowMat, treeData.length);
  snowLayers.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tintColor = new THREE.Color();
  treeData.forEach((tree, index) => {
    dummy.position.set(tree.x, tree.y + tree.scale * 1.1, tree.z);
    dummy.rotation.set(tree.tilt, tree.rot, tree.tilt * 0.5);
    dummy.scale.set(tree.scale, tree.scale, tree.scale);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(index, dummy.matrix);
    layers.forEach((layer, layerIndex) => {
      dummy.position.set(tree.x, tree.y + tree.scale * layer.y, tree.z);
      dummy.rotation.set(tree.tilt, tree.rot + layerIndex * 0.37, tree.tilt * 0.5);
      dummy.scale.set(tree.scale * layer.scale, tree.scale, tree.scale * layer.scale);
      dummy.updateMatrix();
      layerMeshes[layerIndex].setMatrixAt(index, dummy.matrix);
      tintColor.setHex(layer.color).offsetHSL((tree.tint - 0.5) * 0.015, 0, (tree.tint - 0.5) * 0.08);
      layerMeshes[layerIndex].setColorAt(index, tintColor);
    });
    dummy.position.set(tree.x, tree.y + tree.scale * 5.15, tree.z);
    dummy.rotation.set(tree.tilt, tree.rot + 0.8, tree.tilt * 0.5);
    dummy.scale.set(tree.scale * 0.54, tree.scale * 0.55, tree.scale * 0.54);
    dummy.updateMatrix();
    snowLayers.setMatrixAt(index, dummy.matrix);
  });
  trunkMesh.instanceMatrix.needsUpdate = true;
  layerMeshes.forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });
  snowLayers.instanceMatrix.needsUpdate = true;
  world.add(trunkMesh, ...layerMeshes, snowLayers);

  // Small snow-dusted boulders.
  const rockGeo = new THREE.DodecahedronGeometry(0.6, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x4f5a63, roughness: 1, flatShading: true });
  const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, 110);
  rockMesh.receiveShadow = true;
  let rockIndex = 0;
  for (let i = 0; i < 240 && rockIndex < 110; i += 1) {
    const angle = Math.random() * TAU;
    const radius = 12 + Math.random() * 117;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (occupied(x, z)) continue;
    const y = terrainHeight(x, z);
    if (y < -1.4) continue;
    const s = 0.4 + Math.random() * 1.7;
    dummy.position.set(x, y + s * 0.28, z);
    dummy.rotation.set(Math.random(), Math.random() * TAU, Math.random());
    dummy.scale.set(s, s * (0.55 + Math.random() * 0.5), s);
    dummy.updateMatrix();
    rockMesh.setMatrixAt(rockIndex, dummy.matrix);
    rockIndex += 1;
  }
  rockMesh.count = rockIndex;
  rockMesh.instanceMatrix.needsUpdate = true;
  world.add(rockMesh);

  // ------------------------------------------------------------------------
  // Path ribbon
  // ------------------------------------------------------------------------
  const curve = questPathCurve();
  const pathPoints = curve.getPoints(240);
  const pathPositions = [];
  const pathUvs = [];
  const pathColors = [];
  for (let i = 0; i < pathPoints.length; i += 1) {
    const point = pathPoints[i];
    const next = pathPoints[Math.min(i + 1, pathPoints.length - 1)];
    const prev = pathPoints[Math.max(i - 1, 0)];
    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len;
    const nz = tx / len;
    const width = 1.15 + Math.sin(i * 0.29) * 0.18;
    for (const side of [-1, 1]) {
      const px = point.x + nx * width * side;
      const pz = point.z + nz * width * side;
      pathPositions.push(px, terrainHeight(px, pz) + 0.055, pz);
      pathUvs.push((side + 1) * 0.5, i / pathPoints.length);
      const shade = 0.8 + randHash(px, pz, 9) * 0.2;
      pathColors.push(0.34 * shade, 0.35 * shade, 0.33 * shade);
    }
  }
  const pathIndices = [];
  for (let i = 0; i < pathPoints.length - 1; i += 1) {
    const a = i * 2;
    pathIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const pathGeo = new THREE.BufferGeometry();
  pathGeo.setAttribute("position", new THREE.Float32BufferAttribute(pathPositions, 3));
  pathGeo.setAttribute("uv", new THREE.Float32BufferAttribute(pathUvs, 2));
  pathGeo.setAttribute("color", new THREE.Float32BufferAttribute(pathColors, 3));
  pathGeo.setIndex(pathIndices);
  pathGeo.computeVertexNormals();
  const pathMesh = new THREE.Mesh(pathGeo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  }));
  pathMesh.receiveShadow = true;
  world.add(pathMesh);

  // Lantern posts along the road.
  const lanternGroup = new THREE.Group();
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0x29211b, roughness: 1 });
  const lanternFlameMat = new THREE.MeshBasicMaterial({ color: 0xffc373, toneMapped: false });
  for (let i = 0; i < 9; i += 1) {
    const t = 0.055 + i * 0.102;
    const point = curve.getPointAt(clamp(t, 0, 1));
    const tangent = curve.getTangentAt(clamp(t, 0, 1));
    const side = i % 2 === 0 ? 1 : -1;
    const x = point.x + tangent.z * 2.9 * side;
    const z = point.z - tangent.x * 2.9 * side;
    const y = terrainHeight(x, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.3, 5), lanternMat);
    pole.position.set(x, y + 1.15, z);
    pole.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.36), lanternMat);
    head.position.set(x, y + 2.33, z);
    head.castShadow = true;
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), lanternFlameMat);
    flame.position.set(x, y + 2.32, z);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffc06c,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    halo.position.copy(flame.position);
    halo.scale.set(2.8, 2.8, 1);
    lanternGroup.add(pole, head, flame, halo);
  }
  world.add(lanternGroup);

  // ------------------------------------------------------------------------
  // Village
  // ------------------------------------------------------------------------
  const wood = new THREE.MeshStandardMaterial({ color: 0x4b3729, roughness: 0.94, flatShading: true });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x2b211c, roughness: 0.96, flatShading: true });
  const stone = new THREE.MeshStandardMaterial({ color: 0x5c625f, roughness: 0.92, flatShading: true });
  const snowRoof = new THREE.MeshStandardMaterial({ color: 0xdbe7e9, roughness: 0.82, flatShading: true });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffbd73,
    emissive: 0xff9f46,
    emissiveIntensity: 2.4,
    roughness: 0.4,
  });

  const village = new THREE.Group();
  world.add(village);

  function addHouse({ x, z, width = 5, depth = 4.4, height = 2.8, rotation = 0, long = false }) {
    const y = terrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotation;

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.35, depth + 0.6), stone);
    plinth.position.y = 0.13;
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    group.add(plinth);

    const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wood);
    base.position.y = height / 2 + 0.28;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const beamMat = darkWood;
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, height + 0.2, 0.18), beamMat);
      post.position.set(side * (width / 2 - 0.05), height / 2 + 0.28, -depth / 2 - 0.02);
      group.add(post);
      const post2 = post.clone();
      post2.position.z = depth / 2 + 0.02;
      group.add(post2);
    }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.16, 0.12), beamMat);
    cross.position.set(0, height - 0.15, -depth / 2 - 0.03);
    group.add(cross);

    const roofRadius = Math.max(width, depth) * 0.73;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofRadius, long ? 2.4 : 2.0, 4), snowRoof);
    roof.position.y = height + 1.1;
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = depth / width;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    const roofRim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.55, 0.13, depth + 0.55), darkWood);
    roofRim.position.y = height + 0.43;
    roofRim.castShadow = true;
    group.add(roofRim);

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.95, 0.18), darkWood);
    door.position.set(0, 1.28, -depth / 2 - 0.08);
    group.add(door);
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.36, 2.16, 0.12), stone);
    doorFrame.position.set(0, 1.33, -depth / 2 - 0.02);
    group.add(doorFrame);

    for (const side of [-1, 1]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.66, 0.06), windowMat);
      window.position.set(side * (width / 2 - 0.86), 1.65, -depth / 2 - 0.105);
      group.add(window);
      const windowHalo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffa84e,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      windowHalo.position.copy(window.position).add(new THREE.Vector3(0, 0, -0.14));
      windowHalo.scale.set(2.1, 2.1, 1);
      group.add(windowHalo);
    }

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.7, 0.62), stone);
    chimney.position.set(width * 0.26, height + 1.55, depth * 0.15);
    chimney.castShadow = true;
    group.add(chimney);

    if (long) {
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 2.7),
        new THREE.MeshStandardMaterial({
          map: bannerTexture(),
          side: THREE.DoubleSide,
          roughness: 0.9,
          transparent: true,
          alphaTest: 0.06,
        }),
      );
      banner.position.set(width * 0.36, 2.9, -depth / 2 - 0.38);
      group.add(banner);
    }

    group.updateMatrixWorld(true);
    village.add(group);

    colliders.push({ x, z, radius: Math.max(width, depth) * 0.55 });
    for (let i = 0; i < 3; i += 1) {
      const puff = new THREE.Sprite(new THREE.SpriteMaterial({
        map: smokeMap,
        color: 0xaebfc6,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }));
      puff.scale.setScalar(0.8 + i * 0.55);
      const wx = x + Math.cos(rotation) * width * 0.26;
      const wz = z - Math.sin(rotation) * width * 0.26;
      puff.position.set(wx, y + height + 2.2, wz);
      puff.userData = { baseX: wx, baseZ: wz, baseY: y + height + 2.2, phase: Math.random() * 10, speed: 0.28 + Math.random() * 0.16, drift: 0.4 + Math.random() * 0.5, scale: 0.8 + i * 0.55 };
      village.add(puff);
      smokePuffs.push(puff);
    }
    return group;
  }

  const houses = [
    { x: -13.5, z: 9, width: 5.2, depth: 4.5, rotation: 0.5 },
    { x: -12.5, z: -3.5, width: 5.6, depth: 4.4, rotation: 0.12 },
    { x: -1.5, z: -13.5, width: 4.8, depth: 4.8, rotation: -0.06 },
    { x: 11.8, z: -9.5, width: 5.5, depth: 4.2, rotation: -0.6 },
    { x: 14, z: 5.5, width: 5.0, depth: 4.5, rotation: -0.9 },
    { x: -7.5, z: 17.5, width: 4.5, depth: 4.2, rotation: 0.68 },
  ];
  houses.forEach(addHouse);
  addHouse({ x: -1.5, z: -22, width: 9.2, depth: 5.3, height: 3.2, rotation: 0.03, long: true });
  addHouse({ x: 17.5, z: 17.5, width: 4.5, depth: 3.8, rotation: -1.2 });

  // Market awning near the village edge.
  const awning = new THREE.Group();
  const awningCloth = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 2.5, 8, 1),
    new THREE.MeshStandardMaterial({ color: 0x714b3c, roughness: 1, side: THREE.DoubleSide }),
  );
  awningCloth.rotation.x = -1.15;
  awningCloth.position.y = 2.3;
  awning.add(awningCloth);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.5, 5), darkWood);
    post.position.set(side * 2.1, 1.2, 0);
    awning.add(post);
  }
  const marketX = 7.4;
  const marketZ = 13.5;
  awning.position.set(marketX, terrainHeight(marketX, marketZ), marketZ);
  awning.rotation.y = 0.25;
  village.add(awning);

  // Crates and barrels make the village feel lived in.
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x574433, roughness: 1, flatShading: true });
  for (let i = 0; i < 12; i += 1) {
    const x = (i % 4) * 0.8 - 1.2 + (i > 7 ? 6.2 : 0);
    const z = Math.floor(i / 4) * 0.8 + 11.5;
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), crateMat);
    crate.position.set(x, terrainHeight(x, z) + 0.28, z);
    crate.rotation.y = randHash(x, z, 7) * 1.2;
    crate.castShadow = true;
    village.add(crate);
  }

  // Wooden fence along the south edge.
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 1 });
  for (let i = 0; i < 30; i += 1) {
    const x = -17 + i * 1.15;
    const z = 28.5 + Math.sin(i * 0.6) * 0.8;
    const y = terrainHeight(x, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.25, 4), fenceMat);
    post.position.set(x, y + 0.62, z);
    village.add(post);
    if (i < 29) {
      const nextX = -17 + (i + 1) * 1.15;
      const nextZ = 28.5 + Math.sin((i + 1) * 0.6) * 0.8;
      const nextY = terrainHeight(nextX, nextZ);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.06), fenceMat);
      rail.position.set((x + nextX) / 2, (y + nextY) / 2 + 0.65, (z + nextZ) / 2);
      rail.rotation.z = Math.atan2(nextY - y, nextX - x);
      village.add(rail);
    }
  }

  // Bonfire.
  const fireX = -7.5;
  const fireZ = 2.2;
  const fireY = terrainHeight(fireX, fireZ);
  const fireGroup = new THREE.Group();
  fireGroup.position.set(fireX, fireY, fireZ);
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xffa04a, toneMapped: false });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffc06a, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  for (let i = 0; i < 6; i += 1) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.05, 5), darkWood);
    log.position.set(0, 0.17, 0);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 6) * TAU;
    fireGroup.add(log);
  }
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 7), flameMat);
  flameCore.position.y = 0.73;
  fireGroup.add(flameCore);
  const flameHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xff9d4a,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  flameHalo.position.y = 0.8;
  flameHalo.scale.set(5.3, 5.3, 1);
  fireGroup.add(flameHalo);
  const fireLight = new THREE.PointLight(0xffa45c, 18, 13, 2);
  fireLight.position.y = 1.25;
  fireGroup.add(fireLight);
  village.add(fireGroup);
  animations.push((dt, t) => {
    flameCore.scale.set(0.85 + Math.sin(t * 9.2) * 0.1, 0.9 + Math.sin(t * 7.4) * 0.2, 0.85 + Math.cos(t * 8.1) * 0.1);
    flameCore.rotation.y += dt * 0.7;
    flameHalo.material.opacity = 0.42 + Math.sin(t * 4.2) * 0.08;
    fireLight.intensity = 16 + Math.sin(t * 8.4) * 2.2;
  });

  // ------------------------------------------------------------------------
  // Moon shrine
  // ------------------------------------------------------------------------
  const shrine = new THREE.Group();
  const shrineY = terrainHeight(worldLayout.shrine.x, worldLayout.shrine.z);
  shrine.position.set(worldLayout.shrine.x, shrineY, worldLayout.shrine.z);
  world.add(shrine);

  const platformMat = new THREE.MeshStandardMaterial({ color: 0x5d686c, roughness: 0.92, flatShading: true });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.8, 0.46, 9), platformMat);
  platform.position.y = 0.16;
  platform.receiveShadow = true;
  platform.castShadow = true;
  shrine.add(platform);
  const innerPlatform = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.9, 0.26, 9), new THREE.MeshStandardMaterial({ color: 0x727d7e, roughness: 0.86, flatShading: true }));
  innerPlatform.position.y = 0.45;
  innerPlatform.receiveShadow = true;
  shrine.add(innerPlatform);

  const pillarPositions = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = i * TAU / 4 + Math.PI / 4;
    const x = Math.cos(angle) * 3.15;
    const z = Math.sin(angle) * 3.15;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.35, 3.6, 6), platformMat);
    pillar.position.set(x, 2.3, z);
    pillar.castShadow = true;
    shrine.add(pillar);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.8), platformMat);
    cap.position.set(x, 4.12, z);
    cap.rotation.y = Math.PI / 4;
    shrine.add(cap);
    pillarPositions.push({ x, z });
  }

  const moonRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.11, 7, 42, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x8ab8ba, emissive: 0x2d7978, emissiveIntensity: 0.6, roughness: 0.5, metalness: 0.25 }),
  );
  moonRing.position.set(0, 3.45, 0);
  moonRing.rotation.z = Math.PI;
  moonRing.rotation.x = 0.04;
  shrine.add(moonRing);

  const moonstoneMat = new THREE.MeshStandardMaterial({
    color: 0xbaf8f2,
    emissive: 0x57d9d0,
    emissiveIntensity: 3.5,
    roughness: 0.2,
    metalness: 0.15,
    flatShading: true,
  });
  const moonstone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.47, 0), moonstoneMat);
  moonstone.position.set(0, 3.15, 0);
  moonstone.castShadow = true;
  shrine.add(moonstone);
  const shrineHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x71e9e0,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  shrineHalo.position.copy(moonstone.position);
  shrineHalo.scale.set(5.6, 5.6, 1);
  shrine.add(shrineHalo);
  const shrineLight = new THREE.PointLight(0x5de6db, 22, 16, 2);
  shrineLight.position.set(0, 3.25, 0);
  shrine.add(shrineLight);
  animations.push((dt, t) => {
    moonstone.rotation.y = t * 0.42;
    moonstone.rotation.x = Math.sin(t * 0.3) * 0.15;
    moonstone.position.y = 3.15 + Math.sin(t * 1.1) * 0.12;
    shrineHalo.position.y = moonstone.position.y;
    shrineHalo.material.opacity = 0.54 + Math.sin(t * 2.2) * 0.09;
    shrineLight.intensity = 20 + Math.sin(t * 3.4) * 3;
    moonRing.rotation.z = Math.PI + Math.sin(t * 0.22) * 0.02;
  });
  colliders.push({ x: worldLayout.shrine.x, z: worldLayout.shrine.z, radius: 3.4, low: true });

  // Spirit motes around the shrine.
  const moteCount = 45;
  const motePositions = new Float32Array(moteCount * 3);
  const moteSeeds = [];
  for (let i = 0; i < moteCount; i += 1) {
    const a = Math.random() * TAU;
    const r = 1.2 + Math.random() * 4.2;
    const y = 1.1 + Math.random() * 3.4;
    moteSeeds.push({ a, r, y, speed: 0.15 + Math.random() * 0.25 });
    motePositions[i * 3] = Math.cos(a) * r;
    motePositions[i * 3 + 1] = y;
    motePositions[i * 3 + 2] = Math.sin(a) * r;
  }
  const moteGeometry = new THREE.BufferGeometry();
  moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMaterial = new THREE.PointsMaterial({
    color: 0x8ff7eb,
    size: 0.17,
    map: glowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(moteGeometry, moteMaterial);
  shrine.add(motes);
  animations.push((dt, t) => {
    const pos = moteGeometry.attributes.position;
    for (let i = 0; i < moteCount; i += 1) {
      const seed = moteSeeds[i];
      const angle = seed.a + t * seed.speed;
      pos.setXYZ(i, Math.cos(angle) * seed.r, seed.y + Math.sin(t * 0.6 + i) * 0.35, Math.sin(angle) * seed.r);
    }
    pos.needsUpdate = true;
    moteMaterial.opacity = 0.64 + Math.sin(t * 1.7) * 0.12;
  });

  // ------------------------------------------------------------------------
  // Frostfang Barrow
  // ------------------------------------------------------------------------
  const barrow = new THREE.Group();
  const barrowGroundY = terrainHeight(BARROW.x, BARROW.y);
  barrow.position.set(BARROW.x, barrowGroundY, BARROW.y);
  world.add(barrow);

  const barrowStone = new THREE.MeshStandardMaterial({ color: 0x464c54, roughness: 0.9, flatShading: true });
  const barrowDark = new THREE.MeshStandardMaterial({ color: 0x272b32, roughness: 0.95, flatShading: true });
  const barrowIce = new THREE.MeshStandardMaterial({ color: 0x8fbfc5, emissive: 0x1c585c, emissiveIntensity: 0.5, roughness: 0.3, flatShading: true });

  const mound = new THREE.Mesh(new THREE.SphereGeometry(8.4, 11, 7, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x354249, roughness: 0.95, flatShading: true }));
  mound.scale.set(1.1, 0.43, 1.05);
  mound.position.y = 0.1;
  mound.receiveShadow = true;
  barrow.add(mound);

  const threshold = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.35, 3.8), barrowStone);
  threshold.position.set(0, 0.24, 2.4);
  threshold.receiveShadow = true;
  barrow.add(threshold);

  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 5.2, 1.5), barrowStone);
    pillar.position.set(side * 3.25, 2.55, 1.6);
    pillar.rotation.z = side * 0.025;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    barrow.add(pillar);
    for (let i = 0; i < 3; i += 1) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.5, 1.6), i % 2 ? barrowDark : barrowStone);
      block.position.set(side * 3.25, 1.0 + i * 1.55, 1.6);
      block.rotation.z = side * (0.015 + i * 0.008);
      barrow.add(block);
    }
    colliders.push({ x: BARROW.x + side * 3.25, z: BARROW.y + 1.6, radius: 1.05 });
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.18, 1.65), barrowStone);
  lintel.position.set(0, 5.15, 1.6);
  lintel.rotation.z = -0.018;
  lintel.castShadow = true;
  barrow.add(lintel);
  const lintelCap = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.34, 1.95), snowRoof);
  lintelCap.position.set(0, 5.88, 1.6);
  barrow.add(lintelCap);
  const crownStone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 4), barrowStone);
  crownStone.position.set(0, 6.7, 1.6);
  crownStone.rotation.y = Math.PI / 4;
  barrow.add(crownStone);

  // Rune-carved standing stones.
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * TAU + 0.35;
    const radius = 10.4;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 2;
    const height = 2.2 + Math.random() * 1.7;
    const stoneMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, height, 0.5), i % 2 ? barrowStone : barrowDark);
    stoneMesh.position.set(x, height / 2 + 0.2, z);
    stoneMesh.rotation.y = Math.atan2(-x, -z);
    stoneMesh.rotation.z = (Math.random() - 0.5) * 0.08;
    stoneMesh.castShadow = true;
    barrow.add(stoneMesh);
    const rune = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.8),
      new THREE.MeshBasicMaterial({ map: runeMap, color: 0x83e8e0, transparent: true, opacity: 0.72, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    );
    rune.position.set(x - Math.sin(stoneMesh.rotation.y) * 0.27, height * 0.55 + 0.2, z - Math.cos(stoneMesh.rotation.y) * 0.27);
    rune.rotation.y = stoneMesh.rotation.y;
    barrow.add(rune);
    const runeHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x55d9d1, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    runeHalo.position.copy(rune.position);
    runeHalo.scale.set(2.2, 2.2, 1);
    barrow.add(runeHalo);
    colliders.push({ x: BARROW.x + x, z: BARROW.y + z, radius: 0.55 });
  }

  // Braziers with cold fire.
  const brazierPositions = [[-4.7, 3.1], [4.7, 3.1]];
  for (const [x, z] of brazierPositions) {
    const brazier = new THREE.Group();
    brazier.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.32, 1.7, 6), barrowDark);
    base.position.y = 0.85;
    brazier.add(base);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.34, 0.32, 8), barrowStone);
    bowl.position.y = 1.72;
    brazier.add(bowl);
    const coldFlame = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.9, 6), new THREE.MeshBasicMaterial({ color: 0x6ee7df, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    coldFlame.position.y = 2.2;
    brazier.add(coldFlame);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0x5de9df, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.y = 2.1;
    halo.scale.set(3.2, 3.2, 1);
    brazier.add(halo);
    barrow.add(brazier);
    animations.push((dt, t) => {
      coldFlame.scale.y = 0.86 + Math.sin(t * 5.2 + x) * 0.18;
      coldFlame.rotation.y += dt * 0.8;
      halo.material.opacity = 0.32 + Math.sin(t * 2.8 + x) * 0.08;
    });
  }

  // Sunstone plinth.
  const plinth = new THREE.Group();
  plinth.position.set(worldLayout.sunstone.x - BARROW.x, 0.3, worldLayout.sunstone.z - BARROW.y);
  const plinthBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.45, 0.7, 6), barrowStone);
  plinthBase.position.y = 0.35;
  plinthBase.castShadow = true;
  plinth.add(plinthBase);
  const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 1.0, 0.32, 6), barrowDark);
  plinthTop.position.y = 0.84;
  plinth.add(plinthTop);
  const sunstoneMat = new THREE.MeshStandardMaterial({ color: 0xffe5a1, emissive: 0xffba50, emissiveIntensity: 4.2, roughness: 0.18, metalness: 0.25, flatShading: true });
  const sunstone = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), sunstoneMat);
  sunstone.position.y = 1.88;
  sunstone.castShadow = true;
  plinth.add(sunstone);
  const sunstoneHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffc263, transparent: true, opacity: 0.72, depthWrite: false, blending: THREE.AdditiveBlending }));
  sunstoneHalo.position.y = 1.9;
  sunstoneHalo.scale.set(6, 6, 1);
  plinth.add(sunstoneHalo);
  const sunstoneLight = new THREE.PointLight(0xffb45d, 18, 13, 2);
  sunstoneLight.position.y = 2.6;
  plinth.add(sunstoneLight);
  barrow.add(plinth);
  animations.push((dt, t) => {
    sunstone.rotation.y = t * 0.7;
    sunstone.position.y = 1.9 + Math.sin(t * 1.25) * 0.13;
    sunstoneHalo.position.y = sunstone.position.y;
    sunstoneHalo.material.opacity = 0.56 + Math.sin(t * 2.1) * 0.11;
    sunstoneLight.intensity = 15 + Math.sin(t * 3.7) * 3;
  });

  // A cold beam over the barrow.
  const beaconMaterial = new THREE.MeshBasicMaterial({
    color: 0x78e9e1,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.8, 26, 12, 1, true), beaconMaterial);
  beacon.position.set(BARROW.x, barrowGroundY + 12, BARROW.z);
  world.add(beacon);

  // Dead, windswept trees near the barrow.
  for (let i = 0; i < 8; i += 1) {
    const angle = Math.random() * TAU;
    const radius = 12 + Math.random() * 11;
    const x = BARROW.x + Math.cos(angle) * radius;
    const z = BARROW.z + Math.sin(angle) * radius;
    const y = terrainHeight(x, z);
    const dead = new THREE.Group();
    dead.position.set(x, y, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 3.2, 5), darkWood);
    trunk.position.y = 1.6;
    trunk.rotation.z = (Math.random() - 0.5) * 0.2;
    trunk.castShadow = true;
    dead.add(trunk);
    for (let b = 0; b < 3; b += 1) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.07, 1.35, 4), darkWood);
      branch.position.set((Math.random() - 0.5) * 0.8, 2.2 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8);
      branch.rotation.z = 0.7 + Math.random() * 0.8;
      branch.rotation.y = Math.random() * TAU;
      dead.add(branch);
    }
    world.add(dead);
  }

  // ------------------------------------------------------------------------
  // Snowfall and mist
  // ------------------------------------------------------------------------
  const snowCount = 1500;
  const snowPositions = new Float32Array(snowCount * 3);
  const snowSpeeds = new Float32Array(snowCount);
  for (let i = 0; i < snowCount; i += 1) {
    snowPositions[i * 3] = (Math.random() - 0.5) * 84;
    snowPositions[i * 3 + 1] = Math.random() * 36 - 4;
    snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 84;
    snowSpeeds[i] = 1.2 + Math.random() * 2.6;
  }
  const snowfallGeo = new THREE.BufferGeometry();
  snowfallGeo.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
  const snowfallMat = new THREE.PointsMaterial({
    color: 0xeefaff,
    size: 0.17,
    map: flakeTexture,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const snowfall = new THREE.Points(snowfallGeo, snowfallMat);
  snowfall.frustumCulled = false;
  world.add(snowfall);

  const mistCount = 24;
  const mistGeometry = new THREE.BufferGeometry();
  const mistPositions = new Float32Array(mistCount * 3);
  for (let i = 0; i < mistCount; i += 1) {
    mistPositions[i * 3] = (Math.random() - 0.5) * 150;
    mistPositions[i * 3 + 1] = -1.1 + Math.random() * 0.8;
    mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
  }
  mistGeometry.setAttribute("position", new THREE.BufferAttribute(mistPositions, 3));
  const mist = new THREE.Points(mistGeometry, new THREE.PointsMaterial({
    color: 0xbfdbe1,
    size: 15,
    map: smokeMap,
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
    sizeAttenuation: true,
  }));
  world.add(mist);

  const focusPosition = new THREE.Vector3();
  const snowPosAttr = snowfallGeo.attributes.position;

  // ------------------------------------------------------------------------
  // API
  // ------------------------------------------------------------------------
  const cameraBlockers = colliders
    .filter((collider) => !collider.low)
    .concat([{ x: marketX, z: marketZ, radius: 2.8 }]);
  const api = {
    group: world,
    scene,
    colliders,
    cameraBlockers,
    sky,
    sunstone,
    barrow,
    barrowGroundY,
    shrine,
    moonLight,
    spawn: { ...worldLayout.spawn },
    elder: { ...worldLayout.elder },
    shrinePos: { ...worldLayout.shrine },
    barrowPos: { ...worldLayout.barrow },
    sunstonePos: { ...worldLayout.sunstone },
    villagePos: { ...worldLayout.village },
    heightAt: terrainHeight,
    pathCurve: curve,

    update(dt, time, focus, camera) {
      skyMaterial.uniforms.uTime.value = time;
      skyMaterial.uniforms.uAurora.value = auroraLevel;
      waterNoise.offset.x = (waterNoise.offset.x + dt * 0.0035) % 1;
      waterNoise.offset.y = (waterNoise.offset.y + dt * 0.0021) % 1;
      starMaterial.opacity = 0.58 + Math.sin(time * 0.55) * 0.06;
      moonHalo.material.opacity = 0.2 + Math.sin(time * 0.7) * 0.03;
      beaconMaterial.opacity = 0.055 + Math.sin(time * 1.1) * 0.018;
      moonLight.position.set(focus.x - 38, 62, focus.z - 34);
      moonLight.target.position.set(focus.x, 0, focus.z);
      moonLight.target.updateMatrixWorld();

      focusPosition.copy(focus);
      const pos = snowPosAttr.array;
      for (let i = 0; i < snowCount; i += 1) {
        const index = i * 3;
        pos[index + 1] -= snowSpeeds[i] * dt;
        pos[index] += Math.sin(time * 0.8 + i * 1.7) * dt * 0.26 - dt * 0.36;
        pos[index + 2] += Math.cos(time * 0.65 + i * 0.9) * dt * 0.16;
        if (pos[index + 1] < -3.5) {
          pos[index] = (Math.random() - 0.5) * 82;
          pos[index + 1] = 30 + Math.random() * 7;
          pos[index + 2] = (Math.random() - 0.5) * 82;
        }
        if (pos[index] < -42) pos[index] += 84;
        if (pos[index] > 42) pos[index] -= 84;
        if (pos[index + 2] < -42) pos[index + 2] += 84;
        if (pos[index + 2] > 42) pos[index + 2] -= 84;
      }
      snowPosAttr.needsUpdate = true;
      snowfall.position.set(focus.x, focus.y, focus.z);
      mist.position.set(camera.position.x, 0, camera.position.z);

      for (const animation of animations) animation(dt, time);
      for (const puff of smokePuffs) {
        const data = puff.userData;
        const cycle = (time * data.speed + data.phase) % 1;
        puff.position.set(data.baseX + cycle * data.drift, data.baseY + cycle * 5.2, data.baseZ + Math.sin(cycle * 5 + data.phase) * 0.32);
        puff.material.opacity = Math.sin(cycle * Math.PI) * 0.16;
        puff.scale.setScalar(data.scale + cycle * 2.6);
      }
      for (const glint of riverGlints) {
        glint.material.opacity = 0.25 + Math.sin(time * 1.5 + glint.userData.phase) * 0.12;
      }
    },

    setAurora(level) {
      auroraLevel = level;
      skyMaterial.uniforms.uAurora.value = level;
    },

    pulseShrine(strength = 1) {
      shrineLight.intensity = 22 + 20 * strength;
      shrineHalo.scale.setScalar(5.6 + strength * 3.5);
      setTimeout(() => {
        shrineHalo.scale.setScalar(5.6);
      }, 900);
    },
  };

  return api;
}
