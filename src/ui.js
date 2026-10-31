import { DISTRICTS, BUSINESSES, RANKS, WEATHER, STYLES } from './data.js';

const $ = (id) => document.getElementById(id);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');

export class UI {
  constructor(world, state) {
    this.world = world;
    this.state = state;
    this.objective = null;
    this.player = null;
    this.waypoint = null;
    this.menuOpen = false;
    this.dialogueOpen = false;
    this.panelOpen = false;
    this.mapOpen = false;
    this.combat = false;
    this.dialogueCallback = null;
    this.panelCallback = null;
    this.modalCallback = null;
    this.minimapCtx = $('minimap').getContext('2d');
    this.bigmapCtx = $('bigmap').getContext('2d');
    this.typeTimer = null;
    this.toastTimers = [];
    this._lastHud = 0;
    this._areaTimer = null;
    this.bindMap();
  }

  bootProgress(p, text) {
    const bar = document.querySelector('.boot-line span');
    if (bar) bar.style.width = Math.round(p * 100) + '%';
    $('boot-text').textContent = text || 'READING THE RAIN...';
  }

  hideBoot() {
    $('boot').classList.add('out');
    setTimeout(() => $('boot').classList.add('hidden'), 800);
  }

  showMenu(hasSave) {
    $('menu').classList.remove('hidden');
    $('btn-start').disabled = false;
    $('btn-continue').classList.toggle('hidden', !hasSave);
    this.menuOpen = true;
  }

  hideMenu() {
    $('menu').classList.add('fading');
    setTimeout(() => { $('menu').classList.add('hidden'); $('menu').classList.remove('fading'); }, 680);
    this.menuOpen = false;
  }

  showHUD() { $('hud').classList.remove('hidden'); }
  hideHUD() { $('hud').classList.add('hidden'); }
  showTouch(on) { $('touch').classList.toggle('visible', on); $('touch').classList.remove('hidden'); }
  hideTouch() { $('touch').classList.add('hidden'); $('touch').classList.remove('visible'); }

  setPlayer(player) { this.player = player; }

  setObjective(objective) { this.objective = objective; }

  updateHUD(force = false) {
    if (!this.player || !this.state) return;
    const now = performance.now();
    if (!force && now - this._lastHud < 90) return;
    this._lastHud = now;
    const p = this.state.player;
    const t = this.state.time;
    const h = Math.floor(t.minutes / 60) % 24, m = Math.floor(t.minutes % 60);
    $('clock-time').textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
    const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
    $('clock-day').textContent = `${days[t.day % 7]} · DAY ${t.day + 1}`;
    const w = WEATHER[this.state.weather] || WEATHER.rain;
    $('weather-label').textContent = w.label;
    $('weather-icon').textContent = w.icon;
    $('temp-label').textContent = w.temp + '°';
    $('wallet').textContent = fmt(p.money);
    $('rep-label').textContent = this.rank(p.reputation || 0).toUpperCase();
    $('style-chip').textContent = 'STYLE // ' + (STYLES[p.style]?.name || 'STREET');
    for (const need of ['hunger','energy','hygiene','mood']) {
      const el = $('need-' + need);
      if (!el) continue;
      const val = clamp(p[need] ?? 70, 0, 100);
      el.style.width = val + '%';
      const parent = el.closest('.need');
      parent?.classList.toggle('low', val < 24);
    }
    if (this.objective) {
      $('quest-chapter').textContent = this.objective.chapter || 'CHAPTER';
      $('quest-title').textContent = this.objective.title || '';
      $('quest-objective').textContent = this.objective.objective || '';
      const target = this.objective.targetPos;
      let dist = '';
      if (target) dist = Math.round(Math.hypot(this.player.x - target.x, this.player.z - target.z)) + ' m';
      $('quest-dist').textContent = dist;
      const prog = this.objective.progress ?? 0;
      $('quest-progress').style.width = Math.round(prog * 100) + '%';
    }
    const d = this.world.districtAt(this.player.x, this.player.z);
    $('hud-location').textContent = d.name;
    $('minimap-tag').textContent = d.name;
    this.drawMinimap();
    $('weirdness').classList.toggle('show', (this.state.weirdness || .1) > .28);
    $('weirdness').style.setProperty('--weird', Math.round((this.state.weirdness || .1) * 100) + '%');
    $('weirdness').querySelector('span').textContent = this.state.weirdness > .78 ? 'THE CITY IS LISTENING' : this.state.weirdness > .5 ? 'THE CITY IS LOOKING' : 'SOMETHING IS OFF';
  }

