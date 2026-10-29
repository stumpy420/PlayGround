import * as THREE from 'three';
import {
  sandTexture, sandBump, pavementTexture, wallTexture, crateTexture,
  metalTexture, awningTexture, posterTexture, signTexture, radialTexture,
  cloudTexture
} from './textures.js';

const ARENA = 32;

export function buildWorld(scene, renderer, quality = 'high') {
  const group = new THREE.Group();
  scene.add(group);
  const colliders = [];
  const updates = [];
  const high = quality !== 'low';

  const sandMap = sandTexture();
  const sandBumpMap = sandBump();
  const paveMap = pavementTexture();
  const wallMap = wallTexture();

  const sandMat = new THREE.MeshStandardMaterial({ map: sandMap, bumpMap: sandBumpMap, bumpScale: 0.12, roughness: 0.96, metalness: 0, color: 0xd8c1a0 });
  const paveMat = new THREE.MeshStandardMaterial({ map: paveMap, roughness: 0.9, metalness: 0.02, color: 0xb7ad9d });
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, bumpMap: wallMap, bumpScale: 0.2, roughness: 0.95, color: 0xd2b894 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x4b3523, roughness: 0.85 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x353a37, roughness: 0.55, metalness: 0.65 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x9b815c, roughness: 1 });
  const sandbagMat = new THREE.MeshStandardMaterial({ color: 0xb7a078, roughness: 1 });

  const addCollider = (x, z, w, d) => colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  const box = (w, h, d, mat, x, y, z, opts = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (opts.rx) m.rotation.x = opts.rx;
    if (opts.ry) m.rotation.y = opts.ry;
    if (opts.rz) m.rotation.z = opts.rz;
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    group.add(m);
    return m;
  };

  /* ---------------- sky ---------------- */
  const sunDir = new THREE.Vector3(-0.48, 0.27, -0.62).normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x101c3c) },
      midColor: { value: new THREE.Color(0x9e5670) },
      horizonColor: { value: new THREE.Color(0xffa15d) },
      sunColor: { value: new THREE.Color(0xffd49a) },
      sunDir: { value: sunDir }
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor, midColor, horizonColor, sunColor, sunDir;
      varying vec3 vWorld;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p){
        float v = 0.0, a = 0.5;
        for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + 11.7; a *= 0.5; }
        return v;
      }
      void main(){
        vec3 dir = normalize(vWorld);
        float h = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(horizonColor, midColor, smoothstep(0.0, 0.24, h));
        col = mix(col, topColor, smoothstep(0.16, 0.72, h));
        float sunDot = max(dot(dir, normalize(sunDir)), 0.0);
        col += sunColor * pow(sunDot, 12.0) * 0.42;
        col += sunColor * smoothstep(0.99935, 0.99985, sunDot) * 1.5;
        float band = smoothstep(0.01, 0.11, h) * (1.0 - smoothstep(0.42, 0.8, h));
        vec2 cp = vec2(atan(dir.z, dir.x) * 1.9, asin(clamp(dir.y, -1.0, 1.0)) * 3.4);
        float clouds = smoothstep(0.46, 0.74, fbm(cp * 1.35 + vec2(3.0, 7.0)));
        clouds *= band * 0.62;
        col = mix(col, vec3(0.99, 0.76, 0.62), clouds);
        float wisp = smoothstep(0.6, 0.9, fbm(cp * vec2(3.2, 0.8) + 21.0)) * band * 0.09;
        col += vec3(0.99, 0.7, 0.5) * wisp;
        col += (hash(gl_FragCoord.xy) - 0.5) * 0.006;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 40, 20), skyMat);
  group.add(sky);

  const cloudTex = cloudTexture();
  for (let i = 0; i < 9; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: 0.35 + Math.random() * 0.16, color: 0xffd6bd }));
    const a = Math.random() * Math.PI * 2;
    const r = 130 + Math.random() * 80;
    sp.position.set(Math.cos(a) * r, 34 + Math.random() * 26, Math.sin(a) * r);
    sp.scale.set(70 + Math.random() * 70, 28 + Math.random() * 24, 1);
    group.add(sp);
  }

  /* ---------------- lighting ---------------- */
  const hemi = new THREE.HemisphereLight(0xffcaa0, 0x4b3b2c, 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffbc7a, 3.15);
  sun.position.copy(sunDir).multiplyScalar(72);
  sun.target.position.set(0, 0, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.camera.left = -48;
  sun.shadow.camera.right = 48;
  sun.shadow.camera.top = 48;
  sun.shadow.camera.bottom = -48;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.035;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x96b4dd, 0.9);
  fill.position.set(20, 24, 36);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0x5f5143, 0.4));

  /* ---------------- ground ---------------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 1, 1), sandMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.04;
  ground.receiveShadow = true;
  group.add(ground);

  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(52, 44, 1, 1), paveMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.015, 2);
  plaza.receiveShadow = true;
  group.add(plaza);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x9d8f77, roughness: 0.9 });
  for (const z of [24, -20]) {
    box(52, 0.32, 0.5, curbMat, 0, 0.14, z, { cast: false });
  }
  for (let i = 0; i < 10; i++) {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.45 + Math.random() * 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x6e6252, roughness: 0.84, transparent: true, opacity: 0.5 }));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set((Math.random() - 0.5) * 44, 0.025, (Math.random() - 0.5) * 38 + 2);
    patch.scale.y = 0.6 + Math.random() * 0.8;
    group.add(patch);
  }

  /* ---------------- perimeter ---------------- */
  const wallH = 3.4;
  for (const side of [-1, 1]) {
    box(0.9, wallH, ARENA * 2, wallMat, side * ARENA, wallH / 2, 0);
    addCollider(side * ARENA, 0, 3, ARENA * 2);
    const cap = box(1.3, 0.3, ARENA * 2, wallMat, side * ARENA, wallH + 0.14, 0);
    cap.receiveShadow = true;
    for (let z = -ARENA + 2; z <= ARENA - 2; z += 4) {
      box(1.1, 0.55, 1.6, wallMat, side * ARENA, wallH + 0.55, z);
    }
  }
  box(ARENA * 2, wallH, 0.9, wallMat, 0, wallH / 2, ARENA);
  addCollider(0, ARENA, ARENA * 2, 3);
  for (let x = -ARENA + 2; x <= ARENA - 2; x += 4) box(1.6, 0.55, 1.1, wallMat, x, wallH + 0.55, ARENA);

  const gateW = 10;
  for (const side of [-1, 1]) {
    const cx = side * (gateW / 2 + (ARENA - gateW / 2) / 2);
    box(ARENA - gateW / 2, wallH, 0.9, wallMat, cx, wallH / 2, -ARENA);
    for (let x = gateW / 2; x < ARENA - 1; x += 4) {
      box(1.6, 0.55, 1.1, wallMat, side * x, wallH + 0.55, -ARENA);
    }
  }
  box(gateW, 1.2, 1.1, wallMat, 0, wallH + 0.6, -ARENA);
  addCollider(0, -ARENA, ARENA * 2, 3);
  const gateTrim = new THREE.MeshStandardMaterial({ color: 0x5e4a35, roughness: 0.82 });
  box(gateW - 0.2, 0.35, 1.4, gateTrim, 0, wallH, -ARENA);
  const gateGlow = new THREE.Mesh(new THREE.PlaneGeometry(gateW - 1.2, 2.4), new THREE.MeshBasicMaterial({ color: 0xff9d54, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
  gateGlow.position.set(0, 1.7, -ARENA - 0.1);
  group.add(gateGlow);

  for (let i = 0; i < 4; i++) {
    const p = new THREE.PointLight(0xff7b3c, 7, 11, 2);
    p.position.set(-gateW / 2 + 1 + i * 2.6, 1.4, -ARENA + 0.6);
    group.add(p);
  }

  /* ---------------- gate statue ---------------- */
  const bronze = new THREE.MeshStandardMaterial({ color: 0x6f5836, roughness: 0.42, metalness: 0.72 });
  const bronzeDark = new THREE.MeshStandardMaterial({ color: 0x4a3c28, roughness: 0.6, metalness: 0.55 });
  box(5.5, 0.9, 3.2, bronzeDark, 0, 0.45, -29.2);
  box(4.4, 0.45, 2.5, bronze, 0, 1.12, -29.2);
  const fishBody = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 14), bronze);
  fishBody.scale.set(2.2, 0.9, 0.6);
  fishBody.position.set(0, 2.15, -29.2);
  fishBody.rotation.z = 0.22;
  fishBody.castShadow = true;
  group.add(fishBody);
  const fishTail = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 3), bronze);
  fishTail.rotation.z = Math.PI / 2;
  fishTail.rotation.y = Math.PI / 2;
  fishTail.position.set(2.45, 2.62, -29.2);
  fishTail.scale.set(0.8, 1, 0.16);
  fishTail.castShadow = true;
  group.add(fishTail);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffcf65, emissive: 0xffa321, emissiveIntensity: 2.4, roughness: 0.3 });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), eyeMat);
    e.position.set(-1.62, 2.3, -29.2 + s * 0.55);
    group.add(e);
  }
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.55), new THREE.MeshBasicMaterial({ map: signTexture('THE CATCH', '#ffb45c'), transparent: true }));
  plaque.position.set(0, 1.25, -29.18);
  plaque.rotation.x = -0.03;
  group.add(plaque);

  /* ---------------- crates & cover ---------------- */
  const crateMats = [crateTexture('TUNA', '#c94f24'), crateTexture('SARDINE', '#356b62'), crateTexture('MACKEREL', '#8a4a7a')].map(t => new THREE.MeshStandardMaterial({ map: t, roughness: 0.86 }));
  const crateEdge = new THREE.MeshStandardMaterial({ color: 0x5b4025, roughness: 0.9 });
  function crate(x, z, s = 1.5, ry = 0, stack = 1) {
    for (let level = 0; level < stack; level++) {
      const c = box(s, s, s, crateMats[(Math.random() * crateMats.length) | 0], x + (level ? (Math.random() - 0.5) * 0.15 : 0), s / 2 + level * s, z + (level ? (Math.random() - 0.5) * 0.15 : 0), { ry: ry + (level ? (Math.random() - 0.5) * 0.2 : 0) });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry), new THREE.LineBasicMaterial({ color: 0x4a321b, transparent: true, opacity: 0.55 }));
      edges.position.copy(c.position);
      edges.rotation.copy(c.rotation);
      edges.scale.copy(c.scale);
      group.add(edges);
      if (level === 0) addCollider(x, z, s + 0.15, s + 0.15);
    }
  }
  crate(-9.5, -4.4, 1.7, 0.1, 2);
  crate(-7.6, -4.7, 1.4, -0.15, 1);
  crate(-8.7, -2.8, 1.35, 0.35, 1);
  crate(8.4, -10.5, 1.6, 0.2, 2);
  crate(10.1, -10.8, 1.3, -0.2, 1);
  crate(15.8, 10.8, 1.7, 0.1, 2);
  crate(14.2, 11.1, 1.4, -0.3, 1);
  crate(-17.5, 6.8, 1.55, 0.2, 2);
  crate(-19.2, 6.4, 1.25, -0.1, 1);
  crate(2.8, -15.2, 1.7, 0.4, 2);
  crate(4.5, -14.6, 1.35, 0.1, 1);
  crate(-2.8, 9.2, 1.6, -0.25, 1);
  crate(22.8, -12.2, 1.8, 0.3, 2);
  crate(21.1, -12.7, 1.3, 0, 1);
  crate(-24.4, -13.5, 1.65, 0.2, 2);

  function barrel(x, z, color = 0xa94324, fire = false) {
    const tex = metalTexture(color === 0x355c68 ? '#5c7479' : color === 0x496b3c ? '#60755d' : '#7e6f62');
    const mat = new THREE.MeshStandardMaterial({ map: tex, color, roughness: 0.58, metalness: 0.45 });
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.12, 18, 1), mat);
    b.position.set(x, 0.56, z);
    b.castShadow = b.receiveShadow = true;
    group.add(b);
    for (const y of [-0.38, 0.38]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.035, 6, 18), iron);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.56 + y, z);
      group.add(ring);
    }
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 18), iron);
    lid.position.set(x, 1.14, z);
    group.add(lid);
    addCollider(x, z, 1.05, 1.05);
    if (fire) {
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture('rgba(255,245,200,.95)', 'rgba(255,140,30,.6)', 'rgba(255,90,10,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffb35c }));
      fl.position.set(x, 1.45, z);
      fl.scale.set(1.25, 2.1, 1);
      group.add(fl);
      const light = new THREE.PointLight(0xff7c2a, 11, 9, 2);
      light.position.set(x, 1.7, z);
      group.add(light);
      updates.push((t, dt) => {
        const flick = 0.82 + Math.sin(t * 17 + x) * 0.1 + Math.sin(t * 33 + z) * 0.08;
        fl.scale.set(1.25 * flick, 2.1 * flick, 1);
        light.intensity = 9 + flick * 4;
      });
    }
  }
  barrel(-15.4, 3.2, 0xa94324, true);
  barrel(-14.2, 4.1, 0x355c68);
  barrel(-16.2, 4.15, 0x496b3c);
  barrel(16.7, 4.5, 0xa94324);
  barrel(17.6, 3.4, 0x355c68);
  barrel(23.6, 9.4, 0x496b3c);
  barrel(-23.9, -5.2, 0xa94324);
  barrel(25.4, -4.8, 0x355c68);

  function sandbags(x, z, ry = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 3 - row; i++) {
        const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.6, 4, 8), sandbagMat);
        bag.rotation.z = Math.PI / 2;
        bag.position.set((i - (2 - row) / 2) * 0.72, 0.29 + row * 0.38, 0);
        bag.castShadow = bag.receiveShadow = true;
        g.add(bag);
      }
    }
    group.add(g);
    addCollider(x, z, 2.4, 1.1);
  }
  sandbags(-4.5, 5.4, 0.1);
  sandbags(5.6, 12.2, -0.15);
  sandbags(11.8, -2.3, 1.3);
  sandbags(-12.9, -12.8, 0.4);

  /* ---------------- market stalls ---------------- */
  const awnMat = new THREE.MeshStandardMaterial({ map: awningTexture(), roughness: 0.9, side: THREE.DoubleSide });
  const fabricMat = new THREE.MeshStandardMaterial({ map: awningTexture(), roughness: 0.92, side: THREE.DoubleSide });
  const fishMat = new THREE.MeshStandardMaterial({ color: 0x9fb6b1, roughness: 0.5, metalness: 0.15 });
  const fishPink = new THREE.MeshStandardMaterial({ color: 0xd28c78, roughness: 0.55 });

  function stall(x, z, ry = 0, scale = 1, sign = 'FRESH FISH') {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 1.35), darkWood);
    counter.position.y = 0.45;
    counter.castShadow = counter.receiveShadow = true;
    g.add(counter);
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 1.5), new THREE.MeshStandardMaterial({ color: 0x8f714a, roughness: 0.7 }));
    top.position.y = 0.94;
    top.receiveShadow = true;
    g.add(top);
    for (const sx of [-1.9, 1.9]) {
      for (const sz of [-0.68, 0.68]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 8), darkWood);
        pole.position.set(sx, 1.6, sz);
        pole.castShadow = true;
        g.add(pole);
      }
    }
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.09, 2.2), awnMat);
    canopy.position.set(0, 3.18, 0.12);
    canopy.rotation.x = 0.12;
    canopy.castShadow = true;
    g.add(canopy);
    const valance = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.42, 0.05), fabricMat);
    valance.position.set(0, 2.95, 1.23);
    g.add(valance);
    for (let i = 0; i < 5; i++) {
      const fish = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), i % 2 ? fishMat : fishPink);
      fish.scale.set(1.9, 0.55, 0.55);
      fish.rotation.y = Math.random() * 3;
      fish.position.set(-1.6 + i * 0.8, 1.02, (Math.random() - 0.5) * 0.45);
      fish.castShadow = true;
      g.add(fish);
    }
    const board = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.65), new THREE.MeshBasicMaterial({ map: signTexture(sign, '#ffb45c'), transparent: true }));
    board.position.set(0, 2.4, 0.84);
    board.rotation.y = Math.PI;
    g.add(board);
    group.add(g);
    addCollider(x, z, 4.4 * scale, 1.7 * scale);
  }
  stall(-21, -6.2, 0.06, 1, 'FRESH FISH');
  stall(20.6, -3.7, -0.1, 1, 'Tuna & Co.');
  stall(-18.8, 16.5, Math.PI / 2, 1, 'CATNIP BAR');
  stall(19.8, -18.2, Math.PI / 2, 1, 'PAW MART');

  /* ---------------- cat trees / yarn ---------------- */
  const sisal = new THREE.MeshStandardMaterial({ color: 0xb39a6b, roughness: 1 });
  function catTree(x, z, h = 5.6) {
    const base = box(2.3, 0.35, 2.3, darkWood, x, 0.17, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, h, 10), sisal);
    post.position.set(x, h / 2, z);
    post.castShadow = true;
    group.add(post);
    for (let i = 0; i < 3; i++) {
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.25 - i * 0.15, 1.25 - i * 0.15, 0.16, 16), darkWood);
      platform.position.set(x, 1.4 + i * 1.55, z);
      platform.castShadow = platform.receiveShadow = true;
      group.add(platform);
      if (i === 1) {
        const boxHide = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x6b4c32, roughness: 0.95 }));
        boxHide.position.set(x + 0.95, 2.95, z + 0.2);
        boxHide.castShadow = true;
        group.add(boxHide);
        const hole = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), new THREE.MeshBasicMaterial({ color: 0x130d09 }));
        hole.position.set(x + 0.95, 2.97, z + 0.66);
        group.add(hole);
      }
    }
    addCollider(x, z, 2.6, 2.6);
  }
  catTree(-16.3, -16.6, 5.4);
  catTree(16.6, -14.2, 5.8);
  catTree(-24.8, 12.6, 4.6);

  const yarnColors = [0xe8a1b8, 0x8bc6b0, 0xe7c56a, 0xa8b9dd];
  function yarnBall(x, z, r = 1.25) {
    const col = yarnColors[(Math.random() * yarnColors.length) | 0];
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat);
    ball.position.set(x, r, z);
    ball.castShadow = ball.receiveShadow = true;
    group.add(ball);
    for (let i = 0; i < 4; i++) {
      const wrap = new THREE.Mesh(new THREE.TorusGeometry(r * 0.93, 0.045, 6, 28), new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }));
      wrap.position.copy(ball.position);
      wrap.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      group.add(wrap);
    }
    addCollider(x, z, r * 1.7, r * 1.7);
  }
  yarnBall(11.9, 15.7, 1.15);
  yarnBall(-20.6, 2.4, 0.9);
  yarnBall(4.2, -5.6, 0.7);

  /* ---------------- shipping container ---------------- */
  const contMat = new THREE.MeshStandardMaterial({ color: 0x355a63, roughness: 0.64, metalness: 0.3 });
  const cont = box(9.8, 2.9, 2.8, contMat, -25.7, 1.45, -24.4, { ry: 0.1 });
  for (let i = 0; i < 12; i++) {
    box(0.12, 2.7, 2.85, new THREE.MeshStandardMaterial({ color: 0x2b4b53, roughness: 0.7, metalness: 0.3 }), -30 + i * 0.8, 1.45, -24.3, { ry: 0.1, cast: false });
  }
  addCollider(-25.7, -24.4, 10, 3);
  const contSign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: signTexture('FELINE EXPRESS', '#ffc36a'), transparent: true }));
  contSign.position.set(-25.7, 2.2, -22.85);
  contSign.rotation.y = 0;
  group.add(contSign);

  /* ---------------- string lights ---------------- */
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffd08a, emissive: 0xffa43c, emissiveIntensity: 3.2, roughness: 0.3 });
  const bulbGeo = new THREE.SphereGeometry(0.07, 8, 6);
  for (let side = -1; side <= 1; side += 2) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = side * (20 + t * 10);
      const z = -18 + t * 36;
      const y = 3.3 + Math.sin(t * Math.PI) * -0.6 + side * 0.2;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.018, 4, false), new THREE.MeshBasicMaterial({ color: 0x1d1a15 }));
    group.add(cable);
    for (let i = 1; i < 12; i += 2) {
      const b = new THREE.Mesh(bulbGeo, bulbMat);
      b.position.copy(curve.getPoint(i / 12));
      b.position.y -= 0.09;
      group.add(b);
    }
  }

  /* ---------------- palms ---------------- */
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5f482d, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x394f34, roughness: 0.9, side: THREE.DoubleSide });
  function palm(x, z, h = 8) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, h, 8, 5), trunkMat);
    trunk.position.set(x, h / 2, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.12;
    trunk.castShadow = true;
    group.add(trunk);
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.3, 4, 1, true), leafMat);
      leaf.scale.set(0.75, 1, 0.08);
      leaf.position.set(x + (Math.random() - 0.5) * 0.6, h - 0.2, z + (Math.random() - 0.5) * 0.6);
      leaf.rotation.y = (i / 7) * Math.PI * 2;
      leaf.rotation.z = 1.05 + Math.random() * 0.25;
      leaf.castShadow = true;
      group.add(leaf);
    }
  }
  palm(-28, -15, 8.6);
  palm(27, -20, 7.2);
  palm(-28.5, 20.5, 6.8);
  palm(28, 18, 8.8);
  palm(-12, -30.4, 7.6);
  palm(12, -30.2, 9.1);

  /* ---------------- distant skyline ---------------- */
  const bldgMats = [0x9d7d5f, 0x8a6b54, 0xab8a68, 0x765d4a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.98 }));
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffc17a, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.random() * 0.16;
    const r = 70 + Math.random() * 30;
    const w = 8 + Math.random() * 14;
    const h = 10 + Math.random() * 24;
    const d = 7 + Math.random() * 12;
    const b = box(w, h, d, bldgMats[i % 4], Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r, { ry: -a, cast: false, receive: false });
    b.receiveShadow = false;
    if (i % 2 === 0) {
      for (let k = 0; k < 4; k++) {
        const win = box(0.8, 1.2, 0.1, winMat, Math.cos(a) * (r - d / 2 - 0.05) + (Math.random() - 0.5) * w * 0.6, 3 + k * 3.2, Math.sin(a) * (r - d / 2 - 0.05) + (Math.random() - 0.5) * w * 0.6, { ry: -a, cast: false, receive: false });
        win.receiveShadow = false;
      }
    }
  }

  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x6c5850, roughness: 1, flatShading: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const r = 118 + Math.random() * 30;
    const m = new THREE.Mesh(new THREE.ConeGeometry(28 + Math.random() * 22, 32 + Math.random() * 30, 5), mountainMat);
    m.position.set(Math.cos(a) * r, 8, Math.sin(a) * r);
    m.rotation.y = Math.random() * 3;
    group.add(m);
  }

  /* ---------------- posters & banners ---------------- */
  const posterMats = [
    posterTexture(['OBEY', 'THE CLAW'], '#d95624'),
    posterTexture(['FISH', 'FRIDAY'], '#3f6b61'),
    posterTexture(['JOIN', 'THE LITTER'], '#8f5a3d')
  ].map(t => new THREE.MeshStandardMaterial({ map: t, roughness: 0.94 }));
  for (const [x, z, ry, mat] of [[-31.4, 9, 1.5, 0], [31.4, -12, -1.5, 1], [-31.4, -21, 1.5, 2], [31.4, 19, -1.5, 0]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.8), posterMats[mat]);
    p.position.set(x, 1.8, z);
    p.rotation.y = ry;
    group.add(p);
  }

  const flagGeo = new THREE.PlaneGeometry(2.6, 1.1, 8, 3);
  const flags = [];
  for (const [x, z, ry, color] of [[-31.2, 14, 1.57, 0xd95624], [31.2, -7, -1.57, 0x3f6b61], [4.2, -31.2, 0, 0xd95624], [-7.5, -31.2, 0, 0x8f5a3d]]) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide });
    const f = new THREE.Mesh(flagGeo, mat);
    f.position.set(x, 3.1, z);
    f.rotation.y = ry;
    f.castShadow = true;
    group.add(f);
    flags.push({ mesh: f, base: f.geometry.attributes.position.array.slice(), phase: Math.random() * 6 });
  }

  /* ---------------- dust ---------------- */
  const dustCount = high ? 420 : 160;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 70;
    dustPos[i * 3 + 1] = Math.random() * 8 + 0.2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    dustSeed[i] = Math.random() * 100;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xffd9a5, size: 0.075, map: radialTexture('rgba(255,255,255,.8)', 'rgba(255,220,170,.3)', 'rgba(255,190,120,0)'), transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  /* ---------------- ambient birds ---------------- */
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2e2521, side: THREE.DoubleSide });
  const birds = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Group();
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.14), birdMat);
    const wr = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.14), birdMat);
    wl.position.x = -0.35; wr.position.x = 0.35;
    b.add(wl, wr);
    b.position.set((Math.random() - 0.5) * 70, 18 + Math.random() * 10, -20 - Math.random() * 20);
    b.scale.setScalar(0.9 + Math.random() * 0.8);
    group.add(b);
    birds.push({ g: b, wl, wr, phase: Math.random() * 8, speed: 0.18 + Math.random() * 0.2, radius: 18 + Math.random() * 20, x: b.position.x, z: b.position.z });
  }

  const spawnPoints = [
    new THREE.Vector3(0, 0, -24),
    new THREE.Vector3(-8, 0, -22),
    new THREE.Vector3(8, 0, -23),
    new THREE.Vector3(-20, 0, -20),
    new THREE.Vector3(20, 0, -18),
    new THREE.Vector3(-23, 0, -2),
    new THREE.Vector3(23, 0, -4),
    new THREE.Vector3(-14, 0, -26),
    new THREE.Vector3(14, 0, -26)
  ];

  function update(time, dt) {
    for (const u of updates) u(time, dt);
    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 1] += dt * (0.05 + (dustSeed[i] % 1) * 0.06);
      pos[i * 3] += Math.sin(time * 0.16 + dustSeed[i]) * dt * 0.055;
      if (pos[i * 3 + 1] > 8.5) pos[i * 3 + 1] = 0.2;
    }
    dustGeo.attributes.position.needsUpdate = true;
    for (const f of flags) {
      const p = f.mesh.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = f.base[i * 3];
        const y = f.base[i * 3 + 1];
        const wave = Math.sin(time * 3.4 + x * 2.5 + f.phase) * 0.18 * (x + 1.3) * 0.4;
        p.setZ(i, wave + Math.sin(time * 5 + y * 3) * 0.025);
      }
      p.needsUpdate = true;
    }
    for (const b of birds) {
      const t = time * b.speed + b.phase;
      b.g.position.x = Math.cos(t) * b.radius;
      b.g.position.z = -24 + Math.sin(t) * b.radius * 0.55;
      b.g.rotation.y = -t;
      const flap = Math.sin(time * 8 + b.phase) * 0.7;
      b.wl.rotation.z = flap;
      b.wr.rotation.z = -flap;
    }
  }

  return {
    group, colliders, spawnPoints, update, sky,
    sunDir,
    bounds: ARENA - 1.2,
    dispose() {
      scene.remove(group);
      group.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose(); }
        }
      });
    }
  };
}
