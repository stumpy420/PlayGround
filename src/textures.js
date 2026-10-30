import * as THREE from 'three';

function rng(seed = 1337) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function finish(canvas, renderer, { repeat = 1, srgb = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function speckle(ctx, size, count, colors, alpha = 0.14, r = 1.4) {
  const rand = rng(size * 7 + count);
  for (let i = 0; i < count; i++) {
    const c = colors[(rand() * colors.length) | 0];
    ctx.fillStyle = c;
    ctx.globalAlpha = alpha * (0.3 + rand());
    const radius = r * (0.4 + rand() * 1.6);
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function sandTexture(renderer) {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, '#c4a675');
  g.addColorStop(0.5, '#b8996a');
  g.addColorStop(1, '#c9ab7d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);

  const rand = rng(77);
  for (let i = 0; i < 70; i++) {
    const x = rand() * s;
    const y = rand() * s;
    const r = 18 + rand() * 90;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rand() > 0.5;
    rg.addColorStop(0, dark ? 'rgba(94,74,46,.13)' : 'rgba(240,218,170,.12)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // wind-blown strata
  for (let i = 0; i < 34; i++) {
    ctx.strokeStyle = `rgba(97,76,48,${0.03 + rand() * 0.08})`;
    ctx.lineWidth = 0.7 + rand() * 2.5;
    ctx.beginPath();
    const y = rand() * s;
    ctx.moveTo(0, y);
    for (let x = 0; x <= s; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 3 + (rand() - 0.5) * 2);
    ctx.stroke();
  }
  speckle(ctx, s, 5200, ['#8b6f45', '#e4cb9b', '#6f5838', '#f0dcae'], 0.16, 1.1);
  return finish(c, renderer, { repeat: 1 });
}

function bumpFrom(ctx, size, renderer) {
  const c = makeCanvas(size);
  const b = c.getContext('2d');
  b.drawImage(ctx.canvas, 0, 0);
  const data = b.getImageData(0, 0, size, size);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = (data.data[i] * 0.3 + data.data[i + 1] * 0.59 + data.data[i + 2] * 0.11);
    const n = Math.max(0, Math.min(255, 96 + (v - 150) * 0.9));
    data.data[i] = data.data[i + 1] = data.data[i + 2] = n;
  }
  b.putImageData(data, 0, 0);
  return finish(c, renderer, { srgb: false });
}

function wallTexture(renderer) {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9f835a';
  ctx.fillRect(0, 0, s, s);
  const rand = rng(4102);
  const rows = 6;
  const cols = 4;
  const bh = s / rows;
  const bw = s / cols;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * bw * 0.5;
    for (let col = -1; col < cols + 1; col++) {
      const x = col * bw + offset;
      const y = r * bh;
      const shade = 0.85 + rand() * 0.3;
      ctx.fillStyle = `rgb(${Math.round(186 * shade)},${Math.round(157 * shade)},${Math.round(116 * shade)})`;
      ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      ctx.strokeStyle = 'rgba(77,60,38,.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
      // chipped edge
      ctx.fillStyle = `rgba(91,73,48,${0.1 + rand() * 0.18})`;
      ctx.fillRect(x + 4 + rand() * 20, y + 4, 3 + rand() * 18, bh - 9);
      ctx.fillStyle = `rgba(242,220,178,${0.04 + rand() * 0.08})`;
      ctx.fillRect(x + 5, y + 5, bw - 12, 2);
    }
  }
  // mortar grain
  speckle(ctx, s, 3000, ['#6d5638', '#d8bd8b', '#58452d'], 0.14, 1.2);
  // long cracks
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = 'rgba(62,47,28,.35)';
    ctx.lineWidth = 1.2;
    let x = rand() * s;
    let y = rand() * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      x += (rand() - 0.5) * 40;
      y += rand() * 34;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return { map: finish(c, renderer), bump: bumpFrom(ctx, s, renderer) };
}

function crateTexture(renderer) {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const rand = rng(9901);
  ctx.fillStyle = '#87663f';
  ctx.fillRect(0, 0, s, s);
  const planks = 5;
  for (let i = 0; i < planks; i++) {
    const y = (i * s) / planks;
    const shade = 0.8 + rand() * 0.35;
    ctx.fillStyle = `rgb(${Math.round(128 * shade)},${Math.round(96 * shade)},${Math.round(58 * shade)})`;
    ctx.fillRect(0, y + 2, s, s / planks - 4);
    ctx.strokeStyle = 'rgba(53,38,22,.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, y + 1, s, s / planks - 2);
    for (let k = 0; k < 18; k++) {
      ctx.strokeStyle = `rgba(56,40,23,${0.04 + rand() * 0.08})`;
      ctx.beginPath();
      const yy = y + 5 + rand() * (s / planks - 10);
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(s * 0.3, yy + rand() * 7, s * 0.7, yy - rand() * 7, s, yy + (rand() - 0.5) * 5);
      ctx.stroke();
    }
  }
  // metal bands
  ctx.fillStyle = '#4f4a3c';
  ctx.fillRect(0, 40, s, 22);
  ctx.fillRect(0, s - 62, s, 22);
  ctx.fillRect(40, 0, 22, s);
  ctx.fillRect(s - 62, 0, 22, s);
  ctx.fillStyle = 'rgba(206,192,158,.25)';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(24 + rand() * (s - 48), 24 + rand() * (s - 48), 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // stencil
  ctx.save();
  ctx.translate(s / 2, s / 2);
  ctx.rotate(-0.04);
  ctx.font = 'bold 64px Impact, Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(38,34,24,.75)';
  ctx.fillText('7.62', 0, 8);
  ctx.font = 'bold 22px monospace';
  ctx.fillText('CT-ORDNANCE', 0, 44);
  ctx.restore();
  speckle(ctx, s, 2600, ['#5c452b', '#c6a974'], 0.14, 1.3);
  return { map: finish(c, renderer), bump: bumpFrom(ctx, s, renderer) };
}

function metalTexture(renderer) {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const rand = rng(301);
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, '#5a5d55');
  g.addColorStop(0.45, '#42463f');
  g.addColorStop(1, '#565a51');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 80; i++) {
    ctx.strokeStyle = `rgba(${rand() > 0.5 ? '210,205,185' : '30,32,28'},${0.04 + rand() * 0.1})`;
    ctx.lineWidth = 0.6 + rand() * 1.8;
    const x = rand() * s;
    const y = rand() * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 120, y + (rand() - 0.5) * 22);
    ctx.stroke();
  }
  for (let y = 32; y < s; y += 96) {
    for (let x = 28; x < s; x += 96) {
      ctx.fillStyle = 'rgba(20,22,19,.55)';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,218,196,.18)';
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  speckle(ctx, s, 1500, ['#20231e', '#9b9c8b'], 0.1, 1);
  return { map: finish(c, renderer), bump: bumpFrom(ctx, s, renderer) };
}

function tarpTexture(renderer) {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const rand = rng(55);
  ctx.fillStyle = '#555a3d';
  ctx.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 32) {
    ctx.fillStyle = `rgba(230,220,185,${0.02 + rand() * 0.03})`;
    ctx.fillRect(x, 0, 2, s);
    ctx.fillStyle = 'rgba(20,24,14,.12)';
    ctx.fillRect(x + 16, 0, 1, s);
  }
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = `rgba(30,34,20,${0.04 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(rand() * s, rand() * s, 10 + rand() * 60, 4 + rand() * 16, rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, s, 1200, ['#7d805c', '#333823'], 0.12, 1.4);
  return finish(c, renderer);
}

function screenTexture(renderer) {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#06130d';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(100,230,194,.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i < s; i += 16) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, s); ctx.stroke();
  }
  const rand = rng(12);
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(100,230,194,${0.15 + rand() * 0.4})`;
    ctx.fillRect(18 + rand() * 130, 20 + rand() * 210, 10 + rand() * 70, 2);
  }
  ctx.fillStyle = '#64e6c2';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('DEFUSE', 18, 52);
  ctx.font = 'bold 13px monospace';
  ctx.fillText('PROTOCOL // 06', 18, 74);
  ctx.strokeStyle = 'rgba(100,230,194,.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 96, 220, 100);
  ctx.beginPath();
  ctx.moveTo(24, 160);
  for (let x = 24; x < 232; x += 8) ctx.lineTo(x, 150 + Math.sin(x * 0.1) * 12 + rand() * 8);
  ctx.stroke();
  const tex = finish(c, renderer, { srgb: true });
  return tex;
}

function paintTexture(renderer, kind = 'A') {
  const s = 512;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, s, s);
  ctx.translate(s / 2, s / 2);
  if (kind === 'A') {
    ctx.strokeStyle = 'rgba(238,226,196,.86)';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(0, 0, 196, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 152, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(238,226,196,.9)';
    ctx.font = 'bold 210px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', 0, 16);
    // worn paint
    ctx.globalCompositeOperation = 'destination-out';
    const rand = rng(88);
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc((rand() - 0.5) * 360, (rand() - 0.5) * 360, 1 + rand() * 9, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = 'rgba(238,226,196,.8)';
    ctx.font = 'bold 52px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(kind, 0, 0);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function hazardTexture(renderer) {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1a16';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(245,185,66,.85)';
  ctx.lineWidth = 22;
  for (let i = -s; i < s * 2; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + s, s);
    ctx.stroke();
  }
  const tex = finish(c, renderer);
  return tex;
}

function softParticle(renderer) {
  const s = 64;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function markerTexture(renderer) {
  const s = 128;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.translate(s / 2, s / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = 'rgba(245,185,66,.18)';
  ctx.fillRect(-34, -34, 68, 68);
  ctx.strokeStyle = 'rgba(255,211,106,.95)';
  ctx.lineWidth = 5;
  ctx.strokeRect(-30, -30, 60, 60);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = '#ffd36a';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 0, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTextures(renderer) {
  const sand = sandTexture(renderer);
  const wall = wallTexture(renderer);
  const crate = crateTexture(renderer);
  const metal = metalTexture(renderer);
  return {
    sand,
    wall: wall.map,
    wallBump: wall.bump,
    crate: crate.map,
    crateBump: crate.bump,
    metal: metal.map,
    metalBump: metal.bump,
    tarp: tarpTexture(renderer),
    screen: screenTexture(renderer),
    paintA: paintTexture(renderer, 'A'),
    graffiti: {
      long: paintTexture(renderer, 'LONG'),
      mid: paintTexture(renderer, 'MID'),
      site: paintTexture(renderer, 'SITE A'),
    },
    hazard: hazardTexture(renderer),
    soft: softParticle(renderer),
    marker: markerTexture(renderer),
  };
}
