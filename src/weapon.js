import * as THREE from 'three'
import { glowTexture } from './textures.js'

const V = (x, y, z) => new THREE.Vector3(x, y, z)
const lerp = THREE.MathUtils.lerp

function std(color, roughness = .6, metalness = .15) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

export class Weapon {
  constructor(camera, scene) {
    this.camera = camera
    this.root = new THREE.Group()
    this.root.position.set(.30, -.315, -.65)
    this.root.rotation.set(-.015, -.05, 0)
    this.root.scale.setScalar(.72)
    camera.add(this.root)

    this.restPos = V(.30, -.315, -.65)
    this.aimPos = V(.001, -.176, -.82)
    this.recoil = 0
    this.recoilKick = 0
    this.reloadT = 0
    this.reloading = false
    this.aiming = false
    this.aimBlend = 0
    this.bobPhase = 0
    this.sway = new THREE.Vector2()
    this.swayTarget = new THREE.Vector2()
    this.flashT = 0
    this.shells = []
    this.muzzleWorld = new THREE.Vector3()

    this.build()
    this.light = new THREE.PointLight(0xffd8b8, .52, 2.1, 2)
    this.light.position.set(.15, .32, .35)
    camera.add(this.light)

    this.flashLight = new THREE.PointLight(0xff9b45, 0, 6, 2)
    this.flashLight.position.set(.08, -.02, -1.35)
    camera.add(this.flashLight)

    if (scene) this.scene = scene
    this.setViewport(window.innerWidth / window.innerHeight)
  }

  setViewport(aspect) {
    this.aspect = aspect
    if (aspect < .75) {
      this.root.scale.setScalar(.55)
      this.restPos.set(.27, -.325, -.62)
      this.aimPos.set(.001, -.135, -.76)
      if (this.light) this.light.intensity = .72
    } else if (aspect < 1.15) {
      this.root.scale.setScalar(.63)
      this.restPos.set(.285, -.32, -.64)
      this.aimPos.set(.001, -.154, -.80)
      if (this.light) this.light.intensity = .64
    } else {
      this.root.scale.setScalar(.72)
      this.restPos.set(.30, -.315, -.65)
      this.aimPos.set(.001, -.176, -.82)
      if (this.light) this.light.intensity = .58
    }
  }