  rank(rep) {
    let r = RANKS[0];
    for (const x of RANKS) if (rep >= x.min) r = x;
    return r.name;
  }

  drawMinimap() {
    const c = this.minimapCtx;
    const W = 184, H = 184;
    c.clearRect(0,0,W,H);
    c.save();
    c.beginPath(); c.arc(W/2,H/2,W/2-1,0,Math.PI*2); c.clip();
    c.fillStyle = '#0a1112'; c.fillRect(0,0,W,H);
    const scale = 1.38;
    const px = this.player?.x || 0, pz = this.player?.z || 0;
    const tx = (x) => W/2 + (x - px) * scale;
    const tz = (z) => H/2 + (z - pz) * scale;
    // water
    c.fillStyle = '#0d2028';
    if (pz < 200) { c.fillRect(0, tz(244), W, H); }
    if (px > 230) { c.fillRect(tx(260), 0, W, H); }
    // roads
    c.strokeStyle = '#3d4746'; c.lineWidth = 2;
    for (const x of this.world.roadXs || []) { c.beginPath(); c.moveTo(tx(x),0); c.lineTo(tx(x),H); c.stroke(); }
    for (const z of this.world.roadZs || []) { c.beginPath(); c.moveTo(0,tz(z)); c.lineTo(W,tz(z)); c.stroke(); }
    // district tint
    for (const d of DISTRICTS) {
      const dx = tx(d.x), dz = tz(d.z);
      if (dx > -80 && dx < W+80 && dz > -80 && dz < H+80) {
        c.fillStyle = d.color + '12'; c.beginPath(); c.arc(dx,dz,d.r*scale*.6,0,Math.PI*2); c.fill();
      }
    }
    // businesses
    for (const b of BUSINESSES) {
      const x = tx(b.x), z = tz(b.z);
      if (x < 0 || x > W || z < 0 || z > H) continue;
      c.fillStyle = b.accent; c.globalAlpha = .75; c.fillRect(x-1.4,z-1.4,2.8,2.8); c.globalAlpha = 1;
    }
    // objective
    if (this.objective?.targetPos) {
      const x = tx(this.objective.targetPos.x), z = tz(this.objective.targetPos.z);
      if (x > -20 && x < W+20 && z > -20 && z < H+20) {
        c.strokeStyle = '#ff4338'; c.lineWidth = 2;
        c.beginPath(); c.arc(x,z,6 + Math.sin(performance.now()*.005)*2,0,Math.PI*2); c.stroke();
        c.fillStyle = '#ff4338'; c.beginPath(); c.arc(x,z,2,0,Math.PI*2); c.fill();
      }
    }
    // waypoint
    if (this.waypoint) {
      const x = tx(this.waypoint.x), z = tz(this.waypoint.z);
      c.strokeStyle = '#ffb35c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x-4,z); c.lineTo(x,z-5); c.lineTo(x+4,z); c.lineTo(x,z+5); c.closePath(); c.stroke();
    }
    // player
    c.save();
    c.translate(W/2,H/2);
    c.rotate(-(this.player?.yaw || 0));
    c.fillStyle = '#7fe3d2';
    c.beginPath(); c.moveTo(0,-7); c.lineTo(5,5); c.lineTo(0,2); c.lineTo(-5,5); c.closePath(); c.fill();
    c.restore();
    // north
    c.fillStyle = 'rgba(233,228,216,.55)'; c.font = '8px Plex, monospace'; c.textAlign='center'; c.fillText('N', W/2, 14);
    c.restore();
    // rim
    c.strokeStyle = 'rgba(233,228,216,.18)'; c.lineWidth = 1; c.beginPath(); c.arc(W/2,H/2,W/2-1,0,Math.PI*2); c.stroke();
  }

