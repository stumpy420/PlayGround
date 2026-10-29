import * as THREE from 'three';

const ARENA = 25;

function canvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function makeParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 31);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.32, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGroundTexture() {
  return canvasTexture(
    512,
    512,
    (ctx, w, h) => {
      const rand = mulberry32(99);
      ctx.fillStyle = '#242c31';
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let y = 0; y < h; y += tile) {
        for (let x = 0; x < w; x += tile) {
          const shade = 30 + Math.floor(rand() * 18);
          ctx.fillStyle = `rgb(${shade}, ${shade + 5}, ${shade + 8})`;
          ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
          ctx.strokeStyle = 'rgba(10, 16, 20, 0.5)';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(x + 0.5, y + 0.5, tile, tile);
          for (let i = 0; i < 6; i += 1) {
            ctx.fillStyle = `rgba(${90 + rand() * 35}, ${105 + rand() * 35}, ${110 + rand() * 30}, ${0.05 + rand() * 0.08})`;
            ctx.fillRect(x + rand() * tile, y + rand() * tile, 1 + rand() * 5, 1 + rand() * 3);
          }
        }
      }
      ctx.strokeStyle = 'rgba(8, 13, 17, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i += 1) {
        ctx.beginPath();
        let x = rand() * w;
        let y = rand() * h;
        ctx.moveTo(x, y);
        for (let j = 0; j < 4; j += 1) {
          x += (rand() - 0.5) * 60;
          y += rand() * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      const gradient = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.7);
      gradient.addColorStop(0, 'rgba(80, 125, 140, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
    11,
    11
  );
}

function makeConcreteTexture() {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const rand = mulberry32(7);
      ctx.fillStyle = '#4b5152';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1600; i += 1) {
        const v = 45 + rand() * 45;
        ctx.fillStyle = `rgba(${v}, ${v + 2}, ${v + 1}, ${0.1 + rand() * 0.2})`;
        ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
      }
      ctx.strokeStyle = 'rgba(15, 19, 20, 0.5)';
      ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(20, 26, 27, 0.42)';
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        let x = rand() * w;
        let y = rand() * h;
        ctx.moveTo(x, y);
        for (let j = 0; j < 5; j += 1) {
          x += (rand() - 0.5) * 30;
          y += rand() * 20;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    2,
    2
  );
}

function makeWoodTexture() {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const rand = mulberry32(42);
      ctx.fillStyle = '#70503a';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        const tone = 78 + rand() * 25;
        ctx.fillStyle = `rgb(${tone + 25}, ${tone}, ${tone - 22})`;
        ctx.fillRect(0, y + 2, w, 27);
        ctx.strokeStyle = 'rgba(35, 20, 11, 0.45)';
        ctx.beginPath();
        ctx.moveTo(0, y + 1);
        ctx.lineTo(w, y + 1);
        ctx.stroke();
        for (let i = 0; i < 4; i += 1) {
          ctx.strokeStyle = `rgba(52, 31, 17, ${0.12 + rand() * 0.18})`;
          ctx.beginPath();
          const yy = y + 6 + rand() * 18;
          ctx.moveTo(0, yy);
          ctx.bezierCurveTo(w * 0.3, yy + 2, w * 0.6, yy - 2, w, yy + 1);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = 'rgba(40, 26, 17, 0.75)';
      ctx.lineWidth = 5;
      ctx.strokeRect(0, 0, w, h);
    },
    1,
    1
  );
}

