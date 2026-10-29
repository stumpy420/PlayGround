import * as THREE from 'three';

function canvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return { c, ctx: c.getContext('2d') };
}

function grain(ctx, size, amount = 0.08, alpha = 0.14) {
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * amount;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    if (Math.random() < alpha) data[i + 3] = Math.max(0, data[i + 3] - 8);
  }
  ctx.putImageData(img, 0, 0);
}

function finish(c, repeat = [1, 1], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function sandTexture() {
  const size = 512;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#b99a72';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 8 + Math.random() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const warm = Math.random() > 0.5;
    g.addColorStop(0, warm ? 'rgba(214,184,137,.22)' : 'rgba(120,91,61,.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 6500; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.72 ? 'rgba(244,224,187,.34)' : v > 0.38 ? 'rgba(94,71,47,.3)' : 'rgba(160,131,92,.3)';
    const s = Math.random() * 2.1 + 0.4;
    ctx.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
  ctx.strokeStyle = 'rgba(82,63,44,.16)';
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    let x = Math.random() * size, y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 40;
      y += Math.random() * 25;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grain(ctx, size, 0.14, 0.05);
  return finish(c, [18, 18]);
}

export function sandBump() {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {
    const v = 90 + Math.random() * 90 | 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    const s = Math.random() * 2.4 + 0.4;
    ctx.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
  grain(ctx, size, 0.1, 0);
  return finish(c, [22, 22], false);
}

export function pavementTexture() {
  const size = 512;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#8d8273';
  ctx.fillRect(0, 0, size, size);
  const tile = size / 4;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = 120 + Math.random() * 32;
      ctx.fillStyle = `rgb(${v + 20},${v + 14},${v})`;
      ctx.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6);
      if (Math.random() > 0.55) {
        ctx.fillStyle = 'rgba(45,40,32,.12)';
        ctx.beginPath();
        ctx.ellipse(x * tile + tile * 0.5, y * tile + tile * 0.55, tile * 0.28, tile * 0.2, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.strokeStyle = 'rgba(49,44,36,.62)';
  ctx.lineWidth = 5;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke();
  }
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50,45,37,.17)' : 'rgba(225,215,197,.1)';
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 4 + 1, Math.random() * 4 + 1);
  }
  grain(ctx, size, 0.12, 0.08);
  return finish(c, [8, 8]);
}

export function wallTexture() {
  const size = 512;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#b09370';
  ctx.fillRect(0, 0, size, size);
  const rowH = 64;
  for (let row = 0; row < 8; row++) {
    const offset = row % 2 ? 52 : 0;
    for (let x = -1; x < 6; x++) {
      const w = 92 + Math.random() * 12;
      const px = x * 104 + offset + 4;
      const py = row * rowH + 4;
      const v = 165 + Math.random() * 26;
      ctx.fillStyle = `rgb(${v},${v - 24},${v - 56})`;
      ctx.fillRect(px, py, w, rowH - 8);
      ctx.fillStyle = 'rgba(255,245,220,.08)';
      ctx.fillRect(px, py, w, 3);
      ctx.fillStyle = 'rgba(58,44,32,.12)';
      ctx.fillRect(px, py + rowH - 11, w, 3);
      if (Math.random() > 0.7) {
        ctx.strokeStyle = 'rgba(74,57,40,.2)';
        ctx.beginPath();
        ctx.moveTo(px + 15, py + 10);
        ctx.lineTo(px + 28, py + 24);
        ctx.lineTo(px + 20, py + 42);
        ctx.stroke();
      }
    }
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(235,215,180,.14)' : 'rgba(58,45,31,.15)';
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 5, Math.random() * 5);
  }
  grain(ctx, size, 0.12, 0.06);
  return finish(c, [4, 2]);
}

export function crateTexture(label = 'TUNA', accent = '#d2572b') {
  const size = 512;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#9b7043';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5; i++) {
    const x = i * (size / 5);
    const v = 130 + Math.random() * 32;
    ctx.fillStyle = `rgb(${v},${v - 38},${v - 74})`;
    ctx.fillRect(x + 3, 0, size / 5 - 6, size);
    ctx.strokeStyle = 'rgba(69,46,24,.44)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, 0, size / 5 - 6, size);
    ctx.strokeStyle = 'rgba(66,43,23,.2)';
    for (let g = 0; g < 8; g++) {
      ctx.beginPath();
      const gx = x + 12 + Math.random() * (size / 5 - 24);
      ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + 8, 130, gx - 6, 320, gx + 4, size);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(56,36,18,.7)';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, size - 16, size - 16);
  ctx.fillStyle = accent;
  ctx.fillRect(size * 0.2, size * 0.38, size * 0.6, size * 0.24);
  ctx.fillStyle = '#f3e5ca';
  ctx.font = '700 46px Rajdhani, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, size / 2, size * 0.5);
  ctx.font = '600 17px Rajdhani, Arial, sans-serif';
  ctx.fillStyle = 'rgba(243,229,202,.72)';
  ctx.fillText('CAT MARINE CORPS · FRESH CATCH', size / 2, size * 0.66);
  ctx.fillStyle = 'rgba(32,20,9,.65)';
  for (const [x, y] of [[20, 20], [size - 20, 20], [20, size - 20], [size - 20, size - 20]]) {
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
  }
  grain(ctx, size, 0.08, 0.02);
  return finish(c, [1, 1]);
}

