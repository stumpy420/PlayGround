import * as THREE from 'three'

const cache = new Map()

function canvasTexture(key, width, height, draw, opts = {}) {
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  draw(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  if (opts.repeat) texture.repeat.set(opts.repeat[0], opts.repeat[1])
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

function noise(ctx, w, h, amount, alpha, light = false) {
  for (let i = 0; i < amount; i++) {
    const v = light ? 255 : 0
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`
    const s = Math.random() * 3 + 0.4
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s)
  }
}

function grain(ctx, w, h, base, amount = 1300) {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < amount; i++) {
    const a = Math.random() * 0.09
    ctx.fillStyle = Math.random() > .5 ? `rgba(255,245,220,${a})` : `rgba(30,22,15,${a * 1.4})`
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2 + .4, Math.random() * 2 + .4)
  }
}

export function sandTexture() {
  return canvasTexture('sand', 512, 512, (ctx, w, h) => {
    grain(ctx, w, h, '#9b8262', 2800)
    for (let i = 0; i < 17; i++) {
      ctx.strokeStyle = `rgba(58,45,33,${Math.random() * .16 + .04})`
      ctx.lineWidth = Math.random() * 2 + .5
      ctx.beginPath()
      let x = Math.random() * w
      let y = Math.random() * h
      ctx.moveTo(x, y)
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - .5) * 90
        y += (Math.random() - .5) * 90
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    for (let i = 0; i < 55; i++) {
      ctx.fillStyle = `rgba(${Math.random() > .5 ? '190,170,134' : '80,67,50'},${Math.random() * .25})`
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.5 + .4, 0, Math.PI * 2)
      ctx.fill()
    }
    noise(ctx, w, h, 900, .1)
  }, { repeat: [10, 10] })
}

export function concreteTexture() {
  return canvasTexture('concrete', 512, 512, (ctx, w, h) => {
    grain(ctx, w, h, '#8a8373', 1900)
    ctx.strokeStyle = 'rgba(38,34,28,.24)'
    ctx.lineWidth = 2
    for (let x = 0; x <= w; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y <= h; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(45,40,31,${Math.random() * .15})`
      ctx.beginPath()
      ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 7 + 1, Math.random() * 4 + 1, Math.random() * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(39,34,27,.28)'
    ctx.lineWidth = 1.2
    for (let i = 0; i < 11; i++) {
      let x = Math.random() * w, y = Math.random() * h
      ctx.beginPath(); ctx.moveTo(x, y)
      for (let j = 0; j < 4; j++) { x += (Math.random() - .5) * 38; y += Math.random() * 30; ctx.lineTo(x, y) }
      ctx.stroke()
    }
  }, { repeat: [4, 4] })
}

export function stuccoTexture(base = '#b49a78') {
  return canvasTexture('stucco' + base, 512, 512, (ctx, w, h) => {
    grain(ctx, w, h, base, 4000)
    for (let i = 0; i < 34; i++) {
      const grad = ctx.createLinearGradient(0, Math.random() * h, 0, h)
      grad.addColorStop(0, 'rgba(44,35,25,0)')
      grad.addColorStop(1, `rgba(44,35,25,${Math.random() * .1})`)
      ctx.fillStyle = grad
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 12 + 2, Math.random() * 100 + 10)
    }
  }, { repeat: [2, 2] })
}

export function containerTexture(hue = '#a54f33', id = 'SARDINE CO.') {
  return canvasTexture('container' + hue + id, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = hue
    ctx.fillRect(0, 0, w, h)
    for (let x = 0; x < w; x += 18) {
      const grad = ctx.createLinearGradient(x, 0, x + 18, 0)
      grad.addColorStop(0, 'rgba(255,255,255,.03)')
      grad.addColorStop(.42, 'rgba(0,0,0,.1)')
      grad.addColorStop(.72, 'rgba(255,255,255,.035)')
      grad.addColorStop(1, 'rgba(0,0,0,.13)')
      ctx.fillStyle = grad
      ctx.fillRect(x, 0, 18, h)
    }
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * w
      ctx.fillStyle = `rgba(52,38,23,${Math.random() * .13})`
      ctx.fillRect(x, Math.random() * h, Math.random() * 5 + 1, Math.random() * 100 + 10)
    }
    ctx.strokeStyle = 'rgba(29,24,19,.3)'
    ctx.lineWidth = 6
    ctx.strokeRect(7, 7, w - 14, h - 14)
    ctx.fillStyle = 'rgba(240,231,209,.66)'
    ctx.font = '600 23px monospace'
    ctx.fillText(id, 36, 78)
    ctx.font = '600 13px monospace'
    ctx.fillText('F.E.U. / LOGISTICS', 36, 105)
    ctx.strokeStyle = 'rgba(240,231,209,.25)'
    ctx.lineWidth = 1
    ctx.strokeRect(34, 116, 118, 34)
    ctx.fillStyle = 'rgba(240,231,209,.35)'
    ctx.font = '10px monospace'
    ctx.fillText('NET WT. 9 LIVES', 43, 138)
  })
}

