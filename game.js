const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const healthEl = document.getElementById('health');
const waveEl = document.getElementById('wave');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

const keys = {};
const particles = [];

const world = {
  width: 800,
  height: 560,
  gate: { x: 0, y: -205, radius: 62 },
};

const player = {
  x: 0,
  y: 0,
  radius: 18,
  speed: 220,
  hp: 6,
  maxHp: 6,
  facing: 0,
  slashCD: 0,
  slashTimer: 0,
  parryTimer: 0,
  parryCD: 0,
  invuln: 0,
  score: 0,
  wave: 1,
};

let enemies = [];
let gameOver = false;
let victory = false;
let message = 'Defend the gate. Space = parry, J = slash.';
let frame = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function distance(aX, aY, bX, bY) {
  return Math.hypot(aX - bX, aY - bY);
}

function setMessage(text) {
  message = text;
  messageEl.textContent = text;
}

function updateHud() {
  healthEl.textContent = `${Math.max(0, player.hp)} / ${player.maxHp}`;
  waveEl.textContent = String(player.wave);
  scoreEl.textContent = String(player.score);
}

function addParticles(x, y, color, count, spread = 1) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: randomRange(-120, 120) * spread,
      vy: randomRange(-120, 120) * spread,
      life: randomRange(0.3, 0.9),
      color,
      radius: randomRange(2, 5),
    });
  }
}

function resetPlayer() {
  player.x = 0;
  player.y = 0;
  player.facing = 0;
  player.hp = player.maxHp;
  player.slashCD = 0;
  player.slashTimer = 0;
  player.parryTimer = 0;
  player.parryCD = 0;
  player.invuln = 0;
  player.score = 0;
  player.wave = 1;
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  const halfWidth = world.width / 2 - 24;
  const halfHeight = world.height / 2 - 24;

  if (side === 0) {
    x = randomRange(-halfWidth, halfWidth);
    y = -halfHeight;
  } else if (side === 1) {
    x = randomRange(-halfWidth, halfWidth);
    y = halfHeight;
  } else if (side === 2) {
    x = -halfWidth;
    y = randomRange(-halfHeight, halfHeight);
  } else {
    x = halfWidth;
    y = randomRange(-halfHeight, halfHeight);
  }

  const hp = 2 + Math.min(2, Math.floor(player.wave / 2));
  enemies.push({
    x,
    y,
    radius: 18,
    hp,
    maxHp: hp,
    speed: 60 + player.wave * 12 + Math.random() * 25,
    attackCD: randomRange(0.7, 1.4),
    attackWindup: 0,
    attackActive: 0,
    hitFlash: 0,
  });
}

function spawnWave(waveNumber) {
  const count = Math.min(2 + waveNumber, 9);
  for (let i = 0; i < count; i += 1) {
    spawnEnemy();
  }
  setMessage(`Wave ${waveNumber}: hold the line.`);
}

function startNewGame() {
  resetPlayer();
  enemies = [];
  particles.length = 0;
  gameOver = false;
  victory = false;
  setMessage('Defend the gate. Space = parry, J = slash.');
  spawnWave(player.wave);
  updateHud();
}

function slashAttack() {
  if (gameOver || victory) return;
  if (player.slashCD > 0) return;

  player.slashCD = 0.55;
  player.slashTimer = 0.18;

  let hit = false;
  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);
    const facing = normalizeAngle(Math.atan2(dy, dx) - player.facing);

    if (dist < 90 && Math.abs(facing) < 1.25) {
      enemy.hp -= 1;
      enemy.hitFlash = 0.2;
      hit = true;
      addParticles(enemy.x, enemy.y, '#8dd8ff', 12, 1.3);
      if (enemy.hp <= 0) {
        player.score += 20;
        addParticles(enemy.x, enemy.y, '#f9d57c', 18, 1.8);
      }
    }
  }

  if (hit) {
    setMessage('Slash connects.');
  } else {
    setMessage('The blade whistles through empty air.');
  }
}

function parry() {
  if (gameOver || victory) return;
  if (player.parryCD > 0) return;

  player.parryTimer = 0.38;
  player.parryCD = 0.8;
  setMessage('Parry set.');
}

