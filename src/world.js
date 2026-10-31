import * as THREE from 'three'
import {
  sandTexture, concreteTexture, stuccoTexture, containerTexture, woodTexture,
  metalTexture, awningTexture, signTexture, posterTexture, pawFlagTexture,
  glowTexture, smokeTexture, cloudTexture, postLampTexture
} from './textures.js'

const TAU = Math.PI * 2

function mat(color, roughness = .85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function shadowed(mesh, cast = true, receive = true) {
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  return mesh
}

export function buildWorld(scene, renderer) {
  const colliders = []
  const hitMeshes = []
  const animated = { smoke: [], flags: [], bulbs: [], dust: null, water: null, shadows: [] }
  const root = new THREE.Group()
  scene.add(root)

  scene.fog = new THREE.FogExp2(0xa77a62, 0.0125)
  scene.background = new THREE.Color(0x8a6f62)

  const hemi = new THREE.HemisphereLight(0x9bb9d6, 0x7a4d2c, 1.25)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight(0xffbe82, 3.0)
  sun.position.set(-24, 26, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 80
  sun.shadow.camera.left = -32
  sun.shadow.camera.right = 32
  sun.shadow.camera.top = 28
  sun.shadow.camera.bottom = -24
  sun.shadow.bias = -.0008
  sun.shadow.normalBias = .025
  scene.add(sun)
  scene.add(sun.target)
  sun.target.position.set(0, 0, -5)

  const fill = new THREE.DirectionalLight(0x6f8ca8, .8)
  fill.position.set(18, 11, -20)
  scene.add(fill)

  // Sky dome
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(160, 32, 18),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        sunDir: { value: new THREE.Vector3(-.18, .09, -.98).normalize() }
      },
      vertexShader: `varying vec3 vWorld; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vWorld=wp.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying vec3 vWorld; uniform vec3 sunDir;
        void main(){
          vec3 dir=normalize(vWorld);
          float h=dir.y;
          vec3 horizon=vec3(0.93,0.51,0.30);
          vec3 middle=vec3(0.46,0.33,0.32);
          vec3 zenith=vec3(0.035,0.07,0.13);
          vec3 col=mix(horizon, middle, smoothstep(0.0,0.26,h));
          col=mix(col, zenith, smoothstep(0.18,0.9,h));
          col=mix(vec3(0.27,0.23,0.22), col, smoothstep(-0.08,0.02,h));
          float sd=max(dot(dir,sunDir),0.0);
          col += vec3(1.0,0.48,0.16)*pow(sd,180.0)*2.0;
          col += vec3(1.0,0.36,0.12)*pow(sd,12.0)*0.20;
          float bands=sin((h+0.05)*95.0)*0.5+0.5;
          col += vec3(0.09,0.035,0.015)*bands*smoothstep(0.0,0.35,h)*0.08;
          gl_FragColor=vec4(col,1.0);
        }`
    })
  )
  sky.frustumCulled = false
  scene.add(sky)

  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,146,62,1)'), color: 0xffd8a0, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: .9
  }))
  sunSprite.position.set(-19, 8.4, -108)
  sunSprite.scale.set(52, 52, 1)
  scene.add(sunSprite)

  // Layered clouds
  const cloudMap = cloudTexture()
  for (let i = 0; i < 4; i++) {
    const cloud = new THREE.Mesh(
      new THREE.PlaneGeometry(74, 27),
      new THREE.MeshBasicMaterial({ map: cloudMap, transparent: true, opacity: .45, depthWrite: false, blending: THREE.NormalBlending, fog: false })
    )
    cloud.position.set(-55 + i * 36, 27 + (i % 2) * 5, -94 - i * 9)
    cloud.rotation.z = (i - 1.5) * .03
    scene.add(cloud)
  }

  // Distant mountain silhouettes
  function mountainLayer(z, color, width, height, seed) {
    const shape = new THREE.Shape()
    shape.moveTo(-width / 2, -8)
    const n = 13
    for (let i = 0; i <= n; i++) {
      const x = -width / 2 + (i / n) * width
      const p = Math.abs(Math.sin(i * 1.71 + seed)) * .55 + Math.abs(Math.sin(i * 3.1 + seed * 2)) * .45
      shape.lineTo(x, p * height - 5)
    }
    shape.lineTo(width / 2, -8)
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: true }))
    m.position.set(0, 0, z)
    scene.add(m)
    return m
  }
  mountainLayer(-115, 0x584b47, 190, 29, 1.4)
  mountainLayer(-110, 0x423d3b, 160, 19, 4.2)

  // Water beyond the market
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(190, 120),
    new THREE.MeshStandardMaterial({ color: 0x3f5a58, roughness: .25, metalness: .72 })
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(0, -.45, -76)
  scene.add(water)
  animated.water = water

  const sunPath = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 70),
    new THREE.MeshBasicMaterial({ map: glowTexture('rgba(255,114,40,1)'), transparent: true, opacity: .54, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  )
  sunPath.rotation.x = -Math.PI / 2
  sunPath.position.set(-42, -.42, -58)
  sunPath.scale.set(.85, 2.8, 1)
  scene.add(sunPath)

  // Ground
  const sand = sandTexture()
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: sand, color: 0xc3a47d, roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const yardTex = concreteTexture()
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(40, 44), new THREE.MeshStandardMaterial({ map: yardTex, color: 0xb4a589, roughness: .94 }))
  yard.rotation.x = -Math.PI / 2
  yard.position.set(0, .012, -5)
  yard.receiveShadow = true
  scene.add(yard)
  hitMeshes.push(ground, yard)

  // Painted yard markings
  const paintMat = new THREE.MeshBasicMaterial({ color: 0xd8bf87, transparent: true, opacity: .26 })
  for (const [x, z, w, d] of [[-12.5, 8, .18, 14], [12.5, 8, .18, 14], [0, 15, 25, .16]]) {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(w, d), paintMat)
    strip.rotation.x = -Math.PI / 2
    strip.position.set(x, .024, z)
    scene.add(strip)
  }

  function addCollider(x, z, w, d) { colliders.push({ x, z, hw: w / 2, hd: d / 2 }) }
  function box(w, h, d, material, x, y, z, { cast = true, receive = true, hit = true, parent = root } = {}) {
    const mesh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material), cast, receive)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    if (hit) hitMeshes.push(mesh)
    return mesh
  }

  const stuccoWarm = new THREE.MeshStandardMaterial({ map: stuccoTexture('#b79c78'), color: 0xd6b992, roughness: .96 })
  const stuccoPale = new THREE.MeshStandardMaterial({ map: stuccoTexture('#c0b096'), color: 0xd2c4a7, roughness: .93 })
  const trim = mat(0x6e5742, .9)
  const darkMetal = new THREE.MeshStandardMaterial({ map: metalTexture(), color: 0x4c524d, roughness: .7, metalness: .4 })
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0xa57949, roughness: .9 })

  // Left and right market buildings
  function facade(side) {
    const x = side * 18.2
    const w = 13
    const d = 33
    const b = box(w, 10.5, d, stuccoWarm, x, 5.25, -3)
    b.receiveShadow = true
    addCollider(x, -3, w, d)
    // roof lip
    box(w + 1.2, .45, d + 1.2, trim, x, 10.55, -3, { hit: false })
    box(.4, .35, d + .8, trim, side * 13, 5.4, -3, { hit: false })
    // window grid along inner wall
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x1b2422, roughness: .35, metalness: .2, emissive: 0x2c1d0c, emissiveIntensity: .15 })
    const litWindow = new THREE.MeshBasicMaterial({ color: 0xffb268, transparent: true, opacity: .9 })
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const z = -13 + i * 9
        const y = 4.7 + j * 2.8
        const inset = side * 11.66
        box(1.4, 1.9, .22, windowMat, inset, y, z, { hit: false, cast: false })
        box(.9, 1.45, .05, i === 1 && j === 0 ? litWindow : windowMat, side * 11.53, y, z, { hit: false, cast: false })
        box(1.7, .16, .5, trim, side * 11.45, y - 1.04, z, { hit: false, cast: false })
      }
    }
    // storefront awnings
    const awnMat = new THREE.MeshStandardMaterial({ map: awningTexture(side < 0 ? '#80351f' : '#6c4424', '#d7bb8c'), side: THREE.DoubleSide, roughness: .9 })
    for (let i = 0; i < 2; i++) {
      const z = -12 + i * 12
      const awning = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 2.2), awnMat)
      awning.position.set(side * 10.8, 3.6, z)
      awning.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
      awning.rotation.x = -.2
      awning.castShadow = true
      root.add(awning)
      box(.18, .18, 6.6, trim, side * 10.25, 3.2, z, { hit: false })
      box(3.4, 1.4, .6, trim, side * 11.25, 1.5, z, { hit: false })
    }
    // hanging sign
    const signMat = new THREE.MeshStandardMaterial({ map: signTexture(), emissive: 0xa8e36a, emissiveIntensity: .35, roughness: .6 })
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.8), signMat)
    sign.position.set(side * 11.42, 7.15, 2)
    sign.rotation.y = side * -Math.PI / 2
    root.add(sign)
  }
  facade(-1)
  facade(1)

  // Rear gatehouse / fish market, with a genuine arched opening to the harbor
  box(14, 8.8, 5.5, stuccoPale, -13, 4.4, -24.5)
  box(14, 8.8, 5.5, stuccoPale, 13, 4.4, -24.5)
  addCollider(-13, -24.5, 14, 5.5)
  addCollider(13, -24.5, 14, 5.5)
  const gateWall = new THREE.Shape()
  gateWall.moveTo(-7, 0); gateWall.lineTo(-7, 8.7); gateWall.lineTo(7, 8.7); gateWall.lineTo(7, 0); gateWall.lineTo(-7, 0)
  const gateHole = new THREE.Path()
  gateHole.moveTo(-3.55, 0); gateHole.lineTo(-3.55, 4.25)
  gateHole.absarc(0, 4.25, 3.55, Math.PI, 0, true)
  gateHole.lineTo(3.55, 0); gateHole.lineTo(-3.55, 0)
  gateWall.holes.push(gateHole)
  const gate = new THREE.Mesh(new THREE.ExtrudeGeometry(gateWall, { depth: .75, bevelEnabled: true, bevelSegments: 2, bevelSize: .06, bevelThickness: .06 }), stuccoPale)
  gate.position.set(0, 0, -24.7)
  gate.castShadow = true
  gate.receiveShadow = true
  root.add(gate)
  hitMeshes.push(gate)
  addCollider(-5.27, -24.6, 3.5, 1.1)
  addCollider(5.27, -24.6, 3.5, 1.1)
  // stone arch band and keystone
  const archBand = new THREE.Mesh(new THREE.TorusGeometry(3.58, .18, 6, 36, Math.PI), new THREE.MeshStandardMaterial({ color: 0x7b654c, roughness: .96 }))
  archBand.position.set(0, 4.25, -23.92)
  archBand.castShadow = true
  root.add(archBand)
  box(.42, .6, .3, trim, 0, 7.92, -23.92, { hit: false })
  box(14.2, .52, 5.7, trim, 0, 8.86, -24.5, { hit: false })
  box(15.2, .22, 5.9, trim, 0, 8.5, -24.4, { hit: false })
  // upper shutters and wall fixtures
  for (const side of [-1, 1]) {
    box(1.5, 1.9, .22, new THREE.MeshStandardMaterial({ color: 0x202621, roughness: .55, emissive: 0x6d3515, emissiveIntensity: .1 }), side * 4.85, 6.25, -23.94, { hit: false, cast: false })
    box(.15, 1.25, .75, darkMetal, side * 6.2, 4.8, -23.45, { hit: false, cast: false })
    const vent = new THREE.Mesh(new THREE.CircleGeometry(.31, 10), darkMetal)
    vent.position.set(side * 5.2, 6.25, -24.18); vent.rotation.y = Math.PI; root.add(vent)
  }
  // harbor pier visible through the gate
  const pierMat = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0x7c5a3b, roughness: .96 })
  box(7.6, .20, 8.5, pierMat, 0, .06, -30.2, { hit: false, cast: false })
  for (const x of [-3.6, -1.2, 1.2, 3.6]) {
    box(.22, 1.8, .22, darkMetal, x, .45, -34.1, { hit: false, cast: false })
    const lantern = new THREE.Sprite(new THREE.SpriteMaterial({ map: postLampTexture(), color: 0xffb66a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 }))
    lantern.position.set(x, 1.5, -34.0); lantern.scale.set(.9, .9, 1); root.add(lantern)
  }
  // a little fishing boat moored beyond the market
  const boat = new THREE.Group()
  boat.position.set(-8.5, -.05, -32)
  boat.rotation.y = .25
  root.add(boat)
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 6, 0, Math.PI, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6b3622, roughness: .8, side: THREE.DoubleSide }))
  hull.rotation.z = Math.PI; hull.scale.set(1.5, .65, .7); hull.position.y = .2; boat.add(hull)
  box(.12, 2.2, .12, darkMetal, .3, 1.3, 0, { hit: false, cast: false, parent: boat })
  const boatFlag = new THREE.Mesh(new THREE.PlaneGeometry(.7, .45), new THREE.MeshStandardMaterial({ map: pawFlagTexture(), side: THREE.DoubleSide }))
  boatFlag.position.set(.7, 2.1, 0); boat.add(boatFlag)
  // arch signage
  const signMat = new THREE.MeshStandardMaterial({ map: signTexture(), emissive: 0xb7f06a, emissiveIntensity: .34, roughness: .5, color: 0xdfffb7 })
  const sardineSign = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 2.28), signMat)
  sardineSign.position.set(0, 7.65, -23.88)
  root.add(sardineSign)
  const signGlow = new THREE.PointLight(0xb7f06a, 4.6, 11, 2)
  signGlow.position.set(0, 6.9, -22.5)
  scene.add(signGlow)

  // Rear lamp posts and awnings
  for (const side of [-1, 1]) {
    box(.24, 5.5, .24, darkMetal, side * 11, 2.75, -22, { hit: false })
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: postLampTexture(), color: 0xffc06b, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
    lamp.position.set(side * 11, 5.45, -21.7)
    lamp.scale.set(3.1, 3.1, 1)
    root.add(lamp)
    animated.bulbs.push(lamp)
  }

  // Hero poster on the left wall
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 6.9),
    new THREE.MeshStandardMaterial({ map: posterTexture(0), roughness: .9 })
  )
  poster.position.set(-11.51, 4.2, -5)
  poster.rotation.y = Math.PI / 2
  scene.add(poster)
  // Recruitment poster right wall
  const poster2 = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 5.6),
    new THREE.MeshStandardMaterial({ map: posterTexture(1), roughness: .92 })
  )
  poster2.position.set(11.51, 4.0, 4)
  poster2.rotation.y = -Math.PI / 2
  scene.add(poster2)

  // Flag banner on a pole near gate
  const flagTexture = pawFlagTexture()
  const flagGroup = new THREE.Group()
  flagGroup.position.set(-8.7, 8, -22)
  const pole = box(.11, 4.6, .11, darkMetal, 0, 0, 0, { hit: false, parent: flagGroup })
  pole.castShadow = true
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.8, 5, 3), new THREE.MeshStandardMaterial({ map: flagTexture, side: THREE.DoubleSide, roughness: .9 }))
  flag.position.set(1.5, 1.3, 0)
  flag.castShadow = true
  flagGroup.add(flag)
  root.add(flagGroup)
  animated.flags.push(flag)

  // Market stalls
  function stall(x, z, rotation = 0, accent = '#7c2f1c') {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    g.rotation.y = rotation
    root.add(g)
    box(3.6, .22, 2.2, wood, 0, 1.02, 0, { parent: g })
    for (const sx of [-1.55, 1.55]) for (const sz of [-.85, .85]) box(.12, 1.0, .12, darkMetal, sx, .5, sz, { hit: false, parent: g })
    const awning = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.8), new THREE.MeshStandardMaterial({ map: awningTexture(accent, '#d6bc91'), side: THREE.DoubleSide, roughness: .9 }))
    awning.rotation.x = -Math.PI / 2 + .18
    awning.position.set(0, 2.5, -.35)
    awning.castShadow = true
    g.add(awning)
    for (const sx of [-1.75, 1.75]) {
      box(.1, 2.5, .1, darkMetal, sx, 1.25, -.9, { hit: false, parent: g })
      box(.1, 2.5, .1, darkMetal, sx, 1.25, .9, { hit: false, parent: g })
    }
    // crates of fish
    for (let i = 0; i < 3; i++) {
      const crate = box(.78, .35, .62, wood, -.9 + i * .9, 1.25, .1, { parent: g })
      crate.rotation.y = (Math.random() - .5) * .2
    }
    addCollider(x, z, 4.2, 3.1)
    return g
  }
  stall(-8.6, -4.5, .05, '#853320')
  stall(9.0, -6, -.1, '#5e462a')
  stall(-8.2, 11.5, Math.PI, '#744124')

  // Shipping containers
  function container(x, z, rot, hue, id, stack = 1) {
    const group = new THREE.Group()
    group.position.set(x, 0, z)
    group.rotation.y = rot
    root.add(group)
    const containerMat = new THREE.MeshStandardMaterial({ map: containerTexture(hue, id), color: 0xffffff, roughness: .75, metalness: .2 })
    for (let level = 0; level < stack; level++) {
      const b = box(7.2, 2.65, 3.1, containerMat, 0, 1.33 + level * 2.7, 0, { parent: group })
      b.castShadow = true
      b.receiveShadow = true
      for (const x2 of [-3.53, 3.53]) for (const z2 of [-1.5, 1.5]) box(.13, 2.7, .13, darkMetal, x2, 1.33 + level * 2.7, z2, { hit: false, parent: group })
    }
    const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot))
    addCollider(x, z, 7.2 * c + 3.1 * s, 7.2 * s + 3.1 * c)
    return group
  }
  container(-11.8, -15.5, .12, '#a84e32', 'SARDINE CO.', 1)
  container(11.3, -13.4, -.21, '#5c6d63', 'F.E.U. SUPPLY', 2)
  container(13.2, 10.5, .28, '#8b5d34', 'LIVE BAIT', 1)

  // Sandbag barricades
  function sandbags(x, z, rot = 0, rows = 3) {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    g.rotation.y = rot
    root.add(g)
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x9c8760, roughness: 1, map: sandTexture() })
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < 5 - (row === rows - 1 ? 1 : 0); i++) {
        const bag = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .48, 3, 8), bagMat)
        bag.rotation.z = Math.PI / 2
        bag.rotation.y = (Math.random() - .5) * .12
        bag.position.set(-1.1 + i * .56 + (row % 2 ? .12 : 0), .32 + row * .4, (Math.random() - .5) * .1)
        bag.castShadow = true
        bag.receiveShadow = true
        g.add(bag)
        hitMeshes.push(bag)
      }
    }
    addCollider(x, z, 3.1 * Math.abs(Math.cos(rot)) + .7 * Math.abs(Math.sin(rot)), 3.1 * Math.abs(Math.sin(rot)) + .7 * Math.abs(Math.cos(rot)))
    return g
  }
  sandbags(-4.8, 1.5, 0, 3)
  sandbags(5.6, -3.5, .1, 2)
  sandbags(1, -14, 0, 3)
  sandbags(-5.3, -11.5, 0, 2)

  // Wooden crate clusters
  function crate(x, z, size = 1.3, rot = 0, y = 0) {
    const c = box(size, size, size, wood, x, y + size / 2, z)
    c.rotation.y = rot
    for (const s of [-1, 1]) {
      box(size * 1.02, .08, .12, trim, x, y + size / 2 + size * .39, z + s * size * .48, { hit: false }).rotation.y = rot
      box(size * 1.02, .08, .12, trim, x, y + size / 2 - size * .39, z + s * size * .48, { hit: false }).rotation.y = rot
    }
    addCollider(x, z, size * 1.05, size * 1.05)
  }
  crate(8.4, 4.7, 1.45, .15)
  crate(9.8, 4.2, 1.1, -.12)
  crate(9.0, 5.8, .8, .45, 1.45)
  crate(-9.4, 4.8, 1.35, -.24)
  crate(-8.2, 6.1, .9, .2)
  crate(0.8, -8.2, 1.2, .17)
  crate(-2.4, -8.8, .9, -.2)
  crate(7.5, 9.0, 1.55, .12)
  crate(6.35, 9.65, 1.1, -.2)
  crate(8.7, 9.55, .8, .4)
  crate(2.2, 5.0, .9, .1)

  // Concrete jersey barriers
  const concreteMat = new THREE.MeshStandardMaterial({ map: concreteTexture(), color: 0xb6ab97, roughness: .95 })
  function barrier(x, z, rot = 0) {
    const g = new THREE.Group()
    g.position.set(x, 0, z); g.rotation.y = rot; root.add(g)
    const base = box(3.4, .55, 1.0, concreteMat, 0, .275, 0, { parent: g })
    base.castShadow = true
    const top = box(3.2, .62, .50, concreteMat, 0, .85, 0, { parent: g })
    top.castShadow = true
    addCollider(x, z, 3.5 * Math.abs(Math.cos(rot)) + 1.1 * Math.abs(Math.sin(rot)), 3.5 * Math.abs(Math.sin(rot)) + 1.1 * Math.abs(Math.cos(rot)))
    return g
  }
  barrier(-1.2, 12.2, .08)
  barrier(4.2, 1.3, -.18)
  barrier(-4.8, -18.5, .0)

  // Barrels
  const barrelMat = new THREE.MeshStandardMaterial({ map: metalTexture(), color: 0x6b4c32, roughness: .8, metalness: .35 })
  function barrel(x, z) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .95, 12), barrelMat)
    b.position.set(x, .475, z)
    b.castShadow = true; b.receiveShadow = true
    root.add(b); hitMeshes.push(b)
    addCollider(x, z, .9, .9)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.37, .018, 4, 16), darkMetal)
    ring.rotation.x = Math.PI / 2; ring.position.set(x, .72, z); root.add(ring)
  }
  barrel(-6.8, -7.2); barrel(-6.1, -7.7); barrel(5.8, 7.4); barrel(6.5, 7.8); barrel(10.9, -2.6)

  // Palm trees
  function palm(x, z, scale = 1) {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    g.scale.setScalar(scale)
    root.add(g)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x70523a, roughness: 1 })
    let prev = new THREE.Vector3(0, 0, 0)
    const segs = 5
    for (let i = 0; i < segs; i++) {
      const h = .9
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(.14 - i * .012, .18 - i * .012, h, 7), trunkMat)
      seg.position.set(i * .08, .45 + i * h, 0)
      seg.rotation.z = -.06
      seg.castShadow = true
      g.add(seg)
      prev.set(i * .08, .9 + i * h, 0)
    }
    const crown = new THREE.Group(); crown.position.copy(prev); g.add(crown)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f5c39, roughness: .95, side: THREE.DoubleSide })
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(.45, 3.1, 1, 4), leafMat)
      const pivot = new THREE.Group(); crown.add(pivot)
      pivot.rotation.y = (i / 8) * TAU
      leaf.position.set(0, .25, -1.4)
      leaf.rotation.x = -.48 + Math.random() * .14
      leaf.rotation.z = (Math.random() - .5) * .18
      leaf.castShadow = true
      pivot.add(leaf)
    }
    addCollider(x, z, .5, .5)
    return g
  }
  palm(-14.7, 3.5, 1.05)
  palm(14.7, -1.8, .88)
  palm(-14.5, 13.8, .72)

  // String lights over the yard
  const cableMat = new THREE.LineBasicMaterial({ color: 0x292c28, transparent: true, opacity: .7 })
  for (let row = 0; row < 3; row++) {
    const z = 7 - row * 6
    const points = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const x = -11 + t * 22
      const y = 4.4 - Math.sin(t * Math.PI) * .75 + Math.sin(t * 9 + row) * .03
      points.push(new THREE.Vector3(x, y, z))
      if (i % 3 === 0 && i > 0 && i < 20) {
        const bulb = new THREE.Sprite(new THREE.SpriteMaterial({ map: postLampTexture(), color: 0xffc47a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 }))
        bulb.position.set(x, y - .12, z)
        bulb.scale.set(.56, .56, 1)
        root.add(bulb)
        animated.bulbs.push(bulb)
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    root.add(new THREE.Line(geo, cableMat))
  }
  const stringLight = new THREE.PointLight(0xff9b50, 7, 19, 2)
  stringLight.position.set(0, 4.1, 2)
  scene.add(stringLight)

  // Ground clutter
  const canMat = new THREE.MeshStandardMaterial({ color: 0x8e4030, roughness: .6, metalness: .3 })
  for (let i = 0; i < 24; i++) {
    const debris = new THREE.Mesh(new THREE.BoxGeometry(.1 + Math.random() * .4, .025, .1 + Math.random() * .25), Math.random() > .5 ? wood : concreteMat)
    debris.position.set((Math.random() - .5) * 27, .03, (Math.random() - .5) * 33 + 1)
    debris.rotation.y = Math.random() * TAU
    debris.receiveShadow = true
    root.add(debris)
  }
  for (let i = 0; i < 9; i++) {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .16, 7), canMat)
    can.position.set((Math.random() - .5) * 18, .08, (Math.random() - .5) * 20)
    can.rotation.z = Math.PI / 2
    can.rotation.y = Math.random() * TAU
    root.add(can)
  }

  // Dust motes
  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(260 * 3)
  for (let i = 0; i < 260; i++) {
    dustPos[i * 3] = (Math.random() - .5) * 34
    dustPos[i * 3 + 1] = Math.random() * 6 + .2
    dustPos[i * 3 + 2] = (Math.random() - .5) * 30 + 2
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd9a1, size: .035, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }))
  root.add(dust)
  animated.dust = dust

  // Smoke columns
  const smokeMap = smokeTexture()
  function smokeColumn(x, z, count = 7, spread = 1.8) {
    const group = new THREE.Group(); group.position.set(x, 0, z); root.add(group)
    for (let i = 0; i < count; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeMap, color: 0x8d8070, transparent: true, opacity: .2, depthWrite: false }))
      s.position.set((Math.random() - .5) * spread, Math.random() * 5, (Math.random() - .5) * spread)
      s.scale.setScalar(2 + Math.random() * 2)
      s.userData = { vy: .18 + Math.random() * .24, phase: Math.random() * TAU, baseX: s.position.x, baseZ: s.position.z }
      group.add(s)
      animated.smoke.push(s)
    }
  }
  smokeColumn(-12.5, -20, 8, 2.5)
  smokeColumn(13.7, -18, 7, 2.2)

  // Distant gulls (simple V sprites, static)
  const birdMat = new THREE.LineBasicMaterial({ color: 0x2d2d2c, transparent: true, opacity: .55 })
  for (let i = 0; i < 9; i++) {
    const pts = [new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(0, .35, 0), new THREE.Vector3(1.5, 0, 0)]
    const bird = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), birdMat)
    bird.position.set(-40 + Math.random() * 80, 14 + Math.random() * 12, -43 - Math.random() * 26)
    bird.scale.setScalar(.6 + Math.random() * .8)
    bird.rotation.z = (Math.random() - .5) * .2
    scene.add(bird)
  }

  // --- Cat model ---
  function kit(color, rough = .88) { return new THREE.MeshStandardMaterial({ color, roughness: rough }) }
  function createCatModel({ fur = 0xbf7d49, accent = 0xa93d23, heavy = false, friendly = false, helmet = 0x3c4436 } = {}) {
    const model = new THREE.Group()
    const furMat = new THREE.MeshStandardMaterial({ color: fur, roughness: .94 })
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xd8c09b, roughness: .96 })
    const vestMat = new THREE.MeshStandardMaterial({ color: heavy ? 0x363c35 : 0x4e5347, roughness: .8, metalness: .05 })
    const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: .74, emissive: accent, emissiveIntensity: .08 })
    const dark = new THREE.MeshStandardMaterial({ color: 0x232824, roughness: .72, metalness: .18 })
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2f3431, roughness: .45, metalness: .65 })
    const eyeMat = new THREE.MeshBasicMaterial({ color: friendly ? 0xb7f06a : 0xff6b2a })
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xd3a477, roughness: 1 })

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(heavy ? .39 : .31, .48, 5, 10), furMat)
    torso.position.y = 1.02
    torso.scale.set(heavy ? 1.14 : 1, 1, .8)
    torso.castShadow = true
    model.add(torso)

    const vest = new THREE.Mesh(new THREE.BoxGeometry(heavy ? .8 : .62, .62, .5), vestMat)
    vest.position.set(0, 1.07, -.01)
    vest.castShadow = true
    model.add(vest)

    // vest pouches
    for (const x of [-.23, 0, .23]) {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(.17, .2, .12), heavy ? accentMat : dark)
      pouch.position.set(x, .94, -.32)
      model.add(pouch)
    }
    // shoulder patch
    const patch = new THREE.Mesh(new THREE.BoxGeometry(.16, .14, .05), accentMat)
    patch.position.set(-.33, 1.28, -.28)
    model.add(patch)
    const patch2 = new THREE.Mesh(new THREE.CircleGeometry(.065, 8), new THREE.MeshBasicMaterial({ color: friendly ? 0xb7f06a : 0xff9a52 }))
    patch2.position.set(-.33, 1.28, -.31)
    model.add(patch2)

    // head group
    const head = new THREE.Group()
    head.position.y = 1.58
    model.add(head)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(.235, 14, 11), furMat)
    skull.scale.set(1, .92, .94)
    skull.castShadow = true
    head.add(skull)
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), creamMat)
    muzzle.scale.set(1.3, .7, .9)
    muzzle.position.set(0, -.06, -.18)
    head.add(muzzle)
    const nose = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), new THREE.MeshStandardMaterial({ color: 0xc56b71, roughness: .7 }))
    nose.position.set(0, -.014, -.285); nose.scale.set(1.2, .8, .6); head.add(nose)
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(.045, .006, 3, 8, Math.PI), dark)
    mouth.position.set(0, -.1, -.245); mouth.rotation.z = Math.PI; head.add(mouth)
    // facial markings and whiskers
    const stripeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(fur).multiplyScalar(.72), roughness: .95 })
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(.022 + i * .006, .1, .014), stripeMat)
      stripe.position.set(-.06 + i * .06, .135 - Math.abs(i - 1) * .012, -.16)
      stripe.rotation.z = (i - 1) * .12
      head.add(stripe)
    }
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xe2d2b2, transparent: true, opacity: .52 })
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const pts = [
          new THREE.Vector3(side * .1, -.045 + i * .018, -.245),
          new THREE.Vector3(side * .28, -.025 + i * .038, -.295 + i * .012)
        ]
        const whisker = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), whiskerMat)
        head.add(whisker)
      }
    }
    // neckerchief and chest fluff
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(.245, .038, 5, 18), accentMat)
    scarf.rotation.x = Math.PI / 2
    scarf.position.y = -.19
    model.add(scarf)
    const chest = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), creamMat)
    chest.scale.set(1.1, .95, .35)
    chest.position.set(0, 1.24, -.26)
    model.add(chest)
    // ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(.1, .22, 4), furMat)
      ear.position.set(side * .145, .21, .01)
      ear.rotation.z = side * -.16
      ear.rotation.y = Math.PI / 4
      head.add(ear)
      const inner = new THREE.Mesh(new THREE.ConeGeometry(.055, .13, 4), creamMat)
      inner.position.set(side * .145, .205, -.045)
      inner.rotation.z = side * -.16
      inner.rotation.y = Math.PI / 4
      head.add(inner)
    }
    // helmet
    const helmetMesh = new THREE.Mesh(new THREE.SphereGeometry(.258, 14, 8, 0, TAU, 0, Math.PI / 2.1), new THREE.MeshStandardMaterial({ color: helmet, roughness: .8, metalness: .1 }))
    helmetMesh.position.y = .06
    helmetMesh.rotation.x = -.05
    helmetMesh.castShadow = true
    head.add(helmetMesh)
    const brim = new THREE.Mesh(new THREE.TorusGeometry(.235, .018, 5, 16, Math.PI), dark)
    brim.rotation.x = Math.PI / 2; brim.position.set(0, .08, -.05); brim.rotation.z = Math.PI; head.add(brim)
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.34, .035, .06), metalMat)
    rail.position.set(0, .27, -.05); head.add(rail)
    const patchHelmet = new THREE.Mesh(new THREE.BoxGeometry(.09, .06, .01), accentMat)
    patchHelmet.position.set(.13, .14, -.245); head.add(patchHelmet)
    // NVG mount / flashlight
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .1, 7), dark)
    mount.rotation.x = Math.PI / 2; mount.position.set(0, .25, -.22); head.add(mount)
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.03, 8), eyeMat)
    lens.position.set(0, .25, -.275); head.add(lens)

    // eyes / goggles
    for (const side of [-1, 1]) {
      const socket = new THREE.Mesh(new THREE.BoxGeometry(.12, .07, .035), dark)
      socket.position.set(side * .09, .035, -.225); head.add(socket)
      const eye = new THREE.Mesh(new THREE.SphereGeometry(.027, 7, 6), eyeMat)
      eye.position.set(side * .09, .035, -.245); eye.scale.set(1.2, 1, .5); head.add(eye)
    }
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.205, .012, 4, 18, Math.PI * 1.3), dark)
    strap.position.y = .035; strap.rotation.y = Math.PI / 2; strap.rotation.z = -.15; head.add(strap)

    // arms
    const arms = []
    for (const side of [-1, 1]) {
      const arm = new THREE.Group()
      arm.position.set(side * (heavy ? .4 : .32), 1.22, 0)
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(.068, .3, 3, 7), furMat)
      upper.position.set(side * .07, -.18, -.12)
      upper.rotation.x = -.72
      upper.rotation.z = side * -.38
      upper.castShadow = true
      arm.add(upper)
      const paw = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), pawMat)
      paw.position.set(side * .15, -.33, -.34)
      paw.scale.set(1.1, 1, .9)
      arm.add(paw)
      model.add(arm)
      arms.push(arm)
    }
    for (const [arm, side] of arms.map((a, i) => [a, i ? 1 : -1])) {
      for (let i = 0; i < 2; i++) {
        const stripe = new THREE.Mesh(new THREE.TorusGeometry(.062, .008, 4, 8), stripeMat)
        stripe.position.set(side * .08, -.13 - i * .12, -.12)
        stripe.rotation.x = Math.PI / 2.4
        arm.add(stripe)
      }
    }

    // legs
    const legs = []
    for (const side of [-1, 1]) {
      const leg = new THREE.Group()
      leg.position.set(side * .16, .64, .01)
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.095, .34, 3, 7), furMat)
      thigh.position.y = -.18
      thigh.castShadow = true
      leg.add(thigh)
      const boot = new THREE.Mesh(new THREE.BoxGeometry(.17, .17, .32), dark)
      boot.position.set(0, -.42, -.08)
      boot.castShadow = true
      leg.add(boot)
      const shin = new THREE.Mesh(new THREE.BoxGeometry(.15, .22, .17), dark)
      shin.position.set(0, -.31, 0)
      leg.add(shin)
      model.add(leg)
      legs.push(leg)
    }

    // tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, .88, .28), new THREE.Vector3(.2, .8, .58),
      new THREE.Vector3(.38, 1.02, .72), new THREE.Vector3(.26, 1.2, .7)
    ])
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 12, .05, 6, false), furMat)
    tail.castShadow = true
    model.add(tail)

    // rifle
    const gun = new THREE.Group()
    gun.position.set(.02, 1.08, -.34)
    gun.rotation.y = -.04
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(.12, .14, .58), dark)
    receiver.position.z = -.1
    gun.add(receiver)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .38, 7), metalMat)
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, .025, -.54); gun.add(barrel)
    const brake = new THREE.Mesh(new THREE.CylinderGeometry(.045, .04, .08, 7), metalMat)
    brake.rotation.x = Math.PI / 2; brake.position.set(0, .025, -.75); gun.add(brake)
    const mag = new THREE.Mesh(new THREE.BoxGeometry(.075, .28, .12), dark)
    mag.position.set(0, -.17, -.16); mag.rotation.x = -.18; gun.add(mag)
    const stock = new THREE.Mesh(new THREE.BoxGeometry(.1, .16, .3), dark)
    stock.position.set(0, -.01, .3); gun.add(stock)
    const grip = new THREE.Mesh(new THREE.BoxGeometry(.07, .2, .08), dark)
    grip.position.set(0, -.18, .07); grip.rotation.x = .2; gun.add(grip)
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .22, 8), metalMat)
    scope.rotation.x = Math.PI / 2; scope.position.set(0, .13, -.11); gun.add(scope)
    const scopeGlass = new THREE.Mesh(new THREE.CircleGeometry(.035, 8), new THREE.MeshBasicMaterial({ color: friendly ? 0xb7f06a : 0xff7b38 }))
    scopeGlass.position.set(0, .13, -.225); gun.add(scopeGlass)
    gun.traverse(o => { if (o.isMesh) o.castShadow = true })
    model.add(gun)

    // shoulder lamp
    const lampSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(friendly ? 'rgba(151,230,95,1)' : 'rgba(255,79,35,1)'), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .65 }))
    lampSprite.position.set(-.35, 1.4, -.15)
    lampSprite.scale.set(.4, .4, 1)
    model.add(lampSprite)

    // hitboxes (invisible; easy to hit)
    const headBox = new THREE.Mesh(new THREE.SphereGeometry(.30, 6, 5), new THREE.MeshBasicMaterial({ visible: false }))
    headBox.position.y = 1.59
    headBox.userData.zone = 'head'
    model.add(headBox)
    const bodyBox = new THREE.Mesh(new THREE.CapsuleGeometry(heavy ? .47 : .40, .7, 3, 6), new THREE.MeshBasicMaterial({ visible: false }))
    bodyBox.position.y = .94
    bodyBox.userData.zone = 'body'
    model.add(bodyBox)

    const muzzlePoint = new THREE.Object3D()
    muzzlePoint.position.set(0, .025, -.83)
    gun.add(muzzlePoint)

    model.userData = {
      head, skull, torso, vest, tail, legs, arms, gun, muzzlePoint, helmetMesh,
      headBox, bodyBox, rig: { legs, arms, tail, head, torso, think: Math.random() * 10 }
    }
    return model
  }

  // Title hero pose - friendly cat overlooking the yard
  const hero = createCatModel({ fur: 0xb87847, accent: 0x3d5140, friendly: true, helmet: 0x3f4b3a })
  hero.scale.setScalar(1.35)
  hero.position.set(6.45, 1.55, 9.3)
  hero.rotation.y = Math.PI * .84
  hero.userData.rig.think = .8
  root.add(hero)
  const heroSpot = new THREE.PointLight(0xffaa62, 8, 7, 2)
  heroSpot.position.set(5.1, 3.6, 11.6)
  scene.add(heroSpot)

  // Wingcat silhouettes on title? one additional friendly at left
  const buddy = createCatModel({ fur: 0x8c8a7b, accent: 0x3d5140, friendly: true, helmet: 0x4a4d3b })
  buddy.position.set(-5.5, 0, -7.5)
  buddy.rotation.y = Math.PI + .4
  buddy.scale.setScalar(1.04)
  root.add(buddy)

  function animateCat(model, t, walk = 0, alert = 0) {
    const rig = model.userData?.rig
    if (!rig) return
    const breath = Math.sin(t * 1.8 + rig.think) * .012
    if (rig.torso) rig.torso.position.y = 1.02 + breath
    if (rig.head) {
      rig.head.rotation.y = Math.sin(t * .65 + rig.think) * .09
      rig.head.rotation.x = Math.sin(t * 1.2 + rig.think) * .025 - alert * .04
    }
    if (rig.tail) {
      rig.tail.rotation.y = Math.sin(t * 1.55 + rig.think) * .25
      rig.tail.rotation.z = Math.sin(t * .8 + rig.think) * .08
    }
    if (walk > .01) {
      const step = Math.sin(t * 9.5) * walk
      if (rig.legs[0]) rig.legs[0].rotation.x = step * .55
      if (rig.legs[1]) rig.legs[1].rotation.x = -step * .55
      if (rig.arms[0]) rig.arms[0].rotation.z = step * .035
      if (rig.arms[1]) rig.arms[1].rotation.z = -step * .035
      model.position.y = Math.abs(Math.sin(t * 9.5)) * .026 * walk
    } else {
      if (rig.legs[0]) rig.legs[0].rotation.x *= .85
      if (rig.legs[1]) rig.legs[1].rotation.x *= .85
      model.position.y *= .85
    }
  }

  function update(dt, time) {
    animated.water.position.y = -.45 + Math.sin(time * .4) * .02
    animated.water.material.roughness = .25 + Math.sin(time * .2) * .02
    if (animated.dust) {
      const pos = animated.dust.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + dt * (.08 + (i % 3) * .025)
        if (y > 6.4) y = .2
        pos.setY(i, y)
      }
      pos.needsUpdate = true
      animated.dust.rotation.y = time * .002
    }
    for (const s of animated.smoke) {
      s.position.y += s.userData.vy * dt
      s.position.x = s.userData.baseX + Math.sin(time * .32 + s.userData.phase) * .65
      s.position.z = s.userData.baseZ + Math.cos(time * .24 + s.userData.phase) * .45
      const p = s.position.y / 7
      s.material.opacity = Math.max(0, .24 * (1 - p)) * (0.75 + Math.sin(time + s.userData.phase) * .12)
      s.scale.setScalar(1.6 + p * 3.6)
      if (s.position.y > 7.2) { s.position.y = .1; s.material.opacity = 0 }
    }
    for (const f of animated.flags) {
      f.rotation.y = Math.sin(time * 1.4) * .08
      f.rotation.z = Math.sin(time * .9) * .018
    }
    for (let i = 0; i < animated.bulbs.length; i++) {
      const b = animated.bulbs[i]
      if (b.isPointLight) b.intensity = (b.userData.baseIntensity ||= b.intensity) * (.94 + Math.sin(time * 7.3 + i * 2.1) * .035)
      else if (b.isSprite) b.material.opacity = .72 + Math.sin(time * 5 + i) * .09
    }
    animateCat(hero, time, 0, 0)
    animateCat(buddy, time * .85, 0, 0)
  }

  // Bounds and spawns
  const bounds = { minX: -11.1, maxX: 11.1, minZ: -21.7, maxZ: 15.5 }
  const spawnPoints = [
    new THREE.Vector3(-9.2, 0, -17.5), new THREE.Vector3(9.5, 0, -16.8),
    new THREE.Vector3(-10.2, 0, -12.3), new THREE.Vector3(10.4, 0, 6.8),
    new THREE.Vector3(-9.7, 0, 7.3), new THREE.Vector3(0, 0, -18.5),
    new THREE.Vector3(-4.2, 0, -19.5), new THREE.Vector3(4.8, 0, -19.2),
    new THREE.Vector3(-8.8, 0, 13.9), new THREE.Vector3(8.9, 0, 13.8)
  ]

  return {
    root, colliders, hitMeshes, spawnPoints, bounds, hero, buddy, createCatModel, animateCat, update,
    sun, water
  }
}