export function woodTexture() {
  return canvasTexture('wood', 512, 512, (ctx, w, h) => {
    grain(ctx, w, h, '#8f673e', 1400)
    for (let i = 0; i < 22; i++) {
      ctx.strokeStyle = `rgba(49,31,17,${Math.random() * .22 + .05})`
      ctx.lineWidth = Math.random() * 2.5 + .5
      ctx.beginPath()
      let y = Math.random() * h
      ctx.moveTo(0, y)
      for (let x = 0; x <= w; x += 30) ctx.lineTo(x, y + Math.sin(x * .02 + i) * 3 + (Math.random() - .5) * 3)
      ctx.stroke()
    }
    for (let x = 0; x < w; x += 128) {
      ctx.fillStyle = 'rgba(43,27,14,.24)'
      ctx.fillRect(x, 0, 3, h)
    }
    ctx.fillStyle = 'rgba(30,20,12,.19)'
    ctx.fillRect(0, 170, w, 4)
    ctx.fillRect(0, 358, w, 4)
  }, { repeat: [2, 1] })
}

export function metalTexture() {
  return canvasTexture('metal', 256, 256, (ctx, w, h) => {
    grain(ctx, w, h, '#545b55', 1200)
    for (let i = 0; i < 16; i++) {
      const y = Math.random() * h
      ctx.fillStyle = `rgba(28,29,25,${Math.random() * .22})`
      ctx.fillRect(0, y, w, Math.random() * 4 + 1)
    }
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(201,128,61,${Math.random() * .14})`
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 8 + 1, 0, Math.PI * 2); ctx.fill()
    }
  })
}

export function awningTexture(colorA = '#8f3521', colorB = '#d5b886') {
  return canvasTexture('awning' + colorA + colorB, 256, 128, (ctx, w, h) => {
    ctx.fillStyle = colorA
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = colorB
    for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 32, h)
    ctx.fillStyle = 'rgba(0,0,0,.18)'
    ctx.fillRect(0, h - 8, w, 8)
    grain(ctx, w, h, 'rgba(0,0,0,0)', 300)
  })
}

export function signTexture() {
  return canvasTexture('sign', 512, 192, (ctx, w, h) => {
    ctx.fillStyle = '#0f1713'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(183,240,106,.5)'
    ctx.lineWidth = 3
    ctx.strokeRect(6, 6, w - 12, h - 12)
    ctx.fillStyle = '#d7f5a2'
    ctx.textAlign = 'center'
    ctx.font = '800 72px "Barlow Condensed", sans-serif'
    ctx.fillText('SARDINE CO.', w / 2, 89)
    ctx.fillStyle = 'rgba(183,240,106,.55)'
    ctx.font = '20px monospace'
    ctx.fillText('FISH  ·  ICE  ·  LIVE BAIT', w / 2, 126)
    ctx.fillStyle = 'rgba(255,107,24,.8)'
    ctx.fillRect(156, 145, 200, 3)
    ctx.font = '11px monospace'
    ctx.fillText('OPEN SINCE 1892', w / 2, 171)
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = 'rgba(183,240,106,.03)'
    for (let y = 0; y < h; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  })
}

export function posterTexture(variant = 0) {
  return canvasTexture('poster' + variant, 384, 512, (ctx, w, h) => {
    ctx.fillStyle = variant ? '#ddd0b0' : '#c74a25'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = variant ? '#1a1f1a' : '#15120e'
    ctx.textAlign = 'center'
    ctx.font = '800 54px "Barlow Condensed", sans-serif'
    ctx.fillText(variant ? 'ADOPT A' : 'THE RED PAW', w / 2, 68)
    ctx.fillText(variant ? 'TROOPER' : 'OWNS THIS', w / 2, 122)
    ctx.font = '800 72px "Barlow Condensed", sans-serif'
    ctx.fillStyle = variant ? '#a84020' : '#f2e8d5'
    ctx.fillText(variant ? 'TODAY' : 'MARKET', w / 2, 198)
    // stylized cat face
    ctx.save()
    ctx.translate(w / 2, 330)
    ctx.fillStyle = variant ? '#1a1f1a' : 'rgba(242,232,213,.9)'
    ctx.beginPath()
    ctx.moveTo(-90, -20); ctx.lineTo(-98, -106); ctx.lineTo(-45, -65)
    ctx.quadraticCurveTo(0, -78, 45, -65); ctx.lineTo(98, -106); ctx.lineTo(90, -20)
    ctx.quadraticCurveTo(112, 34, 58, 73); ctx.quadraticCurveTo(0, 112, -58, 73); ctx.quadraticCurveTo(-112, 34, -90, -20)
    ctx.fill()
    ctx.fillStyle = variant ? '#ddd0b0' : '#c74a25'
    ctx.beginPath(); ctx.ellipse(-38, 8, 17, 7, -.1, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(38, 8, 17, 7, .1, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = variant ? '#1a1f1a' : '#15120e'
    ctx.beginPath(); ctx.moveTo(0, 35); ctx.lineTo(-14, 23); ctx.lineTo(14, 23); ctx.fill()
    ctx.strokeStyle = variant ? '#1a1f1a' : '#15120e'
    ctx.lineWidth = 5
    ctx.beginPath(); ctx.moveTo(-18, 52); ctx.quadraticCurveTo(0, 63, 18, 52); ctx.stroke()
    ctx.restore()
    ctx.fillStyle = variant ? '#1a1f1a' : '#f2e8d5'
    ctx.font = '600 16px monospace'
    ctx.fillText(variant ? 'F.E.U. RECRUITMENT OFFICE' : 'OBEY. SCRATCH. SURVIVE.', w / 2, 473)
  })
}

export function pawFlagTexture() {
  return canvasTexture('flag', 512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#702013'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(242,232,213,.92)'
    ctx.beginPath()
    ctx.ellipse(w / 2, 172, 80, 70, 0, 0, Math.PI * 2); ctx.fill()
    const toes = [[-82, 90, 30], [-28, 64, 30], [28, 64, 30], [82, 90, 30]]
    for (const [x, y, r] of toes) { ctx.beginPath(); ctx.ellipse(w / 2 + x, y, r, r * 1.18, 0, 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = 'rgba(255,107,24,.9)'
    ctx.fillRect(40, 266, w - 80, 3)
    ctx.font = '700 19px monospace'
    ctx.fillStyle = '#f2e8d5'
    ctx.textAlign = 'center'
    ctx.fillText('RED PAW SYNDICATE', w / 2, 298)
    grain(ctx, w, h, 'rgba(0,0,0,0)', 500)
  })
}

export function glowTexture(color = 'rgba(255,142,50,1)') {
  return canvasTexture('glow' + color, 128, 128, (ctx, w, h) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grad.addColorStop(0, 'rgba(255,255,235,1)')
    grad.addColorStop(.12, color)
    grad.addColorStop(.42, color.replace(/[\d.]+\)$/, '.24)'))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  })
}

export function smokeTexture() {
  return canvasTexture('smoke', 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w / 2)
    grad.addColorStop(0, 'rgba(190,180,165,.6)')
    grad.addColorStop(.35, 'rgba(130,124,114,.28)')
    grad.addColorStop(1, 'rgba(80,80,80,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 18; i++) {
      const x = w * .5 + (Math.random() - .5) * 80
      const y = h * .5 + (Math.random() - .5) * 80
      const r = Math.random() * 55 + 15
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, r)
      g2.addColorStop(0, `rgba(170,162,148,${Math.random() * .1})`)
      g2.addColorStop(1, 'rgba(100,100,100,0)')
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  })
}

export function cloudTexture() {
  return canvasTexture('cloud', 512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < 22; i++) {
      const x = w * .5 + (Math.random() - .5) * 360
      const y = h * .55 + (Math.random() - .5) * 80
      const rx = Math.random() * 100 + 50
      const ry = Math.random() * 30 + 16
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx)
      g.addColorStop(0, `rgba(72,48,48,${Math.random() * .16 + .05})`)
      g.addColorStop(1, 'rgba(50,40,45,0)')
      ctx.fillStyle = g
      ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    }
  })
}

export function postLampTexture() {
  return canvasTexture('lamp', 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(255,249,210,1)')
    g.addColorStop(.17, 'rgba(255,211,126,.95)')
    g.addColorStop(.48, 'rgba(255,138,54,.21)')
    g.addColorStop(1, 'rgba(255,105,20,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  })
}

export function iconTexture(kind = 'paw') {
  return canvasTexture('icon' + kind, 128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(255,196,140,.95)'
    ctx.fillStyle = 'rgba(255,196,140,.95)'
    ctx.lineWidth = 5
    if (kind === 'paw') {
      ctx.beginPath(); ctx.ellipse(64, 78, 25, 22, 0, 0, Math.PI * 2); ctx.fill()
      for (const [x, y] of [[32, 48], [53, 34], [75, 34], [96, 48]]) { ctx.beginPath(); ctx.ellipse(x, y, 9, 11, 0, 0, Math.PI * 2); ctx.fill() }
    } else if (kind === 'cross') {
      ctx.beginPath(); ctx.arc(64, 64, 30, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(64, 20); ctx.lineTo(64, 108); ctx.moveTo(20, 64); ctx.lineTo(108, 64); ctx.stroke()
    }
  })
}