function makeContainerTexture(color = '#2d5b63') {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) {
        const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.26)');
        grad.addColorStop(0.38, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(0.62, 'rgba(255, 255, 255, 0.02)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, 16, h);
      }
      ctx.strokeStyle = 'rgba(9, 19, 21, 0.72)';
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(10, 20, 22, 0.35)';
      ctx.fillRect(0, 0, w, 22);
      ctx.fillStyle = 'rgba(218, 236, 230, 0.42)';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('SARDINE BAY · 09', 16, 68);
      for (let i = 0; i < 9; i += 1) {
        ctx.fillStyle = `rgba(15, 36, 38, ${0.1 + Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * w, 90 + Math.random() * 150, 12 + Math.random() * 50, 2);
      }
    },
    1,
    1
  );
}

function makeFacadeTextures(seed, tone = 0) {
  const rand = mulberry32(seed);
  const mapCanvas = document.createElement('canvas');
  const emiCanvas = document.createElement('canvas');
  mapCanvas.width = emiCanvas.width = 256;
  mapCanvas.height = emiCanvas.height = 256;
  const ctx = mapCanvas.getContext('2d');
  const emi = emiCanvas.getContext('2d');
  const base = 19 + tone;
  ctx.fillStyle = `rgb(${base}, ${base + 8}, ${base + 12})`;
  ctx.fillRect(0, 0, 256, 256);
  emi.fillStyle = '#000';
  emi.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 3;
  for (let y = 0; y < 256; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let y = 4; y < 256; y += 38) {
    for (let x = 8; x < 256; x += 46) {
      const lit = rand() > 0.42;
      ctx.fillStyle = lit ? '#9c8458' : '#0b171d';
      ctx.fillRect(x, y, 28, 20);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.strokeRect(x, y, 28, 20);
      if (lit) {
        const warm = rand() > 0.22;
        emi.fillStyle = warm ? '#ffb35c' : '#4dd9e8';
        emi.fillRect(x + 1, y + 1, 26, 18);
        emi.fillStyle = 'rgba(0, 0, 0, 0.35)';
        emi.fillRect(x + 13, y + 1, 2, 18);
      }
    }
  }
  ctx.fillStyle = 'rgba(80, 90, 92, 0.22)';
  for (let i = 0; i < 80; i += 1) {
    ctx.fillRect(rand() * 256, rand() * 256, 1 + rand() * 8, 1 + rand() * 2);
  }
  const map = new THREE.CanvasTexture(mapCanvas);
  const emissiveMap = new THREE.CanvasTexture(emiCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  return { map, emissiveMap };
}

function makeStripeTexture(colors = ['#f4e4c1', '#cb5f42']) {
  return canvasTexture(
    128,
    64,
    (ctx, w, h) => {
      for (let i = 0; i < 8; i += 1) {
        ctx.fillStyle = colors[i % 2];
        ctx.fillRect((i * w) / 8, 0, w / 8 + 1, h);
      }
      ctx.fillStyle = 'rgba(24, 27, 24, 0.14)';
      ctx.fillRect(0, h - 9, w, 9);
      for (let i = 0; i < w; i += 18) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.fillRect(i, 0, 1, h);
      }
    },
    1,
    1
  );
}

function makeSignTexture(text, color = '#6df6ff', sub = '') {
  return canvasTexture(
    512,
    160,
    (ctx, w, h) => {
      ctx.fillStyle = '#061117';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.strokeRect(7, 7, w - 14, h - 14);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(15, 15, w - 30, h - 30);
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = color;
      ctx.font = 'bold 78px "Arial Narrow", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, sub ? h / 2 - 13 : h / 2 + 2);
      if (sub) {
        ctx.shadowBlur = 7;
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = 'rgba(225, 250, 255, 0.78)';
        ctx.fillText(sub, w / 2, h - 35);
      }
    },
    1,
    1
  );
}

function makePawGraffitiTexture() {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(100, 238, 255, 0.78)';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(128, 159, 47, 38, 0, 0, Math.PI * 2);
      ctx.stroke();
      const toes = [
        [68, 103, 17, 25, -0.36],
        [105, 81, 18, 27, -0.08],
        [151, 81, 18, 27, 0.08],
        [188, 103, 17, 25, 0.36],
      ];
      for (const [x, y, rx, ry, rot] of toes) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 178, 74, 0.58)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(53, 183);
      ctx.lineTo(206, 183);
      ctx.stroke();
    },
    1,
    1
  );
}

function makeMilkTexture() {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#ecf5ef';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#4abcc7';
      ctx.fillRect(0, 30, w, 26);
      ctx.fillStyle = '#1c3240';
      ctx.font = 'bold 29px "Arial Narrow", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MILK', w / 2, 105);
      ctx.font = 'bold 47px "Arial Narrow", sans-serif';
      ctx.fillText('09', w / 2, 160);
      ctx.strokeStyle = '#4abcc7';
      ctx.lineWidth = 5;
      ctx.strokeRect(17, 17, w - 34, h - 34);
      ctx.fillStyle = 'rgba(15, 34, 42, 0.16)';
      ctx.fillRect(0, 220, w, 36);
    },
    1,
    1
  );
}

export function buildWorld(scene, renderer) {
  const root = new THREE.Group();
  root.name = 'SardineBay';
  scene.add(root);
  const colliders = [];
  const occluders = [];
  const spawnPoints = [];
  const animated = [];
  const textures = [];
  const rand = mulberry32(2049);

  scene.background = new THREE.Color('#071018');
  scene.fog = new THREE.FogExp2('#07131c', 0.0125);

  const particleTexture = makeParticleTexture();
  const groundTexture = makeGroundTexture();
  const concreteTexture = makeConcreteTexture();
  const woodTexture = makeWoodTexture();
  const pawTexture = makePawGraffitiTexture();
  const milkTexture = makeMilkTexture();
  textures.push(groundTexture, concreteTexture, woodTexture, pawTexture, milkTexture);

  const mats = {
    concrete: new THREE.MeshStandardMaterial({ map: concreteTexture, color: '#b8c0bd', roughness: 0.88, metalness: 0.06 }),
    darkConcrete: new THREE.MeshStandardMaterial({ map: concreteTexture, color: '#5f696a', roughness: 0.94, metalness: 0.04 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTexture, color: '#c3a181', roughness: 0.82, metalness: 0.02 }),
    metal: new THREE.MeshStandardMaterial({ color: '#526166', roughness: 0.44, metalness: 0.72 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: '#1b262c', roughness: 0.5, metalness: 0.62 }),
    tealMetal: new THREE.MeshStandardMaterial({ color: '#1d5962', roughness: 0.42, metalness: 0.62 }),
    rust: new THREE.MeshStandardMaterial({ color: '#8d4a32', roughness: 0.72, metalness: 0.36 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#a98756', roughness: 0.5, metalness: 0.5 }),
    bronzeDark: new THREE.MeshStandardMaterial({ color: '#6b4f32', roughness: 0.58, metalness: 0.46 }),
    milk: new THREE.MeshStandardMaterial({ map: milkTexture, color: '#ffffff', roughness: 0.55, metalness: 0.05 }),
  };

  function registerCollider(mesh, padding = 0) {
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({
      minX: box.min.x - padding,
      maxX: box.max.x + padding,
      minZ: box.min.z - padding,
      maxZ: box.max.z + padding,
      height: box.max.y,
    });
  }

  function addSolid(mesh, { shadow = true, collide = true, occlude = true, pad = 0 } = {}) {
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    root.add(mesh);
    if (collide) registerCollider(mesh, pad);
    if (occlude) occluders.push(mesh);
    return mesh;
  }

  function box(w, h, d, mat, x, y, z, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    if (options.rotationY) mesh.rotation.y = options.rotationY;
    return addSolid(mesh, options);
  }

  // Sky dome -----------------------------------------------------------------
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color('#030a12') },
      midColor: { value: new THREE.Color('#0c2836') },
      horizonColor: { value: new THREE.Color('#1b4a55') },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vWorld = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorld;
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      void main() {
        float h = normalize(vWorld).y;
        vec3 col = mix(horizonColor, midColor, smoothstep(-0.04, 0.34, h));
        col = mix(col, topColor, smoothstep(0.18, 0.9, h));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(115, 32, 20), skyMat);
  scene.add(sky);

  const stars = [];
  for (let i = 0; i < 420; i += 1) {
    const theta = rand() * Math.PI * 2;
    const phi = rand() * 0.5 + 0.06;
    stars.push(Math.cos(theta) * Math.cos(phi) * 96, Math.sin(phi) * 96, Math.sin(theta) * Math.cos(phi) * 96);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
  const starMat = new THREE.PointsMaterial({ color: '#bce4ff', size: 0.22, transparent: true, opacity: 0.78, depthWrite: false });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  const moonCanvas = document.createElement('canvas');
  moonCanvas.width = 256;
  moonCanvas.height = 256;
  const mctx = moonCanvas.getContext('2d');
  const moonGrad = mctx.createRadialGradient(128, 128, 28, 128, 128, 128);
  moonGrad.addColorStop(0, 'rgba(220, 245, 255, 1)');
  moonGrad.addColorStop(0.28, 'rgba(181, 226, 247, 0.9)');
  moonGrad.addColorStop(0.55, 'rgba(128, 194, 222, 0.25)');
  moonGrad.addColorStop(1, 'rgba(90, 160, 200, 0)');
  mctx.fillStyle = moonGrad;
  mctx.fillRect(0, 0, 256, 256);
  const moonTex = new THREE.CanvasTexture(moonCanvas);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  moon.position.set(-48, 48, -78);
  moon.scale.set(24, 24, 1);
  scene.add(moon);

  // Lighting ---------------------------------------------------------------
  const hemi = new THREE.HemisphereLight('#86b9d1', '#10161c', 1.45);
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight('#b7ddf5', 2.4);
  moonLight.position.set(-22, 34, 18);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -32;
  moonLight.shadow.camera.right = 32;
  moonLight.shadow.camera.top = 32;
  moonLight.shadow.camera.bottom = -32;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 85;
  moonLight.shadow.bias = -0.0006;
  moonLight.shadow.normalBias = 0.035;
  scene.add(moonLight);

  const fill = new THREE.DirectionalLight('#357386', 0.75);
  fill.position.set(18, 11, -22);
  scene.add(fill);

  const statueSpot = new THREE.SpotLight('#b8f6ff', 70, 28, 0.62, 0.55, 1.1);
  statueSpot.position.set(2, 15, 6);
  statueSpot.target.position.set(0, 2, -3);
  statueSpot.castShadow = false;
  scene.add(statueSpot, statueSpot.target);

  // Ground ----------------------------------------------------------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA * 2 + 18, ARENA * 2 + 18),
    new THREE.MeshStandardMaterial({ map: groundTexture, color: '#aeb9b9', roughness: 0.72, metalness: 0.22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.position.y = 0;
  root.add(ground);
  occluders.push(ground);

  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(8.2, 48),
    new THREE.MeshStandardMaterial({ map: concreteTexture, color: '#9ca8a5', roughness: 0.7, metalness: 0.15 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.012, -2);
  plaza.receiveShadow = true;
  root.add(plaza);
  occluders.push(plaza);

  const ringMat = new THREE.MeshBasicMaterial({ color: '#56e9f8', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
  const plazaRing = new THREE.Mesh(new THREE.RingGeometry(7.4, 7.58, 64), ringMat);
  plazaRing.rotation.x = -Math.PI / 2;
  plazaRing.position.set(0, 0.025, -2);
  root.add(plazaRing);
  const innerRing = new THREE.Mesh(new THREE.RingGeometry(4.5, 4.58, 48), ringMat.clone());
  innerRing.material.opacity = 0.12;
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.set(0, 0.027, -2);
  root.add(innerRing);

  for (let i = 0; i < 8; i += 1) {
    const mark = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 1.6),
      new THREE.MeshBasicMaterial({ color: '#7be6ed', transparent: true, opacity: 0.13, depthWrite: false })
    );
    mark.rotation.x = -Math.PI / 2;
    mark.rotation.z = (i / 8) * Math.PI * 2;
    mark.position.set(Math.cos((i / 8) * Math.PI * 2) * 6.1, 0.028, -2 + Math.sin((i / 8) * Math.PI * 2) * 6.1);
    root.add(mark);
  }

  // Road markings
  for (let i = -2; i <= 2; i += 1) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 2.2),
      new THREE.MeshBasicMaterial({ color: '#aead8f', transparent: true, opacity: 0.22, depthWrite: false })
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(i * 2.6, 0.024, 20);
    root.add(line);
  }

  // Puddles ---------------------------------------------------------------
  for (const [x, z, sx, sz] of [
    [-6.5, 8, 2.4, 1.2],
    [8, 1.5, 1.8, 3.2],
    [-10, -13, 3, 1.5],
    [14, 13, 2.5, 1.4],
  ]) {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(1, 28),
      new THREE.MeshStandardMaterial({ color: '#0b2733', roughness: 0.08, metalness: 0.92, transparent: true, opacity: 0.68 })
    );
    puddle.scale.set(sx, sz, 1);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(x, 0.026, z);
    puddle.receiveShadow = true;
    root.add(puddle);
  }

  // Buildings --------------------------------------------------------------
  const facadeCache = [];
  function facade(seed, tone) {
    const tex = makeFacadeTextures(seed, tone);
    textures.push(tex.map, tex.emissiveMap);
    const mat = new THREE.MeshStandardMaterial({
      map: tex.map,
      emissiveMap: tex.emissiveMap,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 1.45,
      roughness: 0.9,
      metalness: 0.05,
    });
    facadeCache.push(mat);
    return mat;
  }

  const buildingSpecs = [
    [-19, 24, 15, 7, 10, 1, 0],
    [17.5, 24, 13, 7, 13, 2, 3],
    [26, 6, 7, 16, 11, 3, -1],
    [26, -15, 7, 12, 8, 4, 2],
    [-26, 9, 7, 17, 9, 5, 1],
    [-26, -15, 7, 12, 12, 6, 4],
    [-11, -24, 14, 7, 8, 7, 3],
    [15, -24, 10, 7, 11, 8, 1],
  ];
  for (const [x, z, w, d, h, seed, tone] of buildingSpecs) {
    const mat = facade(seed, tone);
    const building = box(w, h, d, mat, x, h / 2, z, { shadow: true });
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5),
      new THREE.MeshStandardMaterial({ color: '#161e22', roughness: 0.8, metalness: 0.32 })
    );
    roof.position.set(x, h + 0.2, z);
    roof.castShadow = true;
    roof.receiveShadow = true;
    root.add(roof);
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.16, 0.16, d + 0.16),
      new THREE.MeshStandardMaterial({ color: '#39545b', roughness: 0.5, metalness: 0.55 })
    );
    trim.position.set(x, 3.6, z);
    root.add(trim);
    // Rooftop vents
    for (let i = 0; i < 2; i += 1) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mats.metal);
      vent.position.set(x + (rand() - 0.5) * (w - 3), h + 1, z + (rand() - 0.5) * (d - 3));
      vent.castShadow = true;
      root.add(vent);
    }
  }

  // Shopfront awnings near the south and east edges
  function addAwning(x, z, w, rotationY, colors) {
    const group = new THREE.Group();
    const tex = makeStripeTexture(colors);
    textures.push(tex);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, 1.4),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.72 })
    );
    top.rotation.x = -0.16;
    top.position.set(0, 3.2, 0.65);
    top.castShadow = true;
    group.add(top);
    for (const side of [-1, 1]) {
      const lip = new THREE.Mesh(new THREE.BoxGeometry(w, 0.38, 0.06), new THREE.MeshStandardMaterial({ color: colors[1], roughness: 0.7 }));
      lip.position.set(0, 3.08, 0.65 + side * 0.68);
      group.add(lip);
    }
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;
    root.add(group);
  }
  addAwning(-17, 20.35, 4.2, 0, ['#e8ddc5', '#c55a45']);
  addAwning(-11.5, 20.35, 3.6, 0, ['#dce6cc', '#3b8585']);
  addAwning(20.5, 20.35, 4.2, 0, ['#e8ddc5', '#c55a45']);

  // Neon signs -------------------------------------------------------------
  const signs = [];
  function addNeon(text, color, sub, x, y, z, rotationY = 0, scale = 1) {
    const tex = makeSignTexture(text, color, sub);
    textures.push(tex);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6 * scale, 1.12 * scale), mat);
    sign.position.set(x, y, z);
    sign.rotation.y = rotationY;
    root.add(sign);
    const halo = new THREE.PointLight(color, 7, 7, 2);
    halo.position.set(x, y, z + Math.cos(rotationY) * 0.6);
    root.add(halo);
    signs.push(sign);
    return sign;
  }
  addNeon('FISH', '#67efff', 'FRESH DAILY', -14.6, 5.7, 20.4, 0, 1);
  addNeon('MILK BAR', '#ffb45a', 'OPEN ALL NINE', 21, 6.2, 20.4, 0, 0.98);
  addNeon('9 LIVES', '#ff7f5b', 'NO MOUSE ZONE', -22.3, 7.4, 6.5, Math.PI / 2, 0.95);
  addNeon('SARDINE', '#7df7c8', 'BAY // 09', 22.3, 8.8, -14.5, -Math.PI / 2, 1.05);

  // Cat statue -------------------------------------------------------------
  const statue = new THREE.Group();
  statue.position.set(0, 0, -3);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.7, 8), mats.darkConcrete);
  plinth.position.y = 0.35;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  statue.add(plinth);
  const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.1, 0.28, 8), mats.concrete);
  plinthTop.position.y = 0.84;
  plinthTop.castShadow = true;
  statue.add(plinthTop);

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.08, 20, 16), mats.bronze);
  body.scale.set(0.92, 1.2, 1.05);
  body.position.y = 2.1;
  body.castShadow = true;
  statue.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.64, 18, 14), mats.bronzeDark);
  chest.scale.set(0.85, 1.08, 0.62);
  chest.position.set(0, 2.02, 0.58);
  chest.castShadow = true;
  statue.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.78, 20, 16), mats.bronze);
  head.position.set(0, 3.34, 0.08);
  head.scale.set(1, 0.92, 0.92);
  head.castShadow = true;
  statue.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.78, 4), mats.bronze);
    ear.position.set(side * 0.45, 4.02, 0.06);
    ear.rotation.z = side * 0.18;
    ear.rotation.y = Math.PI / 4;
    ear.castShadow = true;
    statue.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: '#c6fbff' }));
    eye.position.set(side * 0.27, 3.45, 0.75);
    statue.add(eye);
    const paw = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.65, 3, 8), mats.bronzeDark);
    paw.position.set(side * 0.45, 1.22, 0.92);
    paw.rotation.z = side * 0.06;
    paw.castShadow = true;
    statue.add(paw);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 4), mats.bronzeDark);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 3.24, 0.85);
  statue.add(nose);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.74, 4), mats.bronzeDark);
      whisker.rotation.z = Math.PI / 2 + side * (0.13 + i * 0.1);
      whisker.rotation.y = side * 0.3;
      whisker.position.set(side * 0.62, 3.2 + (i - 1) * 0.1, 0.76);
      statue.add(whisker);
    }
  }
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.65, 1.35, -0.35),
    new THREE.Vector3(1.4, 1.2, -0.72),
    new THREE.Vector3(1.75, 1.95, -0.48),
    new THREE.Vector3(1.62, 2.65, 0.05),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 12, 0.13, 6, false), mats.bronzeDark);
  tail.castShadow = true;
  statue.add(tail);

  const statueLight = new THREE.PointLight('#9ff7ff', 24, 10, 2);
  statueLight.position.set(0, 4.6, 0.8);
  statue.add(statueLight);
  const statueWarm = new THREE.PointLight('#ffc177', 24, 11, 2);
  statueWarm.position.set(3.5, 4.2, 5.5);
  root.add(statueWarm);
  root.add(statue);
  registerCollider(statue, 0.1);
  statue.traverse((child) => {
    if (child.isMesh) occluders.push(child);
  });

  // Market stall ----------------------------------------------------------
  function marketStall(x, z, rot = 0, colors = ['#e9dcc1', '#bf5542']) {
    const group = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.25, 2.35), mats.wood);
    table.position.y = 1.03;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1, 0.14), mats.darkMetal);
      leg.position.set(side * 2.1, 0.5, 0);
      group.add(leg);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 3.2, 6), mats.metal);
      post.position.set(side * 2.35, 1.6, 0);
      post.castShadow = true;
      group.add(post);
    }
    const stripe = makeStripeTexture(colors);
    textures.push(stripe);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.13, 3.1), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.76 }));
    canopy.position.set(0, 3.14, 0);
    canopy.rotation.z = 0.025;
    canopy.castShadow = true;
    group.add(canopy);
    for (const side of [-1, 1]) {
      const valance = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.32, 0.05), new THREE.MeshStandardMaterial({ color: colors[1], roughness: 0.72 }));
      valance.position.set(0, 2.96, side * 1.55);
      group.add(valance);
    }
    for (let i = 0; i < 5; i += 1) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.42), i % 2 ? mats.wood : mats.rust);
      crate.position.set(-1.55 + i * 0.74, 1.35, (rand() - 0.5) * 0.4);
      crate.rotation.y = (rand() - 0.5) * 0.28;
      crate.castShadow = true;
      group.add(crate);
    }
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    root.add(group);
    registerCollider(group, 0.1);
    group.traverse((child) => {
      if (child.isMesh) occluders.push(child);
    });
  }
  marketStall(-12, 2.5, Math.PI / 2);
  marketStall(12.5, -10.5, Math.PI / 2, ['#d8e6cf', '#367a78']);
  marketStall(12.5, 13, -0.24, ['#ead7bd', '#b55240']);

  // Containers ------------------------------------------------------------
  function container(x, z, length, rot, color) {
    const tex = makeContainerTexture(color);
    textures.push(tex);
    const mat = new THREE.MeshStandardMaterial({ map: tex, color: '#cfd6d2', roughness: 0.62, metalness: 0.38 });
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(length, 2.75, 2.5), mat);
    body.position.y = 1.375;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    for (const side of [-1, 1]) {
      for (const y of [0.12, 2.63]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(length + 0.14, 0.16, 2.58), mats.darkMetal);
        rail.position.set(0, y, 0);
        group.add(rail);
      }
      for (const ex of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.75, 0.22), mats.rust);
        post.position.set(ex * (length / 2 - 0.08), 1.375, side * 1.2);
        group.add(post);
      }
    }
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    root.add(group);
    registerCollider(group, 0.06);
    group.traverse((child) => {
      if (child.isMesh) occluders.push(child);
    });
    return group;
  }
  container(-14.5, 10.6, 6.4, 0.16, '#315e66');
  container(14.8, 6.2, 5.8, -0.3, '#6b4230');
  container(-12.2, -14, 5.8, Math.PI / 2 + 0.12, '#36515b');
  container(15.3, -17.4, 5.6, Math.PI / 2 - 0.16, '#4b5d46');

  // Crates ----------------------------------------------------------------
  function fishCrate(x, z, size = 1.25, rot = 0) {
    const group = new THREE.Group();
    const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mats.wood);
    crate.position.y = size / 2;
    crate.castShadow = true;
    crate.receiveShadow = true;
    group.add(crate);
    for (const side of [-1, 1]) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(size * 1.02, 0.1, 0.1), mats.darkMetal);
      brace.position.set(0, size * 0.5, side * size * 0.51);
      group.add(brace);
    }
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 0.62, size * 0.43),
      new THREE.MeshBasicMaterial({
        map: makeSignTexture('FISH', '#f4d59a', '', 256, 110),
        transparent: true,
      })
    );
    label.position.set(0, size * 0.55, size * 0.507);
    group.add(label);
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    root.add(group);
    registerCollider(group, 0.03);
    group.traverse((child) => {
      if (child.isMesh) occluders.push(child);
    });
  }
  fishCrate(-4.8, 10.4, 1.4, 0.18);
  fishCrate(-3.4, 10.8, 1.05, -0.2);
  fishCrate(4.6, 10.7, 1.5, -0.12);
  fishCrate(5.9, 11.1, 1.0, 0.25);
  fishCrate(-5.1, 9.1, 1.0, 0.3);
  fishCrate(7.6, -4.2, 1.2, -0.2);
  fishCrate(-7.2, -7.5, 1.3, 0.35);
  fishCrate(3.6, -16, 1.1, 0.1);
  fishCrate(-18.5, -2.6, 1.45, 0.2);
  fishCrate(-17.3, -2, 0.95, -0.3);

  // Stack of milk cartons -------------------------------------------------
  const milkGroup = new THREE.Group();
  for (let i = 0; i < 3; i += 1) {
    const carton = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.72), mats.milk);
    carton.position.set((i - 1) * 0.95, 0.6, (i % 2) * 0.22);
    carton.rotation.y = (i - 1) * 0.12;
    carton.castShadow = true;
    milkGroup.add(carton);
  }
  milkGroup.position.set(-8.2, 0, 14.7);
  root.add(milkGroup);
  registerCollider(milkGroup);
  milkGroup.traverse((child) => {
    if (child.isMesh) occluders.push(child);
  });

  // Barrels ---------------------------------------------------------------
  function barrel(x, z, color = '#a8482d') {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.43, 0.47, 1.15, 14),
      new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.52 })
    );
    mesh.position.set(x, 0.575, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    registerCollider(mesh, 0.02);
    occluders.push(mesh);
    for (const y of [0.27, 0.88]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.028, 5, 18), mats.darkMetal);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y, z);
      root.add(ring);
    }
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.465, 0.475, 0.18, 14, 1, true),
      new THREE.MeshBasicMaterial({ color: '#f5b34f', transparent: true, opacity: 0.5 })
    );
    stripe.position.set(x, 0.63, z);
    root.add(stripe);
  }
  barrel(-9.4, 8.4);
  barrel(-8.4, 9.1, '#2f6d73');
  barrel(9.2, 7.2);
  barrel(20, -4.5);
  barrel(-17.4, -9.2, '#2f6d73');
  barrel(6.8, -19.5);
  barrel(-6.5, -19.8);

  // Sandbags --------------------------------------------------------------
  function sandbagWall(x, z, rot) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: '#7d704f', roughness: 0.98, metalness: 0.01 });
    for (let row = 0; row < 3; row += 1) {
      for (let i = 0; i < 4 - (row % 2); i += 1) {
        const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.42, 3, 8), mat);
        bag.rotation.z = Math.PI / 2;
        bag.position.set((i - 1.5 + (row % 2) * 0.5) * 0.62, 0.25 + row * 0.34, 0);
        bag.castShadow = true;
        bag.receiveShadow = true;
        group.add(bag);
      }
    }
    group.position.set(x, 0, z);
    group.rotation.y = rot;
    root.add(group);
    registerCollider(group, 0.02);
    group.traverse((child) => {
      if (child.isMesh) occluders.push(child);
    });
  }
  sandbagWall(-4.7, 13.1, 0.2);
  sandbagWall(5.3, 13.3, -0.1);
  sandbagWall(-10, -6.5, Math.PI / 2);
  sandbagWall(18.4, 13.2, 0.2);

  // Street lamps and strings ----------------------------------------------
  function streetLamp(x, z) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 5.4, 8), mats.metal);
    pole.position.y = 2.7;
    pole.castShadow = true;
    group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.07, 0.07), mats.metal);
    arm.position.set(0.46, 5.28, 0);
    group.add(arm);
    const housing = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.32, 6), mats.darkMetal);
    housing.rotation.z = Math.PI;
    housing.position.set(0.92, 5.2, 0);
    group.add(housing);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffc978' }));
    bulb.position.set(0.92, 5.06, 0);
    group.add(bulb);
    const light = new THREE.PointLight('#ffb35a', 27, 10, 2);
    light.position.set(0.92, 4.92, 0);
    group.add(light);
    group.position.set(x, 0, z);
    root.add(group);
    registerCollider(pole);
    occluders.push(pole);
    return new THREE.Vector3(x + 0.92, 4.9, z);
  }
  const lampA = streetLamp(-15.4, 14.4);
  streetLamp(16.6, 1.6);
  streetLamp(-2.8, -15.8);
  const lampB = streetLamp(13.7, -18.2);

  function stringLights(a, b, sag = 1) {
    const count = 14;
    const positions = [];
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      const y = a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * sag;
      positions.push(x, y, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: '#ffc16a', map: particleTexture, size: 0.22, transparent: true, opacity: 0.9, alphaTest: 0.01, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    root.add(points);
    animated.push({ kind: 'string', points, positions: Float32Array.from(positions), phase: rand() * 4 });
  }
  stringLights(lampA, new THREE.Vector3(-6, 4.4, 12), 1.2);
  stringLights(new THREE.Vector3(-6, 4.4, 12), lampB, 1.4);
  stringLights(new THREE.Vector3(16.6, 4.9, 1.6), new THREE.Vector3(13.7, 4.9, -18.2), 1.4);

  // Graffiti --------------------------------------------------------------
  const graffiti = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ map: pawTexture, transparent: true, depthWrite: false })
  );
  graffiti.position.set(19.95, 4.2, 18.2);
  graffiti.rotation.y = Math.PI;
  root.add(graffiti);

  // Boundary rails --------------------------------------------------------
  const railMat = new THREE.MeshStandardMaterial({ color: '#34454a', roughness: 0.58, metalness: 0.55 });
  for (const side of [-1, 1]) {
    const railX = new THREE.Mesh(new THREE.BoxGeometry(ARENA * 2, 0.11, 0.11), railMat);
    railX.position.set(0, 0.92, side * ARENA);
    root.add(railX);
    const railZ = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, ARENA * 2), railMat);
    railZ.position.set(side * ARENA, 0.92, 0);
    root.add(railZ);
    for (let i = -ARENA; i <= ARENA; i += 4) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.05, 6), railMat);
      post.position.set(i, 0.5, side * ARENA);
      root.add(post);
      const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.05, 6), railMat);
      post2.position.set(side * ARENA, 0.5, i);
      root.add(post2);
    }
  }

  // Floating dust and fireflies -------------------------------------------
  const dustPositions = [];
  for (let i = 0; i < 800; i += 1) {
    dustPositions.push((rand() - 0.5) * 54, rand() * 13 + 0.2, (rand() - 0.5) * 54);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: '#8ed8e4', map: particleTexture, size: 0.075, transparent: true, opacity: 0.36, alphaTest: 0.015, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(dust);

  const fireflyPositions = [];
  for (let i = 0; i < 42; i += 1) {
    fireflyPositions.push((rand() - 0.5) * 42, 1 + rand() * 5, (rand() - 0.5) * 42);
  }
  const fireflyGeo = new THREE.BufferGeometry();
  fireflyGeo.setAttribute('position', new THREE.Float32BufferAttribute(fireflyPositions, 3));
  const fireflies = new THREE.Points(
    fireflyGeo,
    new THREE.PointsMaterial({ color: '#ffc26b', map: particleTexture, size: 0.19, transparent: true, opacity: 0.85, alphaTest: 0.01, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(fireflies);

  // Spawn points ----------------------------------------------------------
  const rawSpawns = [
    [-20, 20.5],
    [20, 20.5],
    [-21, 12],
    [21, 12],
    [-21, -2],
    [21, -2],
    [-18, -20],
    [18, -20],
    [-7, -21],
    [8, -21],
    [0, -21],
    [-20, 7],
    [20, -9],
  ];
  for (const [x, z] of rawSpawns) {
    spawnPoints.push(new THREE.Vector3(x, 0, z));
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.46, 24),
      new THREE.MeshBasicMaterial({ color: '#ff6e55', transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.03, z);
    root.add(ring);
    animated.push({ kind: 'spawnRing', mesh: ring, phase: rand() * 6 });
  }

  // Extra neon floor trims around plaza
  const trimMat = new THREE.MeshBasicMaterial({ color: '#54e7f1', transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 4; i += 1) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.035, 0.08), trimMat);
    trim.position.set(Math.cos((i / 4) * Math.PI * 2) * 4.55, 0.04, -2 + Math.sin((i / 4) * Math.PI * 2) * 4.55);
    trim.rotation.y = -(i / 4) * Math.PI * 2;
    root.add(trim);
  }

  const playerStart = new THREE.Vector3(0, 0, 18.6);
  const bounds = ARENA - 0.6;

  function update(dt, time) {
    dust.rotation.y = time * 0.004;
    dust.position.y = Math.sin(time * 0.18) * 0.12;
    fireflies.position.y = Math.sin(time * 0.4) * 0.16;
    fireflyGeo.attributes.position.needsUpdate = true;
    starField.rotation.y = time * 0.0007;
    for (const item of animated) {
      if (item.kind === 'spawnRing') {
        item.mesh.material.opacity = 0.1 + Math.sin(time * 1.6 + item.phase) * 0.055;
      } else if (item.kind === 'string') {
        const arr = item.points.geometry.attributes.position.array;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i + 1] = item.positions[i + 1] + Math.sin(time * 1.1 + item.positions[i] * 0.36 + item.phase) * 0.035;
        }
        item.points.geometry.attributes.position.needsUpdate = true;
      }
    }
    plazaRing.material.opacity = 0.16 + Math.sin(time * 0.9) * 0.05;
    innerRing.rotation.z += dt * 0.045;
    statueSpot.intensity = 66 + Math.sin(time * 0.7) * 8;
    signs.forEach((sign, i) => {
      if (i === 2 && Math.sin(time * 17) > 0.96) sign.material.opacity = 0.45;
      else sign.material.opacity = 1;
    });
    moon.material.rotation = Math.sin(time * 0.03) * 0.01;
  }

  function clampToArena(pos) {
    pos.x = THREE.MathUtils.clamp(pos.x, -bounds, bounds);
    pos.z = THREE.MathUtils.clamp(pos.z, -bounds, bounds);
  }

  return {
    root,
    colliders,
    occluders,
    spawnPoints,
    playerStart,
    bounds,
    arenaRadius: ARENA,
    update,
    clampToArena,
    moonLight,
  };
}