function resolveRiposte(enemy) {
  enemy.hp -= 2;
  enemy.hitFlash = 0.25;
  player.score += 25;
  addParticles(enemy.x, enemy.y, '#7cefb1', 18, 1.7);
  setMessage('Riposte! Enemy staggered.');
  if (enemy.hp <= 0) {
    addParticles(enemy.x, enemy.y, '#f9d57c', 22, 2.1);
  }
}

function updatePlayer(dt) {
  let moveX = 0;
  let moveY = 0;

  if (keys.KeyW || keys.ArrowUp) moveY -= 1;
  if (keys.KeyS || keys.ArrowDown) moveY += 1;
  if (keys.KeyA || keys.ArrowLeft) moveX -= 1;
  if (keys.KeyD || keys.ArrowRight) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY) || 1;
    const stepX = (moveX / length) * player.speed * dt;
    const stepY = (moveY / length) * player.speed * dt;
    player.x += stepX;
    player.y += stepY;
    player.facing = Math.atan2(stepY, stepX);
  }

  player.x = clamp(player.x, -world.width / 2 + 28, world.width / 2 - 28);
  player.y = clamp(player.y, -world.height / 2 + 28, world.height / 2 - 28);

  if (player.slashCD > 0) player.slashCD -= dt;
  if (player.slashTimer > 0) player.slashTimer -= dt;
  if (player.parryTimer > 0) player.parryTimer -= dt;
  if (player.parryCD > 0) player.parryCD -= dt;
  if (player.invuln > 0) player.invuln -= dt;
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;

    if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
    if (enemy.attackCD > 0) enemy.attackCD -= dt;
    if (enemy.attackWindup > 0) enemy.attackWindup -= dt;
    if (enemy.attackActive > 0) enemy.attackActive -= dt;

    if (dist > 45) {
      enemy.x += dirX * enemy.speed * dt;
      enemy.y += dirY * enemy.speed * dt;
    }

    if (dist < 90 && enemy.attackCD <= 0 && enemy.attackWindup <= 0 && enemy.attackActive <= 0) {
      enemy.attackWindup = 0.55;
      enemy.attackCD = 1.25;
    }

    if (enemy.attackWindup <= 0 && enemy.attackActive <= 0 && dist < 90 && enemy.attackCD > 0.2) {
      enemy.attackActive = 0.22;
    }

    if (enemy.attackActive > 0 && dist < 90) {
      const angleToEnemy = Math.atan2(-dy, -dx);
      const parryWindow = player.parryTimer > 0 && Math.abs(normalizeAngle(angleToEnemy - player.facing)) < 1.2;

      if (parryWindow) {
        resolveRiposte(enemy);
        enemy.attackActive = 0;
        enemy.attackWindup = 0;
        enemy.attackCD = 1.2;
      } else if (enemy.attackActive <= 0.02) {
        if (player.invuln <= 0) {
          player.hp -= 1;
          player.invuln = 0.9;
          addParticles(player.x, player.y, '#f86a6a', 18, 1.6);
          setMessage('A blade lands. Parry the next strike.');
        }
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].hp <= 0) {
      enemies.splice(i, 1);
    }
  }

  if (player.hp <= 0) {
    gameOver = true;
    setMessage('The gate has fallen. Press R to restart.');
  }

  if (!gameOver && !victory && enemies.length === 0) {
    player.wave += 1;
    if (player.wave > 5) {
      victory = true;
      setMessage('Victory! The gate holds. Press R to replay.');
    } else {
      spawnWave(player.wave);
    }
  }
}

function screenPoint(x, y) {
  const sx = canvas.width / 2 + (x - player.x);
  const sy = canvas.height / 2 + (y - player.y);
  return { x: sx, y: sy };
}