  build() {
    const gun = this.root
    const gunmetal = std(0x4a524b, .4, .52)
    const gunmetal2 = std(0x2b302b, .52, .3)
    const polymer = std(0x515947, .8, .04)
    const rubber = std(0x1b1d1a, .95, 0)
    const tan = std(0x8f7853, .9, .02)
    const accent = new THREE.MeshStandardMaterial({ color: 0xff6d1a, emissive: 0xff4b08, emissiveIntensity: 1.15, roughness: .5 })
    const lens = new THREE.MeshBasicMaterial({ color: 0xb7f06a })
    const fur = new THREE.MeshStandardMaterial({ color: 0xa86f40, roughness: .96 })
    const furLight = new THREE.MeshStandardMaterial({ color: 0xc49466, roughness: .98 })
    const glove = std(0x3a4034, .93)
    const gloveDark = std(0x252b23, .96)
    const pad = new THREE.MeshStandardMaterial({ color: 0xc77c83, roughness: .9 })

    const add = (geo, material, x, y, z, rx = 0, ry = 0, rz = 0, parent = gun) => {
      const m = new THREE.Mesh(geo, material)
      m.position.set(x, y, z)
      m.rotation.set(rx, ry, rz)
      m.castShadow = false
      m.receiveShadow = false
      parent.add(m)
      return m
    }

    // Main receiver
    add(new THREE.BoxGeometry(.15, .17, .62), gunmetal, 0, 0, -.1)
    add(new THREE.BoxGeometry(.162, .085, .36), gunmetal2, 0, .103, -.14)
    add(new THREE.BoxGeometry(.158, .035, .22), polymer, 0, .152, -.15)
    // rail teeth
    for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(.156, .018, .022), gunmetal, 0, .175, -.29 + i * .04)
    // handguard
    add(new THREE.BoxGeometry(.145, .14, .43), polymer, 0, .005, -.55)
    for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(.154, .018, .018), gunmetal, 0, .073, -.37 - i * .053)
    // rails / vents
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.012, .04, .06), gunmetal2, .076, .002, -.44 - i * .07)
    // barrel
    add(new THREE.CylinderGeometry(.027, .027, .36, 10), gunmetal, 0, .012, -.93, Math.PI / 2)
    add(new THREE.CylinderGeometry(.043, .038, .075, 10), gunmetal2, 0, .012, -1.13, Math.PI / 2)
    // gas block
    add(new THREE.BoxGeometry(.07, .08, .08), gunmetal2, 0, .05, -.79)
    // stock
    add(new THREE.BoxGeometry(.125, .15, .33), polymer, 0, -.005, .36)
    add(new THREE.BoxGeometry(.11, .21, .07), rubber, 0, -.04, .53)
    add(new THREE.BoxGeometry(.08, .06, .18), gunmetal, 0, .067, .29)
    // pistol grip
    add(new THREE.BoxGeometry(.08, .22, .1), rubber, 0, -.175, .105, .22)
    // trigger guard
    add(new THREE.TorusGeometry(.06, .009, 4, 10, Math.PI * 1.2), gunmetal, 0, -.12, -.02, 0, 0, -.3)
    add(new THREE.BoxGeometry(.012, .045, .012), gunmetal, 0, -.14, -.005)
    // magazine
    const mag = add(new THREE.BoxGeometry(.085, .31, .14), gunmetal2, 0, -.22, -.15, -.2)
    add(new THREE.BoxGeometry(.09, .045, .148), polymer, 0, -.36, -.19, -.2)
    // side details
    add(new THREE.BoxGeometry(.018, .045, .16), accent, -.083, .02, -.12)
    add(new THREE.CylinderGeometry(.012, .012, .02, 8), accent, -.09, -.02, -.36, 0, 0, Math.PI / 2)
    // optic
    add(new THREE.BoxGeometry(.095, .07, .17), gunmetal2, 0, .2, -.12)
    add(new THREE.CylinderGeometry(.058, .05, .23, 12), gunmetal, 0, .245, -.13, Math.PI / 2)
    add(new THREE.CylinderGeometry(.041, .041, .012, 12), lens, 0, .245, -.252, Math.PI / 2)
    add(new THREE.CylinderGeometry(.053, .053, .02, 12), gunmetal2, 0, .245, .005, Math.PI / 2)
    add(new THREE.CircleGeometry(.011, 12), new THREE.MeshBasicMaterial({ color: 0xff7a2a }), 0, .245, .018)
    add(new THREE.BoxGeometry(.035, .03, .055), gunmetal, 0, .175, -.06)
    // front sight
    add(new THREE.BoxGeometry(.055, .045, .035), gunmetal, 0, .10, -.68)
    add(new THREE.BoxGeometry(.008, .04, .01), accent, 0, .13, -.695)
    // flashlight
    add(new THREE.CylinderGeometry(.036, .032, .19, 10), gunmetal2, .084, .015, -.55, Math.PI / 2)
    add(new THREE.CircleGeometry(.029, 10), new THREE.MeshBasicMaterial({ color: 0xffd9a3 }), .084, .015, -.648)
    // sling loops
    add(new THREE.TorusGeometry(.025, .006, 4, 8), gunmetal, -.08, -.03, -.46, Math.PI / 2)
    add(new THREE.TorusGeometry(.021, .005, 4, 8), gunmetal, -.07, -.03, .31, Math.PI / 2)

    // Cat paw - trigger hand (gloved, with a little fur at the wrist)
    const rightPaw = new THREE.Group()
    rightPaw.position.set(.02, -.195, .105)
    rightPaw.rotation.set(-.13, .1, .05)
    rightPaw.scale.setScalar(.86)
    gun.add(rightPaw)
    add(new THREE.BoxGeometry(.2, .115, .17), gloveDark, .012, -.105, .085, .16, 0, 0, rightPaw)
    const palm = add(new THREE.SphereGeometry(.096, 12, 9), glove, 0, 0, -.055, 0, 0, 0, rightPaw)
    palm.scale.set(1.12, 1.22, .8)
    // a few fur tufts peeking out from the glove cuff
    for (let i = 0; i < 3; i++) {
      add(new THREE.ConeGeometry(.014, .05, 5), fur, -.045 + i * .043, -.045, .105, 1.9, 0, .2, rightPaw)
    }
    for (let i = 0; i < 3; i++) {
      const finger = add(new THREE.CapsuleGeometry(.027, .085, 3, 7), glove, -.052 + i * .05, .035, -.145, 0, 0, .16, rightPaw)
      finger.scale.set(1, 1, .82)
      add(new THREE.SphereGeometry(.02, 7, 5), furLight, -.052 + i * .05, .045, -.185, 0, 0, 0, rightPaw).scale.set(1, .8, 1.1)
    }
    add(new THREE.CapsuleGeometry(.04, .11, 3, 8), glove, -.115, -.06, -.06, 0, 0, -.7, rightPaw)
    add(new THREE.BoxGeometry(.02, .1, .12), std(0x191d19, .94), -.13, -.09, .06, .16, 0, 0, rightPaw)

    // Left paw on handguard
    const leftPaw = new THREE.Group()
    leftPaw.position.set(-.025, -.14, -.48)
    leftPaw.rotation.set(.2, -.08, -.05)
    gun.add(leftPaw)
    const forearm = add(new THREE.CapsuleGeometry(.058, .22, 3, 9), glove, -.02, -.105, .135, 1.18, 0, -.1, leftPaw)
    forearm.scale.set(1, 1, .9)
    add(new THREE.TorusGeometry(.062, .011, 4, 10), fur, -.02, -.02, .06, 1.25, 0, 0, leftPaw)
    add(new THREE.BoxGeometry(.16, .115, .17), gloveDark, -.01, .01, .045, 0, 0, 0, leftPaw)
    const palm2 = add(new THREE.SphereGeometry(.108, 12, 9), fur, 0, .03, -.02, 0, 0, 0, leftPaw)
    palm2.scale.set(1.18, .95, 1.05)
    for (let i = 0; i < 4; i++) {
      const finger = add(new THREE.CapsuleGeometry(.028, .11, 3, 7), fur, -.078 + i * .052, .01, -.09, 0, 0, -.12, leftPaw)
      finger.scale.set(1, 1, .85)
      add(new THREE.ConeGeometry(.011, .035, 5), creamClaw(), -.085 + i * .052, .02, -.16, Math.PI / 2, 0, 0, leftPaw)
    }
    add(new THREE.CapsuleGeometry(.042, .16, 3, 8), furLight, .125, -.02, .02, 0, 0, -1.15, leftPaw)
    for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(.018, 7, 5), pad, -.04 + i * .035, .045, .065, 0, 0, 0, leftPaw)

    // Wrist wraps
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(.19, .04, .12), tan, -.02, -.08 - i * .04, .155, 1.05, 0, -.12, leftPaw)

    // Hanging fish charm
    const charm = new THREE.Group()
    charm.position.set(.088, -.10, -.32)
    gun.add(charm)
    add(new THREE.TorusGeometry(.023, .005, 4, 9), gunmetal, 0, 0, 0, 0, 0, 0, charm)
    add(new THREE.CylinderGeometry(.003, .003, .08, 4), gunmetal, 0, -.04, 0, 0, 0, 0, charm)
    const fish = new THREE.Group()
    fish.position.set(0, -.095, 0)
    charm.add(fish)
    add(new THREE.SphereGeometry(.033, 8, 6), std(0x9d9e83, .55, .35), 0, 0, 0, 0, 0, 0, fish).scale.set(1.3, .65, .35)
    add(new THREE.ConeGeometry(.025, .045, 3), std(0x9d9e83, .55, .35), .055, 0, 0, 0, 0, -Math.PI / 2, fish)
    add(new THREE.CircleGeometry(.007, 6), new THREE.MeshBasicMaterial({ color: 0x1b1c17 }), -.018, .006, -.022, 0, 0, 0, fish)
    this.charm = charm

    // Muzzle flash
    const flashMat = new THREE.SpriteMaterial({ map: glowTexture('rgba(255,146,58,1)'), color: 0xffe1b1, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    this.flash = new THREE.Sprite(flashMat)
    this.flash.position.set(0, .012, -1.22)
    this.flash.scale.set(.5, .5, 1)
    this.flash.visible = false
    gun.add(this.flash)
    this.flash2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,213,136,1)'), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
    this.flash2.position.set(0, .012, -1.286)
    this.flash2.scale.set(.25, .25, 1)
    this.flash2.visible = false
    this.flash2.material.rotation = Math.PI / 4
    gun.add(this.flash2)

    // little status LED
    add(new THREE.SphereGeometry(.012, 7, 5), accent, .079, .065, -.24)

    this.mag = mag
    this.gun = gun
    this.rightPaw = rightPaw
    this.leftPaw = leftPaw
    this.root.traverse(o => {
      if (o.isMesh) {
        o.frustumCulled = false
        o.renderOrder = 5
      }
    })

    function creamClaw() {
      return new THREE.MeshStandardMaterial({ color: 0xd8c7a6, roughness: .7 })
    }
  }

  startReload(duration = 1.28) {
    this.reloading = true
    this.reloadT = 0
    this.reloadDuration = duration
  }

  stopReload() {
    this.reloading = false
    this.reloadT = 0
  }

  fire() {
    this.recoil = 1
    this.recoilKick = .055 + Math.random() * .035
    this.flashT = .055
    this.spawnShell()
    if (this.flash) {
      const s = .7 + Math.random() * .35
      this.flash.scale.set(s, s, 1)
      this.flash.material.rotation = Math.random() * Math.PI
      this.flash.visible = true
      this.flash2.scale.set(s * .6, s * .6, 1)
      this.flash2.visible = true
    }
    if (this.flashLight) this.flashLight.intensity = 5.5
  }

  spawnShell() {
    const material = new THREE.MeshStandardMaterial({ color: 0xc99a42, roughness: .35, metalness: .7 })
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.011, .011, .04, 6), material)
    mesh.position.set(.08, .07, -.08)
    mesh.rotation.set(Math.PI / 2, 0, .3)
    mesh.userData = { v: new THREE.Vector3(.7 + Math.random() * .6, .8 + Math.random() * .6, -.6 + Math.random() * .5), spin: new THREE.Vector3(5, 8, 12), life: 0 }
    this.camera.add(mesh)
    this.shells.push(mesh)
  }

  setSway(dx, dy) {
    this.swayTarget.x = THREE.MathUtils.clamp(dx * .00045, -.035, .035)
    this.swayTarget.y = THREE.MathUtils.clamp(dy * .0004, -.03, .03)
  }

  update(dt, time, moving = 0, sprinting = false, aiming = false) {
    this.aiming = aiming
    this.aimBlend = lerp(this.aimBlend, aiming ? 1 : 0, 1 - Math.exp(-dt * 13))
    this.sway.lerp(this.swayTarget, 1 - Math.exp(-dt * 7))
    this.swayTarget.multiplyScalar(Math.exp(-dt * 5))

    let reloadOffset = 0
    let reloadRoll = 0
    let reloadPitch = 0
    if (this.reloading) {
      this.reloadT += dt
      const t = Math.min(1, this.reloadT / this.reloadDuration)
      const bump = Math.sin(t * Math.PI)
      reloadOffset = -bump * .08
      reloadRoll = bump * .45
      reloadPitch = bump * .38
      if (t < .58) {
        this.mag.position.y = -.22 - Math.sin(Math.min(1, t / .58) * Math.PI) * .3
        this.mag.position.z = -.15 - Math.sin(Math.min(1, t / .58) * Math.PI) * .08
      } else {
        this.mag.position.y = -.22
        this.mag.position.z = -.15
      }
      if (t >= 1) {
        this.reloading = false
        this.reloadT = 0
        this.mag.position.set(0, -.22, -.15)
      }
    }

    this.bobPhase += dt * (sprinting ? 15.5 : 9.8) * moving
    const bob = moving * (sprinting ? .014 : .009) * (aiming ? .35 : 1)
    const bobX = Math.cos(this.bobPhase) * bob
    const bobY = Math.abs(Math.sin(this.bobPhase)) * bob * .7
    const idle = Math.sin(time * 1.7) * .0016
    const targetX = lerp(this.restPos.x, this.aimPos.x, this.aimBlend) + bobX + this.sway.x
    const targetY = lerp(this.restPos.y, this.aimPos.y, this.aimBlend) + bobY + idle + this.sway.y + reloadOffset
    const targetZ = lerp(this.restPos.z, this.aimPos.z, this.aimBlend) + this.recoil * .075
    this.root.position.x = lerp(this.root.position.x, targetX, 1 - Math.exp(-dt * 16))
    this.root.position.y = lerp(this.root.position.y, targetY, 1 - Math.exp(-dt * 16))
    this.root.position.z = lerp(this.root.position.z, targetZ, 1 - Math.exp(-dt * 20))
    this.root.rotation.y = lerp(this.root.rotation.y, -.05 + this.sway.x * .6 + (1 - this.aimBlend) * .03, 1 - Math.exp(-dt * 14))
    this.root.rotation.x = lerp(this.root.rotation.x, -.015 + this.recoil * -.045 + reloadPitch, 1 - Math.exp(-dt * 18))
    this.root.rotation.z = lerp(this.root.rotation.z, this.sway.y * .6 + reloadRoll + (sprinting ? Math.sin(this.bobPhase) * .025 : 0), 1 - Math.exp(-dt * 14))

    this.recoil *= Math.exp(-dt * 15)
    if (this.flashT > 0) {
      this.flashT -= dt
      this.flash.material.opacity = Math.max(0, this.flashT / .055)
      this.flash2.material.opacity = Math.max(0, this.flashT / .055)
      this.flashLight.intensity = Math.max(0, this.flashLight.intensity - dt * 100)
      if (this.flashT <= 0) {
        this.flash.visible = false
        this.flash2.visible = false
        this.flashLight.intensity = 0
      }
    }

    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i]
      const u = s.userData
      u.life += dt
      u.v.y -= 8.5 * dt
      s.position.addScaledVector(u.v, dt)
      s.rotation.x += u.spin.x * dt
      s.rotation.y += u.spin.y * dt
      s.rotation.z += u.spin.z * dt
      if (u.life > 1.15) {
        this.camera.remove(s)
        s.geometry.dispose()
        s.material.dispose()
        this.shells.splice(i, 1)
      }
    }
    if (this.charm) {
      this.charm.rotation.z = Math.sin(time * 4.2) * .08 + this.recoil * .3
      this.charm.rotation.x = Math.sin(time * 3.3) * .06
    }
  }

  getMuzzleWorldPosition(target = new THREE.Vector3()) {
    if (!this.flash) return target
    return this.flash.getWorldPosition(target)
  }
}