  drawBigMap() {
    const c = this.bigmapCtx;
    const W = 1200, H = 900;
    c.clearRect(0,0,W,H);
    const minX=-270, maxX=520, minZ=-290, maxZ=270;
    const tx = x => (x-minX)/(maxX-minX)*W;
    const tz = z => (z-minZ)/(maxZ-minZ)*H;
    c.fillStyle = '#0b1415'; c.fillRect(0,0,W,H);
    // topo contour rings
    c.strokeStyle = 'rgba(127,227,210,.06)'; c.lineWidth = 1;
    for (let i=0;i<12;i++) {
      c.beginPath();
      for (let a=0;a<=Math.PI*2+.05;a+=.08) {
        const r = 50 + i*32;
        const x = 580 + Math.cos(a)*r*1.25 + Math.sin(a*3)*18;
        const y = 450 + Math.sin(a)*r*.8 + Math.cos(a*2)*12;
        if (a===0) c.moveTo(x,y); else c.lineTo(x,y);
      }
      c.stroke();
    }
    // water
    c.fillStyle = '#0c2229';
    c.fillRect(0, tz(242), W, H-tz(242));
    c.fillStyle = '#0e252c';
    c.fillRect(tx(260), tz(-120), W-tx(260), tz(170)-tz(-120));
    c.strokeStyle = 'rgba(127,227,210,.15)'; c.lineWidth = 2; c.strokeRect(tx(260), tz(-120), W-tx(260), tz(170)-tz(-120));
    // grid roads
    c.strokeStyle = '#27302f'; c.lineWidth = 9;
    for (const x of this.world.roadXs || []) { c.beginPath(); c.moveTo(tx(x),0); c.lineTo(tx(x),H); c.stroke(); }
    for (const z of this.world.roadZs || []) { c.beginPath(); c.moveTo(0,tz(z)); c.lineTo(W,tz(z)); c.stroke(); }
    c.strokeStyle = '#38423f'; c.lineWidth = 2;
    for (const x of this.world.roadXs || []) { c.beginPath(); c.moveTo(tx(x),0); c.lineTo(tx(x),H); c.stroke(); }
    for (const z of this.world.roadZs || []) { c.beginPath(); c.moveTo(0,tz(z)); c.lineTo(W,tz(z)); c.stroke(); }
    // districts
    c.textAlign = 'center';
    for (const d of DISTRICTS) {
      c.fillStyle = d.color + '18';
      c.beginPath(); c.arc(tx(d.x), tz(d.z), d.r*2.5,0,Math.PI*2); c.fill();
      c.fillStyle = d.color + 'aa';
      c.font = '400 19px Bebas, sans-serif';
      c.fillText(d.name, tx(d.x), tz(d.z)-6);
      c.fillStyle = 'rgba(233,228,216,.3)'; c.font = '10px Plex, monospace';
      c.fillText(d.sub, tx(d.x), tz(d.z)+10);
    }
    // businesses
    for (const b of BUSINESSES) {
      const x = tx(b.x), z = tz(b.z);
      c.fillStyle = b.accent; c.globalAlpha = .9;
      c.fillRect(x-3,z-3,6,6); c.globalAlpha = 1;
      c.fillStyle = 'rgba(233,228,216,.62)'; c.font = '10px Plex, monospace'; c.textAlign = 'left';
      if (['steam_kettle','drowned_raven','transit','terminal9','cormorant','old_park','mirror_lake','falls_trail','raven_books','empty_cup','junk_yard'].includes(b.id)) {
        c.fillText(b.short, x+8, z+3);
      }
    }
    // objective
    if (this.objective?.targetPos) {
      const x = tx(this.objective.targetPos.x), z = tz(this.objective.targetPos.z);
      c.strokeStyle = '#ff4338'; c.lineWidth = 3; c.beginPath(); c.arc(x,z,14 + Math.sin(performance.now()*.004)*4,0,Math.PI*2); c.stroke();
      c.fillStyle = '#ff4338'; c.beginPath(); c.arc(x,z,5,0,Math.PI*2); c.fill();
      c.fillStyle = '#ff4338'; c.font = '11px Plex, monospace'; c.textAlign='center'; c.fillText('OBJECTIVE', x, z-24);
    }
    if (this.waypoint) {
      const x = tx(this.waypoint.x), z = tz(this.waypoint.z);
      c.strokeStyle = '#ffb35c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x-8,z); c.lineTo(x,z-10); c.lineTo(x+8,z); c.lineTo(x,z+10); c.closePath(); c.stroke();
      c.fillStyle = '#ffb35c'; c.font='10px Plex, monospace'; c.textAlign='center'; c.fillText('WAYPOINT', x, z-17);
    }
    // arena
    c.fillStyle = '#ff4338'; c.font = '400 24px Bebas, sans-serif'; c.textAlign='center';
    c.fillText('TERMINAL 9', tx(this.world.arena.x), tz(this.world.arena.z)-20);
    c.strokeStyle = 'rgba(255,67,56,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(tx(this.world.arena.x), tz(this.world.arena.z), 45,0,Math.PI*2); c.stroke();
    // player
    if (this.player) {
      const x = tx(this.player.x), z = tz(this.player.z);
      c.save(); c.translate(x,z); c.rotate(-this.player.yaw);
      c.fillStyle = '#7fe3d2'; c.beginPath(); c.moveTo(0,-12); c.lineTo(8,8); c.lineTo(0,4); c.lineTo(-8,8); c.closePath(); c.fill();
      c.restore();
      c.fillStyle = '#e9e4d8'; c.font='11px Plex, monospace'; c.textAlign='left'; c.fillText('YOU', x+13, z+4);
    }
    // compass
    c.fillStyle = 'rgba(233,228,216,.4)'; c.font = '400 20px Bebas, sans-serif'; c.textAlign='center'; c.fillText('N', W-30, 36);
    c.strokeStyle = 'rgba(233,228,216,.3)'; c.beginPath(); c.moveTo(W-30,46); c.lineTo(W-30,66); c.stroke();
  }