function drawArena() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#071621');
  background.addColorStop(0.6, '#0b2030');
  background.addColorStop(1, '#050b11');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(115, 197, 242, 0.18)';
  ctx.lineWidth = 1;
  for (let x = -200; x <= 200; x += 40) {
    const start = screenPoint(x, -world.height / 2);
    const end = screenPoint(x, world.height / 2);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  for (let y = -160; y <= 160; y += 40) {
    const start = screenPoint(-world.width / 2, y);
    const end = screenPoint(world.width / 2, y);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  const gateScreen = screenPoint(world.gate.x, world.gate.y);
  ctx.fillStyle = 'rgba(122, 230, 173, 0.34)';
  ctx.beginPath();
  ctx.arc(gateScreen.x, gateScreen.y, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(gateScreen.x, gateScreen.y, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(159, 222, 255, 0.15)';
  ctx.fillRect(canvas.width * 0.18, canvas.height * 0.85, canvas.width * 0.64, 18);
  ctx.fillStyle = '#7cefb1';
  const hpRatio = clamp(player.hp / player.maxHp, 0, 1);
  ctx.fillRect(canvas.width * 0.18, canvas.height * 0.85, canvas.width * 0.64 * hpRatio, 18);
}

function drawEnemy(enemy) {
  const pos = screenPoint(enemy.x, enemy.y);
  const fill = enemy.hitFlash > 0 ? '#ffd98a' : '#ff6b6b';
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 18, enemy.radius * 1.1, enemy.radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.attackWindup > 0) {
    const alpha = clamp(enemy.attackWindup / 0.55, 0, 1);
    ctx.strokeStyle = `rgba(255, 130, 130, ${0.4 + alpha * 0.6})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, enemy.radius + 14 + (1 - alpha) * 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  const barWidth = 30;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(pos.x - barWidth / 2, pos.y - enemy.radius - 12, barWidth, 5);
  ctx.fillStyle = '#7cefb1';
  ctx.fillRect(pos.x - barWidth / 2, pos.y - enemy.radius - 12, (barWidth * enemy.hp) / enemy.maxHp, 5);
}

function drawPlayer() {
  const pos = screenPoint(player.x, player.y);
  const glow = player.invuln > 0 ? '#dffaff' : '#8fd7ff';

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 20, player.radius + 10, player.radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  const dirX = pos.x + Math.cos(player.facing) * 24;
  const dirY = pos.y + Math.sin(player.facing) * 24;
  ctx.strokeStyle = '#eaf6ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.lineTo(dirX, dirY);
  ctx.stroke();

  if (player.slashTimer > 0) {
    ctx.strokeStyle = 'rgba(255, 219, 107, 0.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 34, player.facing - 1.1, player.facing + 1.1);
    ctx.stroke();
  }

  if (player.parryTimer > 0) {
    ctx.strokeStyle = 'rgba(124, 239, 176, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawParticles() {
  for (const p of particles) {
    const pos = screenPoint(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life * 1.4);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawOverlay() {
  if (gameOver || victory) {
    ctx.fillStyle = 'rgba(7, 11, 17, 0.48)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function draw() {
  drawArena();
  for (const enemy of enemies) drawEnemy(enemy);
  drawPlayer();
  drawParticles();
  drawOverlay();
}

function tick(ts) {
  const dt = Math.min(0.033, (ts - (tick.lastTime || ts)) / 1000 || 0.016);
  tick.lastTime = ts;

  if (!gameOver && !victory) {
    updatePlayer(dt);
    updateEnemies(dt);
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += (p.vx * dt);
    p.y += (p.vy * dt);
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  draw();
  updateHud();
  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;

  if (event.code === 'Space') {
    event.preventDefault();
    parry();
  }

  if (event.code === 'KeyJ') {
    slashAttack();
  }

  if (event.code === 'KeyR' && (gameOver || victory)) {
    startNewGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

canvas.addEventListener('pointerdown', (event) => {
  if (gameOver || victory) return;
  const rect = canvas.getBoundingClientRect();
  player.facing = Math.atan2(
    event.clientY - rect.top - rect.height / 2,
    event.clientX - rect.left - rect.width / 2,
  );
  slashAttack();
});

const touchButtons = document.querySelectorAll('.touch-controls button');
touchButtons.forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    button.setPointerCapture(event.pointerId);

    if (button.dataset.key) {
      keys[button.dataset.key] = true;
    } else if (button.dataset.action === 'parry') {
      parry();
    } else if (button.dataset.action === 'slash') {
      slashAttack();
    }
  });

  const release = (event) => {
    if (button.dataset.key) keys[button.dataset.key] = false;
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});

window.addEventListener('resize', () => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
  world.width = Math.min(800, Math.max(360, canvas.width * 1.1));
  world.height = Math.min(560, Math.max(280, canvas.height * 1.1));
  world.gate.y = -world.height / 2 + 72;
});

window.dispatchEvent(new Event('resize'));
startNewGame();
requestAnimationFrame(tick);
