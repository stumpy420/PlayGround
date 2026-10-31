import * as THREE from '../vendor/three.module.js';
import { BUSINESSES, DISTRICTS, WEATHER } from './data.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const palette = {
  asphalt:'#1b2021', sidewalk:'#454d4c', curb:'#69706d', concrete:'#5d625f',
  roof:'#202627', steel:'#5a6464', bark:'#3b2c24', pine1:'#173b2f', pine2:'#1d4a38', pine3:'#24573f',
  water:'#1a3d49', bay:'#183946', fog:'#6c7c7f', neonRed:'#ff4338', neonTeal:'#7fe3d2'
};

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeFacadeTexture(base, accent, seed, style='brick') {
  const rnd = mulberry32(seed);
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    if (style === 'brick') {
      ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 9) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        for (let x = ((y / 9) % 2) * 11; x < w; x += 22) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9); ctx.stroke();
        }
      }
    } else if (style === 'panel') {
      ctx.strokeStyle = 'rgba(255,255,255,.055)'; ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    }
    const cols = style === 'warehouse' ? 3 : 4;
    const rows = style === 'warehouse' ? 3 : 6;
    const mw = 28, mh = 17, gx = (w - cols * mw) / (cols + 1), gy = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gx + c * (mw + gx), y = gy + r * (mh + 11);
        ctx.fillStyle = 'rgba(8,12,13,.72)';
        ctx.fillRect(x, y, mw, mh);
        const lit = rnd() < 0.22;
        ctx.fillStyle = lit ? (rnd() < .3 ? 'rgba(255,179,92,.7)' : 'rgba(127,227,210,.26)') : 'rgba(54,76,80,.25)';
        ctx.fillRect(x + 2, y + 2, mw - 4, mh - 4);
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + mw / 2, y + 2); ctx.lineTo(x + mw / 2, y + mh - 2); ctx.stroke();
        if (lit) {
          ctx.fillStyle = 'rgba(255,220,170,.08)';
          ctx.fillRect(x - 4, y + mh, mw + 8, 8);
        }
      }
    }
    const grad = ctx.createLinearGradient(0, h - 34, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = grad; ctx.fillRect(0, h - 34, w, 34);
    ctx.fillStyle = accent; ctx.globalAlpha = .25; ctx.fillRect(0, 0, w, 2); ctx.globalAlpha = 1;
  });
}

function makeSignTexture(text, fg, bg, sub='') {
  return canvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = fg; ctx.shadowBlur = 18;
    ctx.fillStyle = fg;
    const size = text.length > 16 ? 46 : 58;
    ctx.font = `400 ${size}px Bebas, sans-serif`;
    ctx.fillText(text, w / 2, sub ? h / 2 - 10 : h / 2);
    if (sub) {
      ctx.shadowBlur = 0; ctx.font = '400 14px Plex, monospace'; ctx.fillStyle = 'rgba(233,228,216,.7)';
      ctx.fillText(sub, w / 2, h - 27);
    }
  });
}

function makeGlowTexture(color) {
  return canvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, color); g.addColorStop(.25, color + 'aa'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

const shared = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  cone: new THREE.ConeGeometry(1, 1, 7),
  plane: new THREE.PlaneGeometry(1, 1),
  wheel: new THREE.CylinderGeometry(.34, .34, .26, 10)
};

export class World {
  constructor(scene, renderer, state) {
    this.scene = scene;
    this.renderer = renderer;
    this.state = state;
    this.colliders = [];
    this.interactables = [];
    this.markers = [];
    this.roadLines = [];
    this.traffic = [];
    this.parked = [];
    this.buildingGroups = [];
    this.weirdObjects = [];
    this.rng = mulberry32(481516);
    this.time = 0;
    this.rainCount = 0;
    this.weather = 'rain';
    this.weirdness = .1;
    this.arena = { x:420, z:-300, y:0 };
    this.spawn = { x:-18, z:58, yaw:Math.PI };
    this.districtMarkers = DISTRICTS;
    this.districtZones = [];
    this.puddles = [];
    this.streetLights = [];
    this.neonLights = [];
    this.arenaCrowd = [];
    this.ghostGroup = null;
    this.oceanDowntown = null;
    this.rain = null;
    this.fogParticles = null;
    this.vehicles = [];
    this.sky = null;
    this.sun = null;
    this.hemi = null;
    this.moon = null;
    this.buildingTextures = [];
    this.crowdGroup = null;
    this.lastDistrict = '';
    this.simulation = 0;
    this.arenaEntered = false;
  }

  async build(progress = () => {}) {
    progress(.08, 'RAISING THE COAST');
    this.buildSky();
    this.buildLights();
    this.buildTerrain();
    this.buildMountBaker();
    progress(.2, 'POURING WET ASPHALT');
    this.buildRoads();
    progress(.34, 'STACKING BRICKS');
    this.buildBuildings();
    progress(.58, 'PLANTING CEDARS');
    this.buildTrees();
    this.buildStreetFurniture();
    progress(.7, 'WAKING THE TRAFFIC');
    this.buildTraffic();
    this.buildWaterfront();
    this.buildArena();
    this.buildWeirdLayers();
    progress(.86, 'TUNING THE RAIN');
    this.buildWeather();
    this.buildWildlife();
    progress(.95, 'FORGETTING YOUR NAME');
    this.refreshInteractables();
    await new Promise(r => setTimeout(r, 80));
    progress(1, 'BELLINGHAM IS AWAKE');
  }