  bindMap() {
    $('bigmap').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.waypoint = { x: -270 + x * 790, z: -290 + y * 560 };
      this.toast('Waypoint set.', '');
      this.drawBigMap();
    });
  }

  toggleMap(on) {
    this.mapOpen = on;
    $('map-overlay').classList.toggle('hidden', !on);
    if (on) this.drawBigMap();
  }

  toast(text, kind = '') {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = text;
    box.appendChild(el);
    const t = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, 3600);
    this.toastTimers.push(t);
    while (box.children.length > 4) box.firstChild.remove();
  }

  showArea(name, sub = '') {
    const el = $('area-title');
    el.querySelector('span').textContent = sub || 'BELLINGHAM, WASHINGTON';
    el.querySelector('b').textContent = name;
    el.classList.add('show');
    clearTimeout(this._areaTimer);
    this._areaTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  showEvent(title, sub) {
    const el = $('event-banner');
    el.querySelector('b').textContent = title;
    el.querySelector('i').textContent = sub || '';
    el.classList.remove('hidden');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(this._eventTimer);
    this._eventTimer = setTimeout(() => el.classList.add('hidden'), 4500);
  }

  subtitle(text, duration = 4000) {
    const el = $('subtitle');
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(this._subTimer);
    if (duration) this._subTimer = setTimeout(() => el.classList.add('hidden'), duration);
  }

  setPrompt(text, sub = '') {
    const el = $('interact-prompt');
    if (!text) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    $('interact-text').textContent = text;
    $('crosshair').classList.add('active');
  }

  hidePrompt() { $('interact-prompt').classList.add('hidden'); $('crosshair').classList.remove('active'); }
  setCombatCrosshair(on) { $('crosshair').classList.toggle('combat', on); }
  hideLookHint() { $('look-hint').style.opacity = 0; }

  // dialogue
  openDialogue(npc, text, choices, onChoice) {
    this.dialogueOpen = true;
    this.dialogueCallback = onChoice;
    $('dialogue').classList.remove('hidden');
    $('dialogue-name').textContent = npc.name.toUpperCase();
    $('dialogue-role').textContent = `${npc.tag || npc.role} · ${npc.age || '??'}`;
    const portrait = $('dialogue-portrait');
    portrait.style.setProperty('--portrait', npc.palette?.skin || '#b98b6e');
    portrait.style.setProperty('--shirt', npc.palette?.shirt || '#4b6667');
    this.typeText(text);
    const box = $('dialogue-choices');
    box.innerHTML = '';
    for (const ch of choices) {
      const b = document.createElement('button');
      b.textContent = ch.label;
      if (ch.special) b.classList.add('special');
      if (ch.disabled) b.disabled = true;
      b.addEventListener('click', () => { this.audio?.ui?.(); onChoice(ch); });
      box.appendChild(b);
    }
  }

  typeText(text) {
    clearInterval(this.typeTimer);
    const el = $('dialogue-text');
    el.textContent = '';
    let i = 0;
    this.typeTimer = setInterval(() => {
      el.textContent = text.slice(0, i += 2);
      if (i >= text.length) clearInterval(this.typeTimer);
    }, 12);
  }

  updateDialogueText(text) { this.typeText(text); }

  closeDialogue() {
    this.dialogueOpen = false;
    $('dialogue').classList.add('hidden');
    clearInterval(this.typeTimer);
    this.dialogueCallback = null;
  }

  // panel
  openPanel({ kicker, title, tabs = [], active = '', html = '', onMount = null, className = '' }) {
    this.panelOpen = true;
    $('panel').classList.remove('hidden');
    $('panel').classList.toggle('phone-panel', className === 'phone');
    $('panel-kicker').textContent = kicker || 'PHONE';
    $('panel-title').textContent = title || '';
    const tabsEl = $('panel-tabs');
    tabsEl.innerHTML = '';
    tabsEl.className = 'panel-tabs ' + (className === 'phone' ? 'phone-tabs' : '');
    for (const tab of tabs) {
      const b = document.createElement('button');
      b.textContent = tab.label;
      if (tab.id === active) b.classList.add('active');
      b.addEventListener('click', () => tab.action?.());
      tabsEl.appendChild(b);
    }
    tabsEl.style.display = tabs.length ? 'flex' : 'none';
    $('panel-body').innerHTML = html;
    this.panelCallback = onMount;
    if (onMount) onMount($('panel-body'));
  }

  setPanelBody(html, onMount = null) {
    $('panel-body').innerHTML = html;
    if (onMount) onMount($('panel-body'));
  }

  closePanel() {
    this.panelOpen = false;
    $('panel').classList.add('hidden');
    this.panelCallback = null;
  }

  // modal
  hideCinematic() {
    const el = $('cinema');
    el.classList.remove('show');
    el.classList.add('hidden');
  }

  modal({ kicker = '', title = '', body = '', actions = [], onAction = null }) {
    this.hideCinematic();
    $('modal').classList.remove('hidden');
    $('modal-kicker').textContent = kicker;
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = body;
    const box = $('modal-actions');
    box.innerHTML = '';
    for (const a of actions) {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost');
      b.textContent = a.label;
      if (a.disabled) { b.disabled = true; b.title = 'Locked · requirements not met'; }
      b.addEventListener('click', () => { if (a.disabled) return; onAction?.(a.id); });
      box.appendChild(b);
    }
  }

  closeModal() { $('modal').classList.add('hidden'); }

  // combat
  setCombat(on) {
    this.combat = on;
    $('combat-hud').classList.toggle('hidden', !on);
    this.setCombatCrosshair(on);
    $('touch-fight').classList.toggle('hidden', !on);
  }

  updateCombat(d) {
    if (!d) return;
    $('fight-player-health').style.width = clamp(d.playerHP / d.playerMax * 100, 0, 100) + '%';
    $('fight-player-stamina').style.width = clamp(d.stamina, 0, 100) + '%';
    $('fight-enemy-health').style.width = clamp(d.enemyHP / d.enemyMax * 100, 0, 100) + '%';
    $('fight-enemy-name').textContent = d.enemyName;
    $('fight-enemy-sub').textContent = d.enemySub;
    $('fight-player-name').textContent = (d.playerName || 'ROOKIE').toUpperCase();
    $('special-fill').style.width = d.special + '%';
    $('special-label').textContent = d.special >= 100 ? 'SPECIAL READY' : 'SPECIAL';
    $('special-fill').parentElement.classList.toggle('full', d.special >= 100);
    $('combo-counter').classList.toggle('hidden', d.combo < 2);
    if (d.combo >= 2) $('combo-counter').querySelector('b').textContent = d.combo;
    $('finisher').classList.toggle('hidden', !d.canFinish);
    $('fight-player-name').parentElement.querySelector('span').textContent = d.style;
  }

  showCombo(n) {
    $('combo-counter').classList.remove('hidden');
    $('combo-counter').querySelector('b').textContent = n;
  }

  showCallout(text) {
    const el = $('fight-callout');
    el.textContent = text;
    el.classList.remove('hidden');
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(this._calloutTimer);
    this._calloutTimer = setTimeout(() => el.classList.add('hidden'), 950);
  }

  showFinisher(on) { $('finisher').classList.toggle('hidden', !on); }

  flashHit() {
    const el = $('hit-vignette');
    el.classList.add('hit');
    setTimeout(() => el.classList.remove('hit'), 180);
  }

  damageNumber(n, pos, camera) {
    const el = document.createElement('div');
    el.className = 'damage-number';
    el.textContent = n;
    el.style.cssText = 'position:fixed;z-index:26;font-family:Bebas,sans-serif;font-size:26px;color:#ffb35c;text-shadow:0 2px 8px #000;pointer-events:none;transform:translate(-50%,-50%);transition:all .7s ease-out;';
    document.body.appendChild(el);
    el.style.left = '50%'; el.style.top = '44%';
    requestAnimationFrame(() => { el.style.transform = 'translate(-50%,-150%) scale(1.4)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 800);
  }

  setStyle(style) { $('style-chip').textContent = 'STYLE // ' + (STYLES[style]?.name || 'STREET'); }

  // fade / cinema
  async fade(on, duration = 700) {
    const el = $('fade');
    el.style.transitionDuration = duration + 'ms';
    el.classList.toggle('on', on);
    await new Promise(r => setTimeout(r, duration + 50));
  }

  async cinematic(top, main, sub, duration = 2600) {
    const el = $('cinema');
    $('cinema-top').textContent = top;
    $('cinema-main').textContent = main;
    $('cinema-sub').textContent = sub;
    el.classList.remove('hidden');
    requestAnimationFrame(() => el.classList.add('show'));
    await new Promise(r => setTimeout(r, duration));
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 800);
  }

  showPause(on) { $('pause').classList.toggle('hidden', !on); }
  showSettings(on) { $('settings').classList.toggle('hidden', !on); }
}

export { fmt, $ };