export function metalTexture(base = '#6b756e') {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(192,73,34,.18)' : 'rgba(40,37,30,.18)';
    const x = Math.random() * size, y = Math.random() * size, r = Math.random() * 18 + 2;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, Math.random() * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  for (let i = 0; i < 10; i++) ctx.fillRect(0, Math.random() * size, size, 1);
  grain(ctx, size, 0.16, 0.05);
  return finish(c, [2, 1]);
}

export function awningTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#e7d8ba';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#c44a24';
  for (let i = 0; i < 4; i++) ctx.fillRect(i * 64 + 10, 0, 38, size);
  ctx.fillStyle = 'rgba(72,44,20,.1)';
  for (let i = 0; i < 300; i++) ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2 + 1, Math.random() * 9);
  grain(ctx, size, 0.06, 0.02);
  return finish(c, [4, 4]);
}

export function posterTexture(lines = ['OBEY', 'THE CLAW'], accent = '#e05a27') {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = '#e6d8bd';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, size, 58);
  ctx.fillStyle = '#1e1710';
  ctx.font = '700 24px Rajdhani, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAT MARINE CORPS', size / 2, 37);
  ctx.fillStyle = '#2a2016';
  ctx.font = '400 48px Bebas, Impact, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, size / 2, 124 + i * 44));
  ctx.strokeStyle = 'rgba(44,31,18,.5)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(size / 2, size * 0.79, 30, 0.2, Math.PI * 1.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size / 2 - 28, size * 0.88); ctx.lineTo(size / 2 + 28, size * 0.88); ctx.stroke();
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(60,44,26,.14)' : 'rgba(255,250,235,.1)';
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 3 + 1, Math.random() * 3 + 1);
  }
  return finish(c, [1, 1]);
}

export function signTexture(text = 'FISH MARKET', color = '#ff9b45') {
  const w = 512, h = 160;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#14150f';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.font = '400 78px Bebas, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = color;
  ctx.fillText(text, w / 2, h / 2 + 2);
  ctx.shadowBlur = 0;
  ctx.font = '600 14px Rajdhani, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.52)';
  ctx.fillText('OPEN 24 HOURS · CASH ONLY · NO DOGS', w / 2, h - 28);
  return finish(c, [1, 1]);
}

export function radialTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,180,80,.45)', outer = 'rgba(255,120,20,0)', size = 128) {
  const { c, ctx } = canvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.28, mid);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function flareTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.translate(size / 2, size / 2);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
  g.addColorStop(0, 'rgba(255,255,238,1)');
  g.addColorStop(0.18, 'rgba(255,222,150,.95)');
  g.addColorStop(0.42, 'rgba(255,132,38,.42)');
  g.addColorStop(1, 'rgba(255,90,10,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    const lg = ctx.createLinearGradient(0, 0, size * 0.54, 0);
    lg.addColorStop(0, 'rgba(255,240,190,.8)');
    lg.addColorStop(1, 'rgba(255,130,30,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(0, -2.5); ctx.lineTo(size * 0.54, 0); ctx.lineTo(0, 2.5); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function cloudTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 24; i++) {
    const x = size * (0.2 + Math.random() * 0.6);
    const y = size * (0.35 + Math.random() * 0.3);
    const r = size * (0.08 + Math.random() * 0.22);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,236,210,.42)');
    g.addColorStop(0.55, 'rgba(238,196,166,.15)');
    g.addColorStop(1, 'rgba(220,170,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function catFurTexture(base = '#c47a3a', dark = '#82451f') {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = dark;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 2;
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, y + 8 + Math.random() * 15);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (base !== '#6b6f70') {
    ctx.strokeStyle = 'rgba(60,32,12,.22)';
    ctx.lineWidth = 10;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * size);
      ctx.bezierCurveTo(size * 0.3, Math.random() * size, size * 0.6, Math.random() * size, size, Math.random() * size);
      ctx.stroke();
    }
  }
  grain(ctx, size, 0.08, 0.02);
  return finish(c, [2, 2]);
}

export function minimapFloor() {
  return null;
}