  buildSky() {
    const geo = new THREE.SphereGeometry(1200, 32, 18);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms: {
        uTop: { value: new THREE.Color('#26383f') },
        uBottom: { value: new THREE.Color('#a9b5b3') },
        uCloud: { value: new THREE.Color('#11191b') },
        uTime: { value: 0 },
        uStorm: { value: 0 },
        uNight: { value: 0 }
      },
      vertexShader: `varying vec3 vPos; void main(){ vPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        precision highp float;
        varying vec3 vPos;
        uniform vec3 uTop, uBottom, uCloud;
        uniform float uTime, uStorm, uNight;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
        float fbm(vec2 p){ float v=0.0,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
        void main(){
          vec3 d = normalize(vPos - cameraPosition);
          float h = clamp(d.y*1.1+.05,0.0,1.0);
          vec3 col = mix(uBottom, uTop, pow(h,.62));
          float horizon = smoothstep(-.12,.4,d.y);
          vec2 p = d.xz/(max(.08,d.y+.22))*1.6 + vec2(uTime*.004,uTime*.002);
          float c = fbm(p*1.2);
          float c2 = fbm(p*3.1+7.0);
          float clouds = smoothstep(.35,.75,c)*.65 + smoothstep(.58,.8,c2)*.22;
          col = mix(col, uCloud, clouds*horizon*.9);
          float glow = pow(max(0.0,dot(d,normalize(vec3(-.35,.25,-.8)))),8.0);
          col += vec3(.23,.18,.13)*glow*(1.0-uNight)*.7;
          col += uStorm*vec3(.07,.02,.02)*smoothstep(.1,.9,c2);
          gl_FragColor = vec4(col,1.0);
        }`
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);

    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 260; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(1000);
      if (v.y < 80) continue;
      starPos.push(v.x, v.y, v.z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xbfd0d0, size:1.4, transparent:true, opacity:0, depthWrite:false }));
    this.scene.add(this.stars);
  }

  buildLights() {
    this.hemi = new THREE.HemisphereLight(0xa8bdbd, 0x26302b, 1.02);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xe6efe8, 1.15);
    this.sun.position.set(-120, 190, -140);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 340;
    this.sun.shadow.camera.left = -95;
    this.sun.shadow.camera.right = 95;
    this.sun.shadow.camera.top = 95;
    this.sun.shadow.camera.bottom = -95;
    this.sun.shadow.bias = -.001;
    this.scene.add(this.sun);
    const fill = new THREE.DirectionalLight(0x6c8a94, .55);
    fill.position.set(100, 80, 150);
    this.scene.add(fill);
    this.scene.fog = new THREE.FogExp2(0x708083, .0027);
    this.scene.background = new THREE.Color(0x718184);
  }

  buildTerrain() {
    const geo = new THREE.PlaneGeometry(1500, 1500, 90, 90);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let y = 0;
      const d = Math.hypot(x, z);
      const lake = x > 260 && x < 460 && z > -120 && z < 170;
      const bay = z > 242;
      if (bay) y = -3.2 - Math.max(0, z - 242) * .012;
      else if (lake) y = -3.6;
      else {
        if (x > 250) y += Math.max(0, (x - 250) * .22) * (0.55 + Math.sin(z * .015) * .15);
        if (z < -235) y += Math.max(0, (-z - 235) * .18);
        if (x < -285) y += Math.max(0, (-x - 285) * .2);
        if (z > 230 && !bay) y += Math.max(0, (z - 230) * .12);
        const n = Math.sin(x * .025) * Math.cos(z * .021) * 1.4 + Math.sin(x * .071 + z * .043) * .4;
        if (d > 270) y += n * clamp((d - 270) / 150, 0, 1);
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color:0x27332c, roughness:.93, metalness:.02, vertexColors:false });
    this.ground = new THREE.Mesh(geo, mat);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // mossy city floor patches
    const patchMat = new THREE.MeshStandardMaterial({ color:0x2e3d32, roughness:1 });
    for (let i = 0; i < 36; i++) {
      const p = new THREE.Mesh(shared.plane, patchMat);
      const x = this.rng() * 460 - 230, z = this.rng() * 420 - 210;
      if (this.nearRoad(x, z, 9)) continue;
      p.position.set(x, .012, z);
      p.rotation.x = -Math.PI / 2; p.rotation.z = this.rng() * TAU;
      p.scale.set(4 + this.rng() * 18, 4 + this.rng() * 13, 1);
      this.scene.add(p);
    }

    // bay + lake water
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(700, 420, 80, 50), this.waterMaterial());
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.set(0, -.6, 440);
    this.scene.add(this.water);
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(230, 300, 40, 50), this.waterMaterial(0x1e4651));
    lake.rotation.x = -Math.PI / 2; lake.position.set(360, -.8, 28); lake.rotation.z = .03;
    this.scene.add(lake);
    this.lake = lake;

    // shoreline foam
    const foamMat = new THREE.MeshBasicMaterial({ color:0x8ba6a6, transparent:true, opacity:.14, side:THREE.DoubleSide, depthWrite:false });
    for (let i = 0; i < 5; i++) {
      const f = new THREE.Mesh(shared.plane, foamMat);
      f.rotation.x = -Math.PI / 2; f.position.set(-80 + i * 55, .1, 238 + i * 2);
      f.scale.set(40 + i * 10, 2.2, 1); this.scene.add(f);
    }
  }

  waterMaterial(color = 0x1b3d47) {
    return new THREE.ShaderMaterial({
      transparent:true, side:THREE.DoubleSide, depthWrite:true,
      uniforms:{ uTime:{value:0}, uDeep:{value:new THREE.Color(0x0c2027)}, uShallow:{value:new THREE.Color(color)}, uSky:{value:new THREE.Color(0x6c8183)}, uStorm:{value:0} },
      vertexShader:`varying vec2 vUv; varying vec3 vW; uniform float uTime; void main(){ vUv=uv; vec3 p=position; p.z += sin(p.x*.055+uTime*.55)*.35 + sin(p.y*.08-uTime*.42)*.22; vec4 w=modelMatrix*vec4(p,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader:`varying vec2 vUv; varying vec3 vW; uniform float uTime,uStorm; uniform vec3 uDeep,uShallow,uSky;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
        void main(){ vec2 p=vUv*vec2(40.,24.); float w=sin(p.x*1.3+uTime*.7)+sin(p.y*1.8-uTime*.5)+sin((p.x+p.y)*.7+uTime*.3); w=w/3.*.5+.5;
          vec3 col=mix(uDeep,uShallow,w*.65); vec3 view=normalize(cameraPosition-vW); float fres=pow(1.0-max(0.0,view.y),2.2); col=mix(col,uSky,fres*.32);
          float glint=pow(w,12.)*.22; col+=glint*vec3(.7,.82,.82);
          col+=uStorm*vec3(.06,.01,.01); float foam=smoothstep(.82,.97,w)*.1; col=mix(col,vec3(.7,.8,.8),foam);
          gl_FragColor=vec4(col,.95); }`
    });
  }

  buildMountBaker() {
    const mountMat = new THREE.MeshBasicMaterial({ color:0x536568, fog:false });
    const snowMat = new THREE.MeshBasicMaterial({ color:0xc5d1ce, fog:false });
    const ridgeMat = new THREE.MeshBasicMaterial({ color:0x3f5254, fog:false });
    const mountain = new THREE.Group();
    const base = new THREE.Mesh(new THREE.ConeGeometry(210, 320, 9, 1), mountMat);
    base.position.y = 100; mountain.add(base);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(102, 168, 9, 1), snowMat);
    snow.position.y = 180; mountain.add(snow);
    const peak = new THREE.Mesh(new THREE.ConeGeometry(28, 60, 7), snowMat);
    peak.position.y = 290; mountain.add(peak);
    mountain.position.set(135, -30, -900);
    this.mountain = mountain;
    this.scene.add(mountain);

    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.ConeGeometry(100 + i * 22, 150 + i * 28, 6), ridgeMat);
      r.position.set(-500 + i * 190, 20, -780 - i * 24);
      r.rotation.y = i * .4;
      this.scene.add(r);
    }
    // low forest ridge east
    for (let i = 0; i < 8; i++) {
      const r = new THREE.Mesh(new THREE.ConeGeometry(85, 90 + this.rng() * 50, 6), new THREE.MeshBasicMaterial({ color:0x243a32, fog:false }));
      r.position.set(380 + i * 55, 20, -100 + this.rng() * 240);
      this.scene.add(r);
    }
  }

  buildRoads() {
    const roadMat = new THREE.MeshStandardMaterial({ color:0x191f20, roughness:.26, metalness:.5 });
    const walkMat = new THREE.MeshStandardMaterial({ color:0x4a504e, roughness:.78, metalness:.08 });
    const curbMat = new THREE.MeshStandardMaterial({ color:0x686e6a, roughness:.85 });
    const markMat = new THREE.MeshBasicMaterial({ color:0x9d9a78 });
    const xs = [-130, -70, -10, 50, 110, 170];
    const zs = [-170, -110, -50, 10, 70, 130, 190];
    const roadW = 12, walkW = 4.2;
    const addStrip = (x, z, w, d, y, mat) => {
      const m = new THREE.Mesh(shared.box, mat);
      m.position.set(x, y, z); m.scale.set(w, .06, d); m.receiveShadow = true; this.scene.add(m);
    };
    for (const x of xs) {
      addStrip(x, 10, roadW + walkW * 2, 420, .015, walkMat);
      addStrip(x, 10, roadW, 420, .035, roadMat);
      addStrip(x - roadW / 2 - walkW / 2, 10, .22, 420, .075, curbMat);
      addStrip(x + roadW / 2 + walkW / 2, 10, .22, 420, .075, curbMat);
    }
    for (const z of zs) {
      addStrip(20, z, 460, roadW + walkW * 2, .016, walkMat);
      addStrip(20, z, 460, roadW, .037, roadMat);
      addStrip(20, z - roadW / 2 - walkW / 2, 460, .22, .076, curbMat);
      addStrip(20, z + roadW / 2 + walkW / 2, 460, .22, .076, curbMat);
    }
    // dashed lane marks
    const dashGeo = new THREE.BoxGeometry(.14, .01, 2.1);
    const dashPositions = [];
    for (const x of xs) for (let z = -198; z < 210; z += 9) if (!this.nearIntersection(x, z, 10)) dashPositions.push([x, z, 0]);
    for (const z of zs) for (let x = -208; x < 228; x += 9) if (!this.nearIntersection(x, z, 10)) dashPositions.push([x, z, 1]);
    const dashes = new THREE.InstancedMesh(dashGeo, markMat, dashPositions.length);
    const dummy = new THREE.Object3D();
    dashPositions.forEach(([x, z, rot], i) => {
      dummy.position.set(x, .073, z); dummy.rotation.set(0, rot ? Math.PI / 2 : 0, 0); dummy.updateMatrix(); dashes.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(dashes);

    // crosswalks
    const crossMat = new THREE.MeshBasicMaterial({ color:0x8d9086, transparent:true, opacity:.6 });
    for (const x of xs) for (const z of zs) {
      for (let i = -4; i <= 4; i++) {
        const m = new THREE.Mesh(shared.box, crossMat);
        m.position.set(x + i * 1.35, .078, z + 8.3); m.scale.set(.62, .01, 2.6); this.scene.add(m);
      }
    }

    // puddles
    const puddleMat = new THREE.MeshPhysicalMaterial({ color:0x17262b, roughness:.03, metalness:.72, transparent:true, opacity:.55, depthWrite:false });
    for (let i = 0; i < 54; i++) {
      const p = new THREE.Mesh(new THREE.CircleGeometry(1, 18), puddleMat);
      let x, z;
      if (i < 30) { x = xs[Math.floor(this.rng() * xs.length)] + (this.rng() - .5) * 7; z = this.rng() * 400 - 200; }
      else { z = zs[Math.floor(this.rng() * zs.length)] + (this.rng() - .5) * 7; x = this.rng() * 420 - 190; }
      p.rotation.x = -Math.PI / 2; p.position.set(x, .083, z);
      p.scale.set(1.5 + this.rng() * 4.5, .5 + this.rng() * 1.4, 1);
      this.scene.add(p); this.puddles.push(p);
    }
    this.roadXs = xs; this.roadZs = zs;
  }

  nearRoad(x, z, margin = 8) {
    const xs = [-130, -70, -10, 50, 110, 170], zs = [-170, -110, -50, 10, 70, 130, 190];
    return xs.some(v => Math.abs(x - v) < margin) || zs.some(v => Math.abs(z - v) < margin);
  }

  nearIntersection(x, z, margin = 8) {
    return this.roadXs?.some(rx => Math.abs(x - rx) < margin) && this.roadZs?.some(rz => Math.abs(z - rz) < margin);
  }

  buildBuildings() {
    const bizById = new Map(BUSINESSES.map(b => [b.id, b]));
    const used = [];
    const styles = ['brick','panel','warehouse'];
    const facades = [];
    for (let i = 0; i < 18; i++) {
      const base = ['#4d524e','#594e45','#455052','#5f5549','#3f494a','#5f5c51'][i % 6];
      const accent = ['#ffb35c','#7fe3d2','#e9e4d8','#ff4338','#86c68f'][i % 5];
      facades.push(makeFacadeTexture(base, accent, 900 + i * 31, styles[i % 3]));
    }
    this.buildingTextures = facades;

    // Landmarks
    for (const b of BUSINESSES) {
      const isPark = ['park','trail','pier','marina','lake'].includes(b.type);
      if (isPark) { this.buildLandmarkPark(b); continue; }
      this.buildLandmark(b);
      used.push(b);
    }

    // Filler blocks
    const blockCenters = [];
    for (const x of this.roadXs) for (const z of this.roadZs) blockCenters.push([x, z]);
    for (let bx = -190; bx <= 230; bx += 60) {
      for (let bz = -220; bz <= 210; bz += 60) {
        if (this.nearRoad(bx, bz, 15)) continue;
        const inLake = bx > 245 && bz > -100 && bz < 150;
        if (inLake) continue;
        const bizNear = BUSINESSES.some(b => Math.hypot(b.x - bx, b.z - bz) < 31);
        if (bizNear) continue;
        const district = this.districtAt(bx, bz).id;
        const count = district === 'downtown' ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const ox = (this.rng() - .5) * 24, oz = (this.rng() - .5) * 24;
          const x = bx + ox, z = bz + oz;
          if (this.nearRoad(x, z, 12)) continue;
          if (BUSINESSES.some(b => Math.hypot(b.x - x, b.z - z) < Math.max(b.w, b.d) / 2 + 11)) continue;
          const w = 9 + this.rng() * 15, d = 8 + this.rng() * 13;
          let h = 7 + this.rng() * 13;
          if (district === 'downtown') h = 11 + this.rng() * 32;
          if (district === 'fairhaven' || district === 'residential') h = 7 + this.rng() * 11;
          if (district === 'industrial') h = 6 + this.rng() * 8;
          if (district === 'campus') h = 10 + this.rng() * 18;
          const tex = facades[Math.floor(this.rng() * facades.length)];
          const mat = new THREE.MeshStandardMaterial({ map:tex, roughness:.72, metalness:.12, color:0xb8bcb9 });
          const roofMat = new THREE.MeshStandardMaterial({ color:0x242a29, roughness:.9 });
          const mesh = new THREE.Mesh(shared.box, [mat,mat,roofMat,roofMat,mat,mat]);
          mesh.position.set(x, h / 2, z); mesh.scale.set(w, h, d);
          mesh.receiveShadow = true; mesh.castShadow = h < 20;
          this.scene.add(mesh);
          this.colliders.push({ minX:x - w / 2, maxX:x + w / 2, minZ:z - d / 2, maxZ:z + d / 2, h, type:'building' });
          if (this.rng() < .4) this.addRoofDetails(x, z, w, d, h);
        }
      }
    }
    // Commercial signs on filler buildings near roads
    this.buildGenericSigns();
  }

  buildLandmark(b) {
    const style = b.type === 'industrial' ? 'warehouse' : (b.type === 'home' ? 'brick' : 'panel');
    const tex = makeFacadeTexture(b.color, b.accent, 200 + b.id.length * 77, style);
    const mat = new THREE.MeshStandardMaterial({ map:tex, roughness:.65, metalness:.16, color:0xffffff });
    const roofMat = new THREE.MeshStandardMaterial({ color:0x1e2424, roughness:.9 });
    const mesh = new THREE.Mesh(shared.box, [mat,mat,roofMat,roofMat,mat,mat]);
    mesh.position.set(b.x, b.h / 2, b.z); mesh.scale.set(b.w, b.h, b.d);
    mesh.receiveShadow = true; mesh.castShadow = true;
    this.scene.add(mesh);
    mesh.userData.business = b.id;
    this.buildingGroups.push(mesh);
    this.colliders.push({ minX:b.x - b.w / 2, maxX:b.x + b.w / 2, minZ:b.z - b.d / 2, maxZ:b.z + b.d / 2, h:b.h, type:'building', id:b.id });

    // storefront glow
    const frontZ = b.z + b.d / 2 + .02;
    const frontMat = new THREE.MeshBasicMaterial({ color:new THREE.Color(b.accent), transparent:true, opacity:.18 });
    const front = new THREE.Mesh(shared.plane, frontMat);
    front.position.set(b.x, 2.2, frontZ); front.scale.set(b.w * .74, 3.1, 1); this.scene.add(front);
    // sign
    if (b.type !== 'home') {
      const signTex = makeSignTexture(b.sign, b.accent, '#0a0f10', b.desc.slice(0, 46).toUpperCase());
      const signMat = new THREE.MeshBasicMaterial({ map:signTex, transparent:true, toneMapped:false });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(b.w * .86, 12), 2.2), signMat);
      sign.position.set(b.x, Math.min(b.h - 1.2, 6.3), frontZ + .03);
      this.scene.add(sign);
      this.markers.push({ id:b.id, x:b.x, z:b.z, type:'business', label:b.name, color:b.accent });
    } else {
      this.markers.push({ id:b.id, x:b.x, z:b.z, type:'home', label:b.name, color:b.accent });
    }
    // awnings
    if (['cafe','bar','restaurant','club','store','bookstore'].includes(b.type)) {
      const awningMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(b.accent).multiplyScalar(.5), roughness:.8 });
      const awning = new THREE.Mesh(shared.box, awningMat);
      awning.position.set(b.x, 3.9, frontZ + .8); awning.scale.set(b.w * .8, .14, 1.8); this.scene.add(awning);
    }
    // rooftop detail
    this.addRoofDetails(b.x, b.z, b.w, b.d, b.h);
    // interactable entrance
    this.interactables.push({
      id:'biz_' + b.id, label:b.name, sub:b.type.toUpperCase(), x:b.entry.x, z:b.entry.z,
      radius:4.2, action:'business', business:b.id, type:'business'
    });
    // neon point lights for select businesses
    if (['cafe','bar','club','gym','restaurant'].includes(b.type)) {
      const col = new THREE.Color(b.accent);
      const pl = new THREE.PointLight(col, 8, 18, 2);
      pl.position.set(b.entry.x, 4.1, b.entry.z + 1.5);
      this.scene.add(pl); this.neonLights.push(pl);
    }
  }

  buildLandmarkPark(b) {
    if (b.type === 'pier') {
      const deckMat = new THREE.MeshStandardMaterial({ color:0x3c4745, roughness:.78 });
      const deck = new THREE.Mesh(shared.box, deckMat);
      deck.position.set(b.x, .5, b.z); deck.scale.set(b.w, .3, b.d); this.scene.add(deck);
      for (let i = -1; i <= 1; i++) {
        const post = new THREE.Mesh(shared.cyl, new THREE.MeshStandardMaterial({ color:0x2e3837, roughness:.9 }));
        post.position.set(b.x + i * 4, -1, b.z + b.d / 2); post.scale.set(.2, 5, .2); this.scene.add(post);
      }
      this.interactables.push({ id:'pier', label:'Cormorant Pier', sub:'LOOK AT THE WATER', x:b.entry.x, z:b.entry.z, radius:4, action:'pier', type:'place' });
      this.markers.push({ id:'pier', x:b.x, z:b.z, type:'place', label:b.name, color:b.accent });
      return;
    }
    if (b.type === 'marina') {
      const deckMat = new THREE.MeshStandardMaterial({ color:0x3b4643, roughness:.82 });
      const deck = new THREE.Mesh(shared.box, deckMat);
      deck.position.set(b.x, .45, b.z + 4); deck.scale.set(30, .25, 18); this.scene.add(deck);
      for (let i = 0; i < 4; i++) {
        const boat = new THREE.Group();
        const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 3.5, 4, 8), new THREE.MeshStandardMaterial({ color:[0x9c4a3a,0x3c5a62,0xd0c9b8,0x3d443f][i], roughness:.6 }));
        hull.rotation.z = Math.PI / 2; hull.position.y = .3; boat.add(hull);
        const mast = new THREE.Mesh(shared.cyl, new THREE.MeshStandardMaterial({ color:0x7d827c }));
        mast.scale.set(.05, 5, .05); mast.position.y = 2.7; boat.add(mast);
        boat.position.set(b.x - 10 + i * 6, -.4, b.z + 8 + (i % 2) * 4); boat.rotation.y = .2; this.scene.add(boat);
      }
      this.interactables.push({ id:'biz_' + b.id, label:b.name, sub:'DOCKS', x:b.entry.x, z:b.entry.z, radius:4.2, action:'business', business:b.id, type:'business' });
      this.markers.push({ id:b.id, x:b.x, z:b.z, type:'business', label:b.name, color:b.accent });
      return;
    }
    if (b.type === 'lake') {
      const dock = new THREE.Mesh(shared.box, new THREE.MeshStandardMaterial({ color:0x3b4542, roughness:.8 }));
      dock.position.set(b.x, .2, b.z); dock.scale.set(9, .18, 24); this.scene.add(dock);
      this.interactables.push({ id:'biz_' + b.id, label:b.name, sub:'MIRROR WATER', x:b.entry.x, z:b.entry.z, radius:4.5, action:'business', business:b.id, type:'business' });
      this.markers.push({ id:b.id, x:b.x, z:b.z, type:'business', label:b.name, color:b.accent });
      return;
    }
    if (b.type === 'trail') {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ map:makeSignTexture(b.sign, b.accent, '#101815', 'TRAILHEAD · MILE 0'), transparent:true }));
      sign.position.set(b.entry.x, 2.5, b.entry.z + 1); this.scene.add(sign);
      const postMat = new THREE.MeshStandardMaterial({ color:0x3b3027 });
      for (const dx of [-2,2]) { const p = new THREE.Mesh(shared.cyl, postMat); p.position.set(b.entry.x + dx, 1.3, b.entry.z + 1); p.scale.set(.08,2.6,.08); this.scene.add(p); }
      this.interactables.push({ id:'biz_' + b.id, label:b.name, sub:'TRAILHEAD', x:b.entry.x, z:b.entry.z, radius:4.5, action:'business', business:b.id, type:'business' });
      this.markers.push({ id:b.id, x:b.x, z:b.z, type:'business', label:b.name, color:b.accent });
      return;
    }
    // parks
    const grass = new THREE.Mesh(shared.plane, new THREE.MeshStandardMaterial({ color:0x2b4132, roughness:1 }));
    grass.rotation.x = -Math.PI / 2; grass.position.set(b.x, .02, b.z); grass.scale.set(b.w, b.d, 1); this.scene.add(grass);
    const pathMat = new THREE.MeshStandardMaterial({ color:0x5d5c4f, roughness:.95 });
    const path = new THREE.Mesh(shared.box, pathMat);
    path.position.set(b.x, .04, b.z); path.scale.set(b.w * .65, .04, 2.4); this.scene.add(path);
    // gazebo for Elizabeth Park
    if (b.id === 'old_park') {
      const gaz = new THREE.Group();
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.6, 8), new THREE.MeshStandardMaterial({ color:0x353d39, roughness:.8 }));
      roof.position.y = 3.4; gaz.add(roof);
      for (let i = 0; i < 6; i++) {
        const post = new THREE.Mesh(shared.cyl, new THREE.MeshStandardMaterial({ color:0x6b6a5f }));
        post.scale.set(.09, 2.7, .09); post.position.set(Math.cos(i / 6 * TAU) * 3.2, 1.3, Math.sin(i / 6 * TAU) * 3.2); gaz.add(post);
      }
      gaz.position.set(b.x + 7, 0, b.z - 4); this.scene.add(gaz);
    }
    this.interactables.push({ id:'biz_' + b.id, label:b.name, sub:'PUBLIC PARK', x:b.entry.x, z:b.entry.z, radius:5, action:'business', business:b.id, type:'business' });
    this.markers.push({ id:b.id, x:b.x, z:b.z, type:'business', label:b.name, color:b.accent });
  }

  addRoofDetails(x, z, w, d, h) {
    const mat = new THREE.MeshStandardMaterial({ color:0x2b3130, roughness:.85 });
    const n = 1 + Math.floor(this.rng() * 3);
    for (let i = 0; i < n; i++) {
      const box = new THREE.Mesh(shared.box, mat);
      const sx = .8 + this.rng() * 2.4, sy = .4 + this.rng() * 1.2, sz = .8 + this.rng() * 2.2;
      box.position.set(x + (this.rng() - .5) * w * .55, h + sy / 2, z + (this.rng() - .5) * d * .55);
      box.scale.set(sx, sy, sz); this.scene.add(box);
    }
    if (this.rng() < .3) {
      const ant = new THREE.Mesh(shared.cyl, new THREE.MeshStandardMaterial({ color:0x777e7b }));
      ant.position.set(x, h + 2.2, z); ant.scale.set(.035, 4.4, .035); this.scene.add(ant);
    }
  }

  buildGenericSigns() {
    const names = ['RAIN CITY LAUNDRY','THE FERN & FOAM','CASCADIA HARDWARE','NORTHWEST TAX','MOSS BOOKS','RAILROAD NOODLE','SALMON BERRY','THE GREY GULL','PACIFIC NOTARY','LOW TIDE RECORDS','CEDAR & SALT','HARBOR LIGHT'];
    const colors = ['#ffb35c','#7fe3d2','#e9e4d8','#ff4338','#d9a6ff'];
    const rnd = mulberry32(8921);
    for (let i = 0; i < 20; i++) {
      const x = -180 + rnd() * 400, z = -210 + rnd() * 400;
      if (this.nearRoad(x, z, 7)) continue;
      const name = names[i % names.length];
      const col = colors[i % colors.length];
      const tex = makeSignTexture(name, col, '#0b1011', 'EST. 20' + (10 + (i % 15)));
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.7), new THREE.MeshBasicMaterial({ map:tex, transparent:true, toneMapped:false }));
      sign.position.set(x, 4.3, z); sign.rotation.y = rnd() < .5 ? 0 : Math.PI; this.scene.add(sign);
    }
  }

  buildTrees() {
    const count = 760;
    const trunkGeo = new THREE.CylinderGeometry(.12, .2, 3, 5);
    const coneGeo = new THREE.ConeGeometry(1, 2.4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color:0x3a2b23, roughness:1 });
    const foliageMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.95, flatShading:true });
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const layers = [0,1,2].map(() => new THREE.InstancedMesh(coneGeo, foliageMat, count));
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let placed = 0, attempts = 0;
    while (placed < count && attempts < 4000) {
      attempts++;
      let x, z;
      const mode = this.rng();
      if (mode < .52) { x = -360 + this.rng() * 760; z = -360 + this.rng() * 800; }
      else if (mode < .75) { x = 190 + this.rng() * 300; z = -260 + this.rng() * 460; }
      else { x = -420 + this.rng() * 330; z = -340 + this.rng() * 700; }
      if (x > 255 && z > -115 && z < 165) continue;
      if (z > 235) continue;
      if (Math.abs(x) < 230 && z > -230 && z < 230 && this.rng() < .82) continue;
      if (this.nearRoad(x, z, 7) && Math.abs(x) < 220 && Math.abs(z) < 220) continue;
      if (this.colliders.some(c => x > c.minX - 2 && x < c.maxX + 2 && z > c.minZ - 2 && z < c.maxZ + 2)) continue;
      const s = .6 + this.rng() * 1.5;
      dummy.position.set(x, 1.4 * s, z); dummy.rotation.y = this.rng() * TAU; dummy.scale.set(s, s, s); dummy.updateMatrix();
      trunks.setMatrixAt(placed, dummy.matrix);
      const shade = .72 + this.rng() * .4;
      color.setRGB(.07 * shade, .22 * shade, .14 * shade);
      for (let l = 0; l < 3; l++) {
        dummy.position.set(x, (2.6 + l * 1.15) * s, z);
        dummy.scale.set((1.35 - l * .26) * s, (1.15 - l * .14) * s, (1.35 - l * .26) * s);
        dummy.rotation.y = this.rng() * TAU; dummy.updateMatrix();
        layers[l].setMatrixAt(placed, dummy.matrix);
        layers[l].setColorAt(placed, color);
      }
      placed++;
    }
    trunks.count = placed; layers.forEach(l => { l.count = placed; l.instanceMatrix.needsUpdate = true; if (l.instanceColor) l.instanceColor.needsUpdate = true; });
    trunks.castShadow = true; trunks.receiveShadow = true;
    layers.forEach(l => { l.castShadow = true; l.receiveShadow = true; this.scene.add(l); });
    this.scene.add(trunks);
    this.treeLayers = layers;

    // street trees near start and parks
    for (let i = 0; i < 18; i++) {
      const x = -180 + i * 19, z = [18, 62, 105][i % 3];
      if (this.colliders.some(c => x > c.minX - 2 && x < c.maxX + 2 && z > c.minZ - 2 && z < c.maxZ + 2)) continue;
      this.addDetailedTree(x, z, .7 + this.rng() * .5);
    }
  }

  addDetailedTree(x, z, s = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18 * s, .3 * s, 4.2 * s, 6), new THREE.MeshStandardMaterial({ color:0x3b2a21, roughness:1 }));
    trunk.position.y = 2.1 * s; g.add(trunk);
    const mat = new THREE.MeshStandardMaterial({ color:0x1a412f, roughness:.95, flatShading:true });
    for (let l = 0; l < 4; l++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry((2.3 - l * .35) * s, (2.1 - l * .16) * s, 7), mat);
      c.position.y = (3.6 + l * 1.3) * s; g.add(c);
    }
    g.position.set(x, 0, z); this.scene.add(g);
    return g;
  }

  buildStreetFurniture() {
    const poleMat = new THREE.MeshStandardMaterial({ color:0x353d3b, roughness:.8, metalness:.3 });
    const lampMat = new THREE.MeshBasicMaterial({ color:0xffcf8a, toneMapped:false });
    const positions = [];
    for (const x of this.roadXs) for (let z = -150; z <= 190; z += 42) positions.push([x + 8, z, 0]);
    for (const z of this.roadZs) for (let x = -170; x <= 200; x += 52) positions.push([x, z + 8, 1]);
    positions.forEach(([x,z,rot], i) => {
      if (i > 58) return;
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .11, 6.2, 6), poleMat);
      pole.position.y = 3.1; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, .08, .08), poleMat);
      arm.position.set(rot ? 0 : 1, 6.1, rot ? 1 : 0); g.add(arm);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(.7, .16, .25), lampMat);
      lamp.position.set(rot ? 0 : 1.9, 6, rot ? 1.9 : 0); g.add(lamp);
      g.position.set(x, 0, z); g.rotation.y = rot ? Math.PI / 2 : 0; this.scene.add(g);
      if (i < 11) {
        const light = new THREE.PointLight(0xffc27d, 7, 20, 2);
        light.position.set(x + (rot ? 0 : 1.8), 5.8, z + (rot ? 1.8 : 0));
        this.scene.add(light); this.streetLights.push(light);
      }
    });

    // bus stops / benches / trash / hydrants
    const benchMat = new THREE.MeshStandardMaterial({ color:0x4b3d30, roughness:.9 });
    for (const [x,z,rot] of [[-16,54,0],[-12,-52,0],[46,66,1],[-96,164,0],[206,-102,0]]) {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.3, .12, .5), benchMat); seat.position.y = .55; bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.3, .65, .1), benchMat); back.position.set(0, .9, -.22); bench.add(back);
      for (const dx of [-.9,.9]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.08,.55,.4), poleMat); leg.position.set(dx,.27,0); bench.add(leg); }
      bench.position.set(x, 0, z); bench.rotation.y = rot ? Math.PI/2 : 0; this.scene.add(bench);
    }
    // bus shelter at transit and hidden stop
    this.buildBusShelter(-4, -52);
    this.buildBusShelter(30, 72);
    // trash cans
    const trashMat = new THREE.MeshStandardMaterial({ color:0x2f3a37, roughness:.85 });
    for (let i = 0; i < 20; i++) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(.32,.38,.95,8), trashMat);
      t.position.set(-180 + this.rng() * 400, .48, -200 + this.rng() * 400);
      if (this.nearRoad(t.position.x, t.position.z, 7)) this.scene.add(t);
    }
    // transit stop marker
    this.interactables.push({ id:'bus_stop', label:'Transit Center', sub:'WTA · ROUTES 1, 14, 0?', x:-4, z:-52, radius:4.6, action:'bus', type:'place' });
    this.markers.push({ id:'transit', x:-4, z:-52, type:'transit', label:'TRANSIT CENTER', color:'#7fe3d2' });
    // secret phone booth near alley
    const booth = new THREE.Group();
    const boothMat = new THREE.MeshStandardMaterial({ color:0x253d3a, roughness:.55, metalness:.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1,2.4,1.1), boothMat); body.position.y=1.2; booth.add(body);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(.86,1.45,.05), new THREE.MeshStandardMaterial({ color:0x8fbab3, transparent:true, opacity:.25, roughness:.1, metalness:.6 })); glass.position.set(0,1.45,.57); booth.add(glass);
    booth.position.set(-66, 0, 70); booth.rotation.y = -.4; this.scene.add(booth);
    this.phoneBooth = booth;
  }

  buildBusShelter(x, z) {
    const mat = new THREE.MeshStandardMaterial({ color:0x2f3937, roughness:.55, metalness:.3 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(5.2,.16,2.1), mat); roof.position.set(x,2.55,z); this.scene.add(roof);
    for (const dx of [-2.2,2.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.08,2.5,.08), mat); p.position.set(x+dx,1.27,z); this.scene.add(p); }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.7), new THREE.MeshStandardMaterial({ color:0x7fa6a1, transparent:true, opacity:.13, roughness:.1, metalness:.5, side:THREE.DoubleSide }));
    glass.position.set(x,1.5,z-.7); this.scene.add(glass);
    const signTex = makeSignTexture('WTA', '#7fe3d2', '#0c1415', 'BELLINGHAM');
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.3,.9), new THREE.MeshBasicMaterial({ map:signTex, transparent:true, toneMapped:false }));
    sign.position.set(x,2.8,z+.6); this.scene.add(sign);
  }

  createCar(color = 0x5c6b6a) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness:.28, metalness:.5 });
    const dark = new THREE.MeshStandardMaterial({ color:0x101516, roughness:.7 });
    const glass = new THREE.MeshStandardMaterial({ color:0x18282c, roughness:.08, metalness:.7, transparent:true, opacity:.82 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8,.55,4.1), bodyMat); body.position.y = .65; body.castShadow = true; g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55,.55,1.9), glass); cab.position.set(0,1.14,-.15); g.add(cab);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.58,.08,1.9), bodyMat); roof.position.set(0,1.44,-.15); g.add(roof);
    for (const [x,z] of [[-.85,1.3],[.85,1.3],[-.85,-1.25],[.85,-1.25]]) {
      const w = new THREE.Mesh(shared.wheel, dark); w.rotation.z = Math.PI/2; w.position.set(x,.34,z); g.add(w);
    }
    const head = new THREE.MeshBasicMaterial({ color:0xfff2cc, toneMapped:false });
    const tail = new THREE.MeshBasicMaterial({ color:0xff3b30, toneMapped:false });
    for (const x of [-.55,.55]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(.32,.14,.04), head); h.position.set(x,.67,-2.06); g.add(h);
      const t = new THREE.Mesh(new THREE.BoxGeometry(.32,.12,.04), tail); t.position.set(x,.67,2.06); g.add(t);
    }
    const glow = new THREE.PointLight(0xffe0a8, 2, 9, 2); glow.position.set(0,.6,-2.8); g.add(glow);
    g.userData.car = true;
    return g;
  }

  buildTraffic() {
    const colors = [0x45565a,0x7b3a32,0x2d3c35,0x857a63,0x3d3f45,0x5b5145,0x8a8f8b,0x2b3b4a];
    for (let i = 0; i < 14; i++) {
      const car = this.createCar(colors[i % colors.length]);
      const axis = i % 2;
      const lane = axis ? (this.roadZs[(i + 2) % this.roadZs.length]) : (this.roadXs[(i + 1) % this.roadXs.length]);
      const pos = -210 + this.rng() * 420;
      const dir = i % 4 < 2 ? 1 : -1;
      if (axis) car.position.set(pos, .04, lane + 2.5 * dir);
      else { car.position.set(lane - 2.5 * dir, .04, pos); car.rotation.y = Math.PI / 2 * (dir > 0 ? 1 : -1); }
      this.scene.add(car);
      this.traffic.push({ car, axis, lane, pos, dir, speed:4 + this.rng() * 4 });
    }
    // parked cars
    for (let i = 0; i < 18; i++) {
      const car = this.createCar(colors[(i + 3) % colors.length]);
      const x = -185 + this.rng() * 400, z = -205 + this.rng() * 400;
      if (!this.nearRoad(x, z, 12)) continue;
      car.position.set(x, .04, z); car.rotation.y = this.rng() < .5 ? 0 : Math.PI;
      this.scene.add(car); this.parked.push(car);
    }
    // player's car near apartment
    this.playerCar = this.createCar(0x6f4b3a);
    this.playerCar.position.set(-58, .04, 60); this.playerCar.rotation.y = Math.PI / 2;
    this.scene.add(this.playerCar);
    this.interactables.push({ id:'player_car', label:'The Rustbucket', sub:'YOUR CAR · 1998 WAGON', x:-58, z:60, radius:4, action:'vehicle', type:'vehicle' });
  }

  updateTraffic(dt) {
    for (const t of this.traffic) {
      t.pos += t.speed * t.dir * dt;
      if (t.pos > 220) t.pos = -220;
      if (t.pos < -220) t.pos = 220;
      if (t.axis) t.car.position.x = t.pos;
      else t.car.position.z = t.pos;
    }
    for (let i = 0; i < this.puddles.length; i++) {
      const p = this.puddles[i];
      p.material.opacity = .42 + Math.sin(this.time * 1.3 + i) * .06;
    }
  }

  buildWaterfront() {
    const boardMat = new THREE.MeshStandardMaterial({ color:0x3b4744, roughness:.82 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(110, .25, 4), boardMat);
    board.position.set(-70, .8, 198); this.scene.add(board);
    const railMat = new THREE.MeshStandardMaterial({ color:0x272f2d, roughness:.65, metalness:.3 });
    for (let i = 0; i < 30; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(.07,1.1,.07), railMat); p.position.set(-124 + i * 4, 1.4, 200); this.scene.add(p);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(110,.07,.07), railMat); rail.position.set(-70,1.95,200); this.scene.add(rail);
    this.interactables.push({ id:'boardwalk', label:'Boulevard Boardwalk', sub:'OVER THE BAY', x:-70, z:198, radius:4, action:'scenic', type:'place' });
    // lighthouse-ish beacon at pier
    const beacon = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.6,8,8), new THREE.MeshStandardMaterial({ color:0xd7d1c2, roughness:.8 }));
    tower.position.y = 4; beacon.add(tower);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6,2,8), new THREE.MeshStandardMaterial({ color:0x9e2f29, roughness:.7 })); cap.position.y = 9; beacon.add(cap);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.35,8,6), new THREE.MeshBasicMaterial({ color:0xffe2a1, toneMapped:false })); lamp.position.y = 8.2; beacon.add(lamp);
    beacon.position.set(0, 0, 238); this.scene.add(beacon);
    const bl = new THREE.PointLight(0xffd18a, 12, 55, 2); bl.position.set(0,8.2,238); this.scene.add(bl);
    this.beacon = bl;
  }

  buildArena() {
    const a = this.arena;
    const group = new THREE.Group();
    const floorMat = new THREE.MeshStandardMaterial({ color:0x202325, roughness:.42, metalness:.3 });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(34,34,.6,48), floorMat); floor.position.y = -.3; group.add(floor);
    const ringMat = new THREE.MeshStandardMaterial({ color:0x5d2420, roughness:.4, metalness:.2 });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(12,12,1.3,8), ringMat); ring.position.y = .35; group.add(ring);
    const canvasMat = new THREE.MeshStandardMaterial({ color:0x252d2e, roughness:.55 });
    const canvas = new THREE.Mesh(new THREE.CylinderGeometry(11.4,11.4,.16,8), canvasMat); canvas.position.y = 1.03; group.add(canvas);
    const postMat = new THREE.MeshStandardMaterial({ color:0x4f5c5b, roughness:.3, metalness:.65 });
    const ropeMat = new THREE.MeshBasicMaterial({ color:0x9b2e29 });
    for (let i = 0; i < 8; i++) {
      const ang = i / 8 * TAU;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,2.3,8), postMat);
      post.position.set(Math.cos(ang) * 11.5, 2.15, Math.sin(ang) * 11.5); group.add(post);
    }
    for (let l = 0; l < 3; l++) {
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * TAU;
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2*11.5*Math.sin(Math.PI/8),6), ropeMat);
        rope.rotation.z = Math.PI/2;
        rope.position.set(Math.cos(ang + Math.PI/8) * 11.5 * Math.cos(Math.PI/8), 1.35 + l * .45, Math.sin(ang + Math.PI/8) * 11.5 * Math.cos(Math.PI/8));
        rope.rotation.y = -ang - Math.PI/8;
        group.add(rope);
      }
    }
    // light rig
    for (let i = 0; i < 6; i++) {
      const ang = i / 6 * TAU;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(.3,9,.3), postMat);
      tower.position.set(Math.cos(ang) * 20, 4.5, Math.sin(ang) * 20); group.add(tower);
      const light = new THREE.Mesh(new THREE.SphereGeometry(.45,8,6), new THREE.MeshBasicMaterial({ color:i%2?0xff4338:0x7fe3d2, toneMapped:false }));
      light.position.set(Math.cos(ang) * 20, 9.1, Math.sin(ang) * 20); group.add(light);
      const pl = new THREE.PointLight(i%2?0xff4338:0x7fe3d2, 18, 32, 2); pl.position.copy(light.position); group.add(pl);
    }
    // crowd silhouettes
    for (let i = 0; i < 70; i++) {
      const ang = this.rng() * TAU, r = 18 + this.rng() * 9;
      const p = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(.25,.65,3,6), new THREE.MeshStandardMaterial({ color:[0x1a2223,0x242b2c,0x30282a][i%3], roughness:1 }));
      body.position.y = .75; p.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.22,7,5), new THREE.MeshStandardMaterial({ color:0x443a34, roughness:1 })); head.position.y = 1.5; p.add(head);
      p.position.set(a.x + Math.cos(ang) * r, .2 + this.rng() * 1.6, a.z + Math.sin(ang) * r);
      p.rotation.y = -ang; group.add(p); this.arenaCrowd.push({ obj:p, phase:this.rng()*TAU });
    }
    // banners
    const banners = [['THE UNDERCURRENT','#ff4338'],['ROUND ONE','#e9e4d8'],['NO REFUNDS','#7fe3d2']];
    banners.forEach(([text,col],i) => {
      const tex = makeSignTexture(text, col, '#0a0f10', 'TERMINAL 9 · BELLINGHAM');
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(18,4.5), new THREE.MeshBasicMaterial({ map:tex, transparent:true, toneMapped:false, side:THREE.DoubleSide }));
      banner.position.set(a.x - 24 + i * 24, 11, a.z - 25); group.add(banner);
      const post = new THREE.Mesh(new THREE.BoxGeometry(.2,12,.2), postMat); post.position.set(a.x - 24 + i * 24, 6, a.z - 25.2); group.add(post);
    });
    // big screen
    const screenTex = canvasTexture(512,256,(ctx,w,h)=>{ctx.fillStyle='#081011';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff4338';ctx.font='400 76px Bebas, sans-serif';ctx.textAlign='center';ctx.fillText('THE UNDERCURRENT',w/2,110);ctx.fillStyle='#7fe3d2';ctx.font='400 22px Plex, monospace';ctx.fillText('ALL FIGHTERS ARE ADULTS · ALL FIGHTS ARE CONSENSUAL',w/2,165);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.strokeRect(10,10,w-20,h-20);});
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(30,15), new THREE.MeshBasicMaterial({ map:screenTex, toneMapped:false }));
    screen.position.set(a.x, 15, a.z + 30); screen.rotation.y = Math.PI; group.add(screen);
    // terminal
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(2.5,1.4,1.2), new THREE.MeshStandardMaterial({ color:0x273436, roughness:.4, metalness:.5 }));
    terminal.position.set(a.x + 15, 1.4, a.z - 15); group.add(terminal);
    const termScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.9,.9), new THREE.MeshBasicMaterial({ color:0x7fe3d2, toneMapped:false }));
    termScreen.position.set(a.x + 15, 1.65, a.z - 14.38); group.add(termScreen);
    group.position.set(0,0,0);
    this.scene.add(group);
    this.arenaGroup = group;
    this.interactables.push({ id:'arena_terminal', label:'Undercard Terminal', sub:'CHOOSE YOUR ROUND', x:a.x + 15, z:a.z - 15, radius:4, action:'arena', type:'arena' });
    this.markers.push({ id:'arena', x:a.x, z:a.z, type:'arena', label:'TERMINAL 9', color:'#ff4338' });
    // arena bounds colliders
    this.colliders.push({minX:a.x-40,maxX:a.x-36,minZ:a.z-40,maxZ:a.z+40,h:12,type:'arena'});
    this.colliders.push({minX:a.x+36,maxX:a.x+40,minZ:a.z-40,maxZ:a.z+40,h:12,type:'arena'});
  }

  buildWeirdLayers() {
    // ghost city
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color:0xff4338, wireframe:true, transparent:true, opacity:.14, depthWrite:false });
    for (let i = 0; i < 18; i++) {
      const h = 8 + this.rng() * 42;
      const m = new THREE.Mesh(new THREE.BoxGeometry(6 + this.rng() * 15, h, 6 + this.rng() * 15), mat);
      m.position.set(-160 + this.rng() * 320, h/2, -180 + this.rng() * 340);
      m.rotation.y = this.rng() * .4; group.add(m);
    }
    group.visible = false; this.scene.add(group); this.ghostGroup = group;
    // downtown ocean
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(260, 230, 30, 30), this.waterMaterial(0x254a53));
    ocean.rotation.x = -Math.PI / 2; ocean.position.set(0, .11, 0); ocean.visible = false; this.scene.add(ocean); this.oceanDowntown = ocean;
    // floating fragments
    this.fragments = [];
    const fragMat = new THREE.MeshStandardMaterial({ color:0x2e3939, roughness:.4, metalness:.5, transparent:true, opacity:.8 });
    for (let i = 0; i < 26; i++) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(1+this.rng()*4,.3+this.rng()*1,1+this.rng()*4), fragMat);
      f.position.set(-80 + this.rng()*160, 8 + this.rng()*28, -80 + this.rng()*160);
      f.userData.base = f.position.clone(); f.userData.phase = this.rng()*TAU; f.visible = false; this.scene.add(f); this.fragments.push(f);
    }
  }

  buildWeather() {
    const count = 3200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - .5) * 70, y = Math.random() * 34, z = (Math.random() - .5) * 70;
      positions[i*6] = x; positions[i*6+1] = y; positions[i*6+2] = z;
      positions[i*6+3] = x + .08; positions[i*6+4] = y - .9 - Math.random()*.8; positions[i*6+5] = z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const mat = new THREE.LineBasicMaterial({ color:0xaac3c6, transparent:true, opacity:.34 });
    this.rain = new THREE.LineSegments(geo, mat); this.rain.frustumCulled = false; this.scene.add(this.rain);
    this.rainCount = count;
    this.rainPositions = positions;

    // fog banks
    const fogTex = makeGlowTexture('#a0b4b4');
    const fogMat = new THREE.SpriteMaterial({ map:fogTex, transparent:true, opacity:.25, depthWrite:false, blending:THREE.AdditiveBlending });
    this.fogParticles = [];
    for (let i = 0; i < 18; i++) {
      const s = new THREE.Sprite(fogMat.clone());
      s.position.set((this.rng()-.5)*500, 3 + this.rng()*8, (this.rng()-.5)*500);
      s.scale.set(40+this.rng()*80, 12+this.rng()*30, 1); s.userData.phase = this.rng()*TAU;
      this.scene.add(s); this.fogParticles.push(s);
    }
  }

  buildWildlife() {
    this.birds = [];
    const birdMat = new THREE.LineBasicMaterial({ color:0x1b2525, transparent:true, opacity:.7 });
    for (let f = 0; f < 5; f++) {
      const flock = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.55,0,0),new THREE.Vector3(0,.18,0),new THREE.Vector3(.55,0,0)]);
        const bird = new THREE.Line(geo, birdMat);
        bird.position.set((Math.random()-.5)*5, (Math.random()-.5)*2, (Math.random()-.5)*5);
        bird.scale.setScalar(.7 + Math.random()*.7); flock.add(bird);
      }
      const radius = 35 + f * 18, height = 30 + f * 12;
      flock.userData = { radius, height, phase:this.rng()*TAU, speed:.05 + this.rng()*.04, cx:-40 + this.rng()*200, cz:-80 + this.rng()*250 };
      this.scene.add(flock); this.birds.push(flock);
    }
    // seagulls as small sprites
    const gullTex = canvasTexture(64,32,(ctx,w,h)=>{ctx.strokeStyle='rgba(220,225,215,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,22);ctx.quadraticCurveTo(18,6,32,20);ctx.quadraticCurveTo(46,6,60,22);ctx.stroke();});
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:gullTex, transparent:true, opacity:.65, depthWrite:false }));
      s.position.set((this.rng()-.5)*120, 8+this.rng()*12, 160+this.rng()*70); s.scale.set(2.4,1.2,1);
      s.userData.phase = this.rng()*TAU; s.userData.base = s.position.clone(); this.scene.add(s); this.gulls = this.gulls || []; this.gulls.push(s);
    }
  }

  refreshInteractables() {
    // Add scenic / event interactables
    const add = (o) => { if (!this.interactables.some(i => i.id === o.id)) this.interactables.push(o); };
    add({ id:'viewpoint', label:'Scenic Overlook', sub:'MOUNT BAKER / THE BAY', x:-70, z:196, radius:5, action:'scenic', type:'place' });
    add({ id:'falls', label:'Whatcom Falls', sub:'WATERFALL · SWIMMING HOLE', x:248, z:-126, radius:6, action:'scenic', type:'place' });
    add({ id:'trail', label:'Chuckanut Trail', sub:'HIKE · 2.4 MILES', x:-238, z:260, radius:6, action:'scenic', type:'place' });
    add({ id:'old_bench', label:'The Old Bench', sub:'AUGUST IS USUALLY HERE', x:-45, z:-70, radius:5, action:'scenic', type:'place' });
    add({ id:'home_door', label:'Harborview Lofts · 4B', sub:'YOUR APARTMENT', x:-42, z:58, radius:4, action:'home', type:'home' });
  }

  districtAt(x, z) {
    let best = DISTRICTS[0], bd = Infinity;
    for (const d of DISTRICTS) {
      const dist = Math.hypot(x - d.x, z - d.z) - d.r * .35;
      if (dist < bd) { bd = dist; best = d; }
    }
    if (x > 245 && z > -100 && z < 150) return DISTRICTS.find(d => d.id === 'lake');
    if (x > 160 && z < -70) return DISTRICTS.find(d => d.id === 'industrial');
    if (z > 210) return DISTRICTS.find(d => d.id === 'waterfront');
    return best;
  }

  isBlocked(x, z, radius = .35) {
    if (x < -280 || x > 520 || z < -360 || z > 280) return true;
    for (const c of this.colliders) {
      if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) return true;
    }
    return false;
  }

  nearestInteractable(x, z, maxDist = 4.6) {
    let best = null, bd = maxDist;
    for (const it of this.interactables) {
      const d = Math.hypot(it.x - x, it.z - z);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  setWeather(key, instant = false) {
    if (!WEATHER[key]) return;
    this.weather = key;
    const w = WEATHER[key];
    this.targetWeather = w;
    if (instant) this.applyWeather(1);
    if (this.rain) this.rain.visible = w.rain > 0;
  }

  applyWeather(blend = .1) {
    const w = WEATHER[this.weather] || WEATHER.rain;
    const night = this.nightFactor();
    const storm = this.weather === 'storm' ? 1 : 0;
    const sky = this.sky.material.uniforms;
    const top = new THREE.Color().setHSL(.53, .16, lerp(.17, .035, night));
    const bottom = new THREE.Color().setHSL(.48, .09, lerp(.62, .09, night));
    const cloud = new THREE.Color().setHSL(.52, .22, lerp(.12, .012, night));
    sky.uTop.value.lerp(top, blend); sky.uBottom.value.lerp(bottom, blend); sky.uCloud.value.lerp(cloud, blend);
    sky.uStorm.value = storm; sky.uNight.value = night;
    this.scene.fog.color.lerp(new THREE.Color(storm ? 0x465557 : 0x708083).multiplyScalar(lerp(1, .28, night)), blend);
    this.scene.fog.density = lerp(this.scene.fog.density, w.fog, blend);
    this.hemi.intensity = lerp(this.hemi.intensity, w.light * lerp(.95, .24, night), blend);
    this.sun.intensity = lerp(this.sun.intensity, w.light * lerp(1.3, .14, night), blend);
    this.stars.material.opacity = night * (this.weather === 'clear' ? .8 : .1);
    if (this.rain) {
      this.rain.material.opacity = lerp(this.rain.material.opacity, w.rain ? .3 + storm * .18 : 0, blend);
      this.rain.visible = w.rain > 0;
    }
    this.renderer.toneMappingExposure = lerp(this.renderer.toneMappingExposure, lerp(1.38, .66, night), blend);
  }

  nightFactor() {
    const h = (this.state.time.minutes || 450) / 60;
    if (h < 5) return .9;
    if (h < 7.5) return .9 - (h - 5) / 2.5 * .8;
    if (h < 17) return .08;
    if (h < 20) return .08 + (h - 17) / 3 * .82;
    return .9;
  }

  setWeirdness(v) {
    this.weirdness = v;
    if (this.ghostGroup) this.ghostGroup.visible = v > .58;
    if (this.oceanDowntown) this.oceanDowntown.visible = v > .82 || this.oceanActive;
    if (this.fragments) this.fragments.forEach(f => f.visible = v > .72);
    this.simulation = v;
  }

  update(dt, elapsed, playerPos, state) {
    this.time = elapsed;
    this.state = state;
    if (this.sky) {
      this.sky.material.uniforms.uTime.value = elapsed;
      this.sky.position.copy(playerPos);
      this.sky.position.y = 0;
    }
    if (this.stars) this.stars.position.copy(playerPos);
    if (this.mountain) this.mountain.visible = playerPos.z < 220;
    this.updateTraffic(dt);
    if (this.water) this.water.material.uniforms.uTime.value = elapsed;
    if (this.lake) this.lake.material.uniforms.uTime.value = elapsed;
    if (this.oceanDowntown) this.oceanDowntown.material.uniforms.uTime.value = elapsed;
    // rain follows player
    if (this.rain) {
      this.rain.position.set(playerPos.x, 0, playerPos.z);
      const arr = this.rainPositions;
      const speed = 26 + (WEATHER[this.weather]?.wind || .6) * 8;
      for (let i = 0; i < this.rainCount; i++) {
        const idx = i * 6;
        arr[idx + 1] -= speed * dt;
        arr[idx + 4] -= speed * dt;
        if (arr[idx + 1] < 0) {
          const x = (Math.random() - .5) * 72, z = (Math.random() - .5) * 72;
          arr[idx] = x; arr[idx + 1] = 26 + Math.random() * 12; arr[idx + 2] = z;
          arr[idx + 3] = x + .1; arr[idx + 4] = arr[idx + 1] - .9; arr[idx + 5] = z;
        }
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }
    // fog banks drift
    if (this.fogParticles) for (const f of this.fogParticles) {
      f.position.x += dt * .25; if (f.position.x > 300) f.position.x = -300;
      f.material.opacity = (this.weather === 'fog' ? .38 : .18) + Math.sin(elapsed * .15 + f.userData.phase) * .05;
    }
    // birds
    if (this.birds) for (const flock of this.birds) {
      const u = flock.userData; u.phase += dt * u.speed;
      flock.position.set(u.cx + Math.cos(u.phase) * u.radius, u.height + Math.sin(u.phase * 2) * 2, u.cz + Math.sin(u.phase) * u.radius);
      flock.rotation.y = -u.phase;
    }
    if (this.gulls) for (const s of this.gulls) {
      s.userData.phase += dt * .7;
      s.position.y = s.userData.base.y + Math.sin(elapsed + s.userData.phase) * 1.2;
      s.position.x += dt * .8; if (s.position.x > 100) s.position.x = -100;
    }
    // puddle shimmer
    if (this.streetLights) {
      for (let i = 0; i < this.streetLights.length; i++) this.streetLights[i].intensity = 6.5 + Math.sin(elapsed * 2 + i) * .25;
    }
    // arena crowd sway
    if (this.arenaCrowd) for (const c of this.arenaCrowd) {
      c.obj.position.y += Math.sin(elapsed * 2 + c.phase) * .0006;
    }
    // weird fragments
    if (this.fragments) for (const f of this.fragments) if (f.visible) {
      f.position.y = f.userData.base.y + Math.sin(elapsed * .5 + f.userData.phase) * 1.2;
      f.rotation.y += dt * .12; f.rotation.x += dt * .03;
    }
    if (this.ghostGroup && this.ghostGroup.visible) this.ghostGroup.rotation.y = Math.sin(elapsed * .03) * .04;
    // simulation collapse
    if (this.simulation > .8) {
      this.scene.rotation.z = Math.sin(elapsed * .7) * .002 * (this.simulation - .8) * 5;
    } else this.scene.rotation.z = 0;
    // weather blend
    if (this.weather !== this._lastWeather) { this.applyWeather(1); this._lastWeather = this.weather; }
    if (this.state.weather && this.state.weather !== this.weather && !this._weatherLock) {
      this.setWeather(this.state.weather);
    }
  }

  setOcean(on) {
    this.oceanActive = on;
    if (this.oceanDowntown) this.oceanDowntown.visible = on || this.weirdness > .82;
  }

  teleportArena() {
    this.arenaEntered = true;
    return { x:this.arena.x, z:this.arena.z + 24, yaw:Math.PI };
  }
}
