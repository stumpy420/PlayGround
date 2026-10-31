// ---------------------------------------------------------------------------
// Interface. Frost, gold, parchment, and an unreasonable number of cat facts.
// ---------------------------------------------------------------------------
import { ITEMS, SKILLS, SPELLS, LANDMARKS, BREEDS, FURS, EYES, CLASSES, icon, QUESTS_BY_ID } from './core/data.js';
import { catAvatarStyle } from './entities/cat.js';
import { formatTime, clamp } from './core/noise.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = (n) => Math.max(0, Math.ceil(n));

export class UI {
  constructor(game) {
    this.game = game;
    this.invFilter = 'all';
    this.questSelected = null;
    this.panel = null;
    this.toastCount = 0;
    this.areaTimer = null;
    this.subTimer = null;
    this.compassT = 0;
    this.mapOpen = false;
    this.shopNpc = null;
    this.hudHidden = false;
    this.photo = false;
    this.lastWeather = '';
    this.mapMarkers = [];
    this.questMarkerEls = null;

    this.refs = {};
    this.cache();
    this.icons();
    this.buildCreator();
    this.buildCompass();
    this.wire();
    this.floatLayer = this.refs.floatLayer;
  }

  cache() {
    const ids = [
      'hud', 'hud-avatar', 'hud-level', 'hud-name', 'hud-class', 'bar-health', 'txt-health',
      'bar-stamina', 'txt-stamina', 'bar-mana', 'txt-mana', 'bar-xp', 'txt-xp', 'hud-gold',
      'hud-time', 'hud-weather', 'location', 'compass-strip', 'quest-tracker', 'qt-type', 'qt-title',
      'qt-obj', 'qt-dist', 'enemy-frame', 'enemy-name', 'enemy-hp', 'crosshair', 'hotbar',
      'weapon-ico', 'weapon-name', 'weapon-stat', 'potion-count', 'hint-text', 'interact-prompt',
      'interact-text', 'toasts', 'float-layer', 'subtitle', 'area-banner', 'area-eyebrow',
      'area-name', 'area-sub', 'photo-badge', 'mobile-controls',
      'inv-gold', 'inv-weight', 'eq-weapon', 'eq-armor', 'eq-trinket', 'eq-bow', 'stats-card',
      'inv-grid', 'skill-points', 'skill-body', 'quest-list', 'quest-detail', 'map-canvas',
      'map-loc', 'map-desc', 'map-markers', 'shop-eyebrow', 'shop-name', 'shop-gold',
      'shop-buy', 'shop-sell', 'shop-line', 'shop', 'inventory', 'skills', 'quests', 'map',
      'pause', 'help', 'death', 'victory', 'death-line', 'victory-stats', 'victory-line',
      'settings-box', 'pause-save-note', 'load-fill', 'load-text', 'loading', 'menu', 'creator',
      'breed-chips', 'fur-swatches', 'eye-swatches', 'class-cards', 'class-blurb', 'cat-name',
      'preview', 'dialogue', 'dlg-avatar', 'dlg-name', 'dlg-text', 'dlg-options',
    ];
    for (const id of ids) this.refs[this.camel(id)] = $(id);
  }

  camel(id) { return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

  icons() {
    document.querySelectorAll('[data-ico]').forEach(e => {
      e.innerHTML = icon(e.dataset.ico);
    });
    if (this.refs.weaponIco) this.refs.weaponIco.innerHTML = icon('sword');
  }

  // -------------------------------------------------------------------------
  buildCreator() {
    const g = this.game;
    const breedWrap = this.refs.breedChips;
    if (breedWrap) {
      breedWrap.innerHTML = '';
      for (const b of BREEDS) {
        const c = el('button', 'chip', b.name.split(' ')[0]);
        c.dataset.breed = b.id;
        c.title = b.blurb;
        c.addEventListener('click', () => { g.creator.breed = b.id; this.syncCreator(); g.audio.playUIClick(); });
        breedWrap.appendChild(c);
      }
    }
    const furWrap = this.refs.furSwatches;
    if (furWrap) {
      furWrap.innerHTML = '';
      for (const f of FURS) {
        const s = el('button', 'swatch');
        s.style.background = `radial-gradient(circle at 38% 32%, ${f.hi}, ${f.base} 60%, ${f.dark})`;
        s.dataset.fur = f.id;
        s.title = f.name;
        s.addEventListener('click', () => { g.creator.fur = f.id; this.syncCreator(); g.audio.playUIClick(); });
        furWrap.appendChild(s);
      }
    }
    const eyeWrap = this.refs.eyeSwatches;
    if (eyeWrap) {
      eyeWrap.innerHTML = '';
      for (const e of EYES) {
        const s = el('button', 'swatch eye');
        s.style.background = `radial-gradient(circle at 38% 32%, #fff, ${e.color} 55%, #1a1712)`;
        s.dataset.eye = e.id;
        s.title = e.name;
        s.addEventListener('click', () => { g.creator.eye = e.id; this.syncCreator(); g.audio.playUIClick(); });
        eyeWrap.appendChild(s);
      }
    }
    const classWrap = this.refs.classCards;
    if (classWrap) {
      classWrap.innerHTML = '';
      for (const key in CLASSES) {
        const c = CLASSES[key];
        const card = el('button', 'class-card', `<b>${c.name}</b><span>${c.blurb}</span>`);
        card.dataset.cls = key;
        card.addEventListener('click', () => { g.creator.cls = key; this.syncCreator(); g.audio.playUIConfirm(); });
        classWrap.appendChild(card);
      }
    }
    this.syncCreator();
  }

  syncCreator() {
    const c = this.game.creator;
    document.querySelectorAll('#breed-chips .chip').forEach(e => e.classList.toggle('active', e.dataset.breed === c.breed));
    document.querySelectorAll('#fur-swatches .swatch').forEach(e => e.classList.toggle('active', e.dataset.fur === c.fur));
    document.querySelectorAll('#eye-swatches .swatch').forEach(e => e.classList.toggle('active', e.dataset.eye === c.eye));
    document.querySelectorAll('#class-cards .class-card').forEach(e => e.classList.toggle('active', e.dataset.cls === c.cls));
    if (this.refs.classBlurb) this.refs.classBlurb.textContent = CLASSES[c.cls]?.blurb || '';
    this.game.preview?.refresh(c);
  }

  readCreator() {
    const name = (this.refs.catName?.value || 'Moth').trim().slice(0, 18) || 'Moth';
    return { ...this.game.creator, name };
  }

  // -------------------------------------------------------------------------
  buildCompass() {
    const strip = this.refs.compassStrip;
    if (!strip) return;
    strip.innerHTML = '';
    this.compassItems = [];
    const cards = [['N', 0], ['NE', Math.PI / 4], ['E', Math.PI / 2], ['SE', Math.PI * 3 / 4], ['S', Math.PI], ['SW', -Math.PI * 3 / 4], ['W', -Math.PI / 2], ['NW', -Math.PI / 4]];
    for (const [label, bearing] of cards) {
      const s = el('span', 'card', label);
      s.dataset.bearing = bearing;
      strip.appendChild(s);
      this.compassItems.push({ e: s, bearing });
    }
    for (let i = 0; i < 24; i++) {
      const bearing = (i / 24) * Math.PI * 2;
      const t = el('span', 'tick');
      t.dataset.bearing = bearing;
      strip.appendChild(t);
      this.compassItems.push({ e: t, bearing });
    }
    const q = el('div', 'qmark');
    strip.appendChild(q);
    this.questMark = q;
  }

  updateCompass() {
    const p = this.game.player;
    if (!p || !this.compassItems) return;
    this.compassT -= 1;
    const camYaw = p.camYaw;
    const camBearing = Math.atan2(Math.sin(camYaw), -Math.cos(camYaw));
    const pxPerRad = 92;
    const halfW = (this.refs.compassStrip.parentElement?.clientWidth || 360) / 2;
    for (const it of this.compassItems) {
      let rel = it.bearing - camBearing;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      if (Math.abs(rel) > 1.7) { it.e.style.display = 'none'; continue; }
      it.e.style.display = '';
      it.e.style.left = `calc(50% + ${rel * pxPerRad}px)`;
    }
    const info = this.game.quests?.trackedInfo();
    let target = null;
    if (info?.marker) target = info.marker;
    if (this.game.compassTarget) target = this.game.compassTarget;
    if (target && this.questMark) {
      const bearing = Math.atan2(target.x - p.position.x, -(target.z - p.position.z));
      let rel = bearing - camBearing;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      if (Math.abs(rel) < 1.6) {
        this.questMark.style.display = '';
        this.questMark.style.left = `calc(50% + ${rel * pxPerRad}px)`;
      } else {
        this.questMark.style.display = 'none';
        // clamp to edge
        const side = rel > 0 ? 1 : -1;
        this.questMark.style.display = '';
        this.questMark.style.left = `calc(50% + ${side * halfW * 0.92}px)`;
        this.questMark.style.opacity = '0.45';
      }
      if (Math.abs(rel) < 1.6) this.questMark.style.opacity = '1';
    } else if (this.questMark) this.questMark.style.display = 'none';
  }

  // -------------------------------------------------------------------------
  wire() {
    const g = this.game;
    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => this.closePanel(b.dataset.close));
    });
    document.querySelectorAll('.hud-btn').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.dataset.action;
        if (a === 'inventory') this.togglePanel('inventory');
        else if (a === 'quests') this.togglePanel('quests');
        else if (a === 'map') this.togglePanel('map');
        else if (a === 'skills') this.togglePanel('skills');
      });
    });
    document.querySelectorAll('#hotbar .slot').forEach(s => {
      s.addEventListener('click', () => {
        const spell = s.dataset.spell;
        if (spell) g.player?.castSpell(spell);
      });
    });
    $('btn-potion')?.addEventListener('click', () => g.usePotion?.());
    document.querySelectorAll('.tabs button').forEach(b => {
      b.addEventListener('click', () => {
        this.invFilter = b.dataset.filter;
        document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
        this.refreshInventory();
      });
    });
    document.querySelectorAll('.equip-slot').forEach(s => {
      s.addEventListener('click', () => {
        const id = g.inventory.equipment[s.dataset.slot];
        if (id) { g.inventory.equip(id); this.refreshInventory(); }
      });
    });
    $('btn-resume')?.addEventListener('click', () => g.togglePause(false));
    $('btn-save')?.addEventListener('click', () => { g.save(); this.setSaveNote('Saved. The snow remembers.'); });
    $('btn-pause-settings')?.addEventListener('click', () => this.refs.settingsBox?.classList.toggle('hidden'));
    $('btn-help')?.addEventListener('click', () => { this.closePanel('pause'); this.openPanel('help'); });
    $('btn-quit')?.addEventListener('click', () => g.quitToMenu());
    $('btn-respawn')?.addEventListener('click', () => g.respawn());
    $('btn-victory-continue')?.addEventListener('click', () => g.victoryContinue());
    $('set-music')?.addEventListener('input', (e) => { g.audio.setMusicVolume(+e.target.value); g.settings.music = +e.target.value; });
    $('set-sfx')?.addEventListener('input', (e) => { g.audio.setSfxVolume(+e.target.value); g.settings.sfx = +e.target.value; });
    $('set-quality')?.addEventListener('change', (e) => g.setQuality(e.target.value));
    $('set-snow')?.addEventListener('change', (e) => { g.settings.snow = e.target.value; });
    $('set-motion')?.addEventListener('change', (e) => { g.settings.reduceMotion = e.target.checked; document.body.classList.toggle('reduce-motion', e.target.checked); });
    $('btn-continue')?.addEventListener('click', () => g.continueGame());
    $('btn-new')?.addEventListener('click', () => g.showCreator());
    $('btn-how')?.addEventListener('click', () => { this.refs.menu?.classList.remove('show'); this.openPanel('help'); });
    $('btn-settings')?.addEventListener('click', () => { this.refs.menu?.classList.remove('show'); this.openPanel('pause'); this.refs.settingsBox?.classList.remove('hidden'); this.refs.pause?.classList.add('show'); });
    $('btn-back-menu')?.addEventListener('click', () => g.backToMenu());
    $('btn-begin')?.addEventListener('click', () => g.beginGame());
    $('dlg-close')?.addEventListener('click', () => g.dialogue?.close());
    window.addEventListener('resize', () => { if (this.panel === 'map') this.drawMap(); });
  }

  // -------------------------------------------------------------------------
  setLoading(pct, text) {
    if (this.refs.loadFill) this.refs.loadFill.style.width = `${clamp(pct, 0, 100)}%`;
    if (text && this.refs.loadText) this.refs.loadText.textContent = text;
  }

  hideLoading() {
    const l = this.refs.loading;
    if (!l) return;
    l.classList.add('fade');
    setTimeout(() => l.classList.remove('show'), 750);
  }

  showHUD(v) { this.refs.hud?.classList.toggle('show', v); }
  showMenu(v) { this.refs.menu?.classList.toggle('show', v); }
  showCreator(v) { this.refs.creator?.classList.toggle('show', v); }

  setSaveNote(text) { if (this.refs.pauseSaveNote) this.refs.pauseSaveNote.textContent = text; }

  // -------------------------------------------------------------------------
  toast(html, kind = '') {
    const t = el('div', 'toast ' + kind, html);
    this.refs.toasts?.appendChild(t);
    this.toastCount++;
    while (this.refs.toasts && this.refs.toasts.children.length > 5) this.refs.toasts.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3400);
  }

  showArea(name, sub = '', eyebrow = 'Now entering') {
    const b = this.refs.areaBanner;
    if (!b) return;
    if (this.refs.areaName) this.refs.areaName.textContent = name;
    if (this.refs.areaSub) this.refs.areaSub.textContent = sub;
    if (this.refs.areaEyebrow) this.refs.areaEyebrow.textContent = eyebrow;
    b.classList.remove('hidden');
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    clearTimeout(this.areaTimer);
    this.areaTimer = setTimeout(() => b.classList.add('hidden'), 4400);
  }

  subtitle(text, dur = 4) {
    const s = this.refs.subtitle;
    if (!s) return;
    s.innerHTML = text;
    s.classList.remove('hidden');
    clearTimeout(this.subTimer);
    this.subTimer = setTimeout(() => s.classList.add('hidden'), dur * 1000);
  }

  showInteract(label) {
    const p = this.refs.interactPrompt;
    if (!p) return;
    this.refs.interactText.textContent = label;
    p.classList.remove('hidden');
  }
  hideInteract() { this.refs.interactPrompt?.classList.add('hidden'); }

  setAiming(v) {
    this.refs.crosshair?.classList.toggle('hidden', !v);
  }

  hurtFlash() {
    const v = this.refs.vignette || document.getElementById('vignette');
    if (!v) return;
    v.style.transition = 'none';
    v.style.background = 'radial-gradient(ellipse at 50% 45%, rgba(180,40,30,.28) 20%, rgba(80,10,8,.55) 100%)';
    requestAnimationFrame(() => {
      v.style.transition = 'background .5s';
      setTimeout(() => { v.style.background = ''; }, 60);
    });
  }

  hideDeath() { this.refs.death?.classList.remove('show'); }
  showDeath(line) {
    if (this.refs.deathLine) this.refs.deathLine.textContent = line || 'A cat always lands on their feet. Eventually.';
    this.refs.death?.classList.add('show');
  }

  showVictory(stats) {
    if (this.refs.victoryStats) {
      this.refs.victoryStats.innerHTML = Object.entries(stats).map(([k, v]) => `<div><b>${v}</b>${k}</div>`).join('');
    }
    this.refs.victory?.classList.add('show');
  }
  hideVictory() { this.refs.victory?.classList.remove('show'); }

  setPhoto(v) {
    this.photo = v;
    this.refs.hud?.classList.toggle('photo', v);
    this.refs.photoBadge?.classList.toggle('hidden', !v);
  }

  toggleHUD() {
    this.hudHidden = !this.hudHidden;
    this.refs.hud?.classList.toggle('hidden', this.hudHidden);
  }

  // -------------------------------------------------------------------------
  openPanel(name) {
    if (this.panel && this.panel !== name) this.closePanel(this.panel, true);
    const map = { inventory: 'inventory', skills: 'skills', quests: 'quests', map: 'map', shop: 'shop', pause: 'pause', help: 'help' };
    const node = this.refs[map[name]];
    if (!node) return;
    this.panel = name;
    node.classList.add('show');
    this.game.mode = name === 'pause' || name === 'help' ? 'paused' : 'panel';
    if (name === 'inventory') this.refreshInventory();
    if (name === 'skills') this.refreshSkills();
    if (name === 'quests') this.refreshQuests();
    if (name === 'map') { this.drawMap(); this.refreshMapSide(); }
    if (name === 'shop') this.refreshShop();
    if (name === 'pause') this.setSaveNote('Autosaves when you enter a hold or shrine.');
    this.game.input?.clear?.();
  }

  closePanel(name, keepMode = false) {
    const map = { inventory: 'inventory', skills: 'skills', quests: 'quests', map: 'map', shop: 'shop', pause: 'pause', help: 'help' };
    const node = this.refs[map[name || this.panel]];
    node?.classList.remove('show');
    if (!keepMode) {
      this.panel = null;
      this.game.mode = 'play';
      this.game.shopNpc = null;
      this.game.input?.clear?.();
      if (name === 'pause') this.refs.settingsBox?.classList.add('hidden');
    } else if (name === this.panel) {
      this.panel = null;
    }
  }

  togglePanel(name) {
    if (this.panel === name) this.closePanel(name);
    else this.openPanel(name);
  }

  // -------------------------------------------------------------------------
  updateHUD() {
    const g = this.game;
    const p = g.player;
    if (!p || !this.refs.hud) return;
    const r = this.refs;
    const setBar = (bar, cur, max) => { if (bar) bar.style.transform = `scaleX(${clamp(cur / Math.max(1, max), 0, 1)})`; };
    setBar(r.barHealth, p.health, p.maxHealth);
    setBar(r.barStamina, p.stamina, p.maxStamina);
    setBar(r.barMana, p.mana, p.maxMana);
    if (r.txtHealth) r.txtHealth.textContent = fmt(p.health);
    if (r.txtStamina) r.txtStamina.textContent = fmt(p.stamina);
    if (r.txtMana) r.txtMana.textContent = fmt(p.mana);
    if (r.barXp) r.barXp.style.width = `${clamp(p.xp / p.xpNext, 0, 1) * 100}%`;
    if (r.txtXp) r.txtXp.textContent = `${Math.floor(p.xp)} / ${p.xpNext}`;
    if (r.hudLevel) r.hudLevel.textContent = p.level;
    if (r.hudName) r.hudName.textContent = p.name;
    if (r.hudClass) r.hudClass.textContent = CLASSES[p.cls]?.name || 'Wayfarer';
    if (r.hudGold) r.hudGold.textContent = g.inventory.gold;
    if (r.hudTime) r.hudTime.textContent = formatTime(g.time.hours);
    if (r.hudWeather) r.hudWeather.textContent = g.weather?.label || 'Snow';
    if (r.location) r.location.textContent = g.currentArea?.name || 'Catterfall';

    const st = g.inventory.statSummary();
    if (r.weaponName) r.weaponName.textContent = st.weaponName;
    if (r.weaponStat) {
      const sp = g.player.weapon;
      r.weaponStat.textContent = `${sp?.dmg || 4} damage · ${sp?.unarmed ? 'Claws' : sp?.type === 'bow' ? 'Bow' : 'Blade'}`;
    }
    if (r.weaponIco) {
      const ico = g.player.weapon?.icon || 'claws';
      if (r.weaponIco.dataset.last !== ico) { r.weaponIco.dataset.last = ico; r.weaponIco.innerHTML = icon(ico); }
    }
    if (r.potionCount) {
      const count = (g.inventory.count('healthPotion') || 0) + (g.inventory.count('stew') || 0) + (g.inventory.count('cheese') || 0) + (g.inventory.count('bread') || 0);
      r.potionCount.textContent = count;
    }

    // spells
    document.querySelectorAll('#hotbar .slot').forEach(s => {
      const id = s.dataset.spell;
      const sp = SPELLS[id];
      if (!sp) return;
      const cd = g.player.spellCd[id] || 0;
      const cdEl = s.querySelector('.cd');
      if (cdEl) cdEl.style.transform = `scaleY(${clamp(cd / sp.cooldown, 0, 1)})`;
      s.classList.toggle('empty', g.player.mana < sp.cost);
    });

    this.updateQuestTracker();
    this.updateCompass();
    this.updateEnemyFrame();

    if (g.enemyTarget && g.enemyTarget.alive) this.updateEnemyBar(g.enemyTarget);
    else this.refs.enemyFrame?.classList.add('hidden');
  }

  updateQuestTracker() {
    const info = this.game.quests?.trackedInfo();
    const t = this.refs.questTracker;
    if (!t) return;
    if (!info) { t.classList.add('hidden'); return; }
    t.classList.remove('hidden');
    if (this.refs.qtType) this.refs.qtType.textContent = info.type === 'main' ? 'MAIN' : 'SIDE';
    if (this.refs.qtTitle) this.refs.qtTitle.textContent = info.title;
    if (this.refs.qtObj) this.refs.qtObj.textContent = info.text;
    if (this.refs.qtDist) {
      if (info.marker) {
        const p = this.game.player.position;
        const d = Math.hypot(info.marker.x - p.x, info.marker.z - p.z);
        this.refs.qtDist.textContent = `${info.marker.name || ''} · ${Math.round(d)}m`;
      } else this.refs.qtDist.textContent = '';
    }
  }

  updateEnemyFrame() {
    const e = this.game.enemyTarget;
    if (!e || !e.alive) this.refs.enemyFrame?.classList.add('hidden');
    else this.updateEnemyBar(e);
  }

  updateEnemyBar(e) {
    if (!this.refs.enemyFrame) return;
    this.refs.enemyFrame.classList.remove('hidden');
    if (this.refs.enemyName) this.refs.enemyName.textContent = e.name;
    if (this.refs.enemyHp) this.refs.enemyHp.style.width = `${clamp(e.hp / e.maxHp, 0, 1) * 100}%`;
  }

  damageNumber(pos, amount, kind = '') {
    if (!this.floatLayer) return;
    const v = pos.clone().project(this.game.camera);
    if (v.z > 1) return;
    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
    const d = el('div', 'dmg ' + kind, (kind === 'heal' ? '+' : '') + amount);
    d.style.left = `${x + (Math.random() - 0.5) * 22}px`;
    d.style.top = `${y}px`;
    this.floatLayer.appendChild(d);
    setTimeout(() => d.remove(), 1000);
  }

  // -------------------------------------------------------------------------
  refreshInventory() {
    const g = this.game;
    const inv = g.inventory;
    if (!inv) return;
    if (this.refs.invGold) this.refs.invGold.textContent = inv.gold;
    if (this.refs.invWeight) this.refs.invWeight.textContent = inv.weight();
    const slots = { weapon: this.refs.eqWeapon, armor: this.refs.eqArmor, trinket: this.refs.eqTrinket, bow: this.refs.eqBow };
    for (const k in slots) {
      const node = slots[k];
      if (!node) continue;
      const id = inv.equipment[k];
      const item = ITEMS[id];
      node.innerHTML = item ? `${icon(item.icon)}<b>${item.name}</b>` : `<span class="empty">Empty</span>`;
      node.style.color = item ? '#d8b16a' : '';
    }
    const st = inv.statSummary();
    if (this.refs.statsCard) {
      this.refs.statsCard.innerHTML = [
        ['Damage', st.damage || 4],
        ['Armor', st.armor],
        ['Spell power', st.magic],
        ['Bow', st.bow || 0],
        ['Attack speed', st.weaponSpeed.toFixed(2) + '×'],
        ['Health', `${fmt(g.player.health)} / ${g.player.maxHealth}`],
        ['Mana', `${fmt(g.player.mana)} / ${g.player.maxMana}`],
        ['Stamina', `${fmt(g.player.stamina)} / ${g.player.maxStamina}`],
      ].map(([a, b]) => `<div class="stat-row"><span>${a}</span><b>${b}</b></div>`).join('');
    }
    const grid = this.refs.invGrid;
    if (!grid) return;
    grid.innerHTML = '';
    const entries = [...inv.slots.entries()].filter(([id]) => {
      const item = ITEMS[id];
      if (!item) return false;
      if (this.invFilter === 'all') return true;
      if (this.invFilter === 'potion') return item.type === 'potion' || item.type === 'food';
      if (this.invFilter === 'quest') return item.type === 'quest' || item.rarity === 'quest';
      return item.type === this.invFilter;
    });
    if (!entries.length) {
      grid.appendChild(el('div', 'inv-empty', 'Nothing here. A very tidy, very suspicious bag.'));
      return;
    }
    const order = { weapon: 0, armor: 1, bow: 2, trinket: 3, potion: 4, food: 5, quest: 6 };
    entries.sort((a, b) => (order[ITEMS[a[0]]?.type] ?? 9) - (order[ITEMS[b[0]]?.type] ?? 9));
    for (const [id, qty] of entries) {
      const item = ITEMS[id];
      if (!item) continue;
      const equipped = Object.values(inv.equipment).includes(id);
      const cell = el('div', 'inv-cell' + (equipped ? ' equipped' : '') + (item.rarity === 'rare' ? ' rare' : item.rarity === 'epic' ? ' epic' : item.rarity === 'quest' ? ' quest' : ''));
      cell.innerHTML = `<span class="rarity"></span>${qty > 1 ? `<span class="qty">${qty}</span>` : ''}<span class="item-ico">${icon(item.icon)}</span><span class="item-name">${item.name}</span>`;
      cell.title = `${item.name}\n${item.desc}`;
      cell.addEventListener('click', (ev) => {
        if (ev.shiftKey) {
          if (inv.remove(id, 1)) this.toast(`Dropped ${item.name}. It is someone else’s problem now.`);
          this.refreshInventory();
          return;
        }
        if (['weapon', 'armor', 'trinket', 'bow'].includes(item.type)) {
          inv.equip(id);
        } else if (item.type === 'potion' || item.type === 'food') {
          inv.use(id);
          this.updateHUD();
        } else {
          this.toast(`<b>${item.name}</b><br>${item.desc}`, item.rarity === 'quest' ? 'quest' : '');
        }
        this.refreshInventory();
      });
      grid.appendChild(cell);
    }
  }

  refreshSkills() {
    const g = this.game;
    const p = g.player;
    if (!p || !this.refs.skillBody) return;
    if (this.refs.skillPoints) this.refs.skillPoints.textContent = p.skillPoints;
    const trees = {};
    for (const s of SKILLS) (trees[s.tree] ||= []).push(s);
    const blurb = {
      Hunter: 'Teeth, arrows, and the confidence to use them.',
      Spell: 'The Hearth-Spark and the Moonwell answer those who ask politely.',
      Way: 'Snowstride, fortune, and the ancient art of knocking things off ledges.',
    };
    this.refs.skillBody.innerHTML = '';
    for (const tree in trees) {
      const box = el('div', 'skill-tree');
      box.appendChild(el('h3', '', tree));
      box.appendChild(el('p', '', blurb[tree] || ''));
      for (const s of trees[tree]) {
        const rank = p.skills[s.id] || 0;
        const maxed = rank >= s.max;
        const node = el('button', 'skill-node' + (maxed ? ' maxed' : '') + (p.skillPoints <= 0 ? ' locked' : ''));
        const pips = Array.from({ length: s.max }, (_, i) => `<i class="${i < rank ? 'on' : ''}"></i>`).join('');
        node.innerHTML = `<span class="sn-ico">${icon(s.icon)}</span><span class="sn-txt"><b>${s.name}</b><span>${s.desc}</span><span class="pips">${pips}</span></span>${maxed ? '<span class="cost">MAX</span>' : `<span class="cost">+1</span>`}`;
        node.addEventListener('click', () => {
          if (p.spendSkill(s.id)) this.refreshSkills();
          else if (p.skillPoints <= 0) this.toast('No skill points. Level up, little hunter.', 'bad');
        });
        box.appendChild(node);
      }
      this.refs.skillBody.appendChild(box);
    }
  }

  refreshQuests() {
    const g = this.game;
    const list = this.refs.questList;
    if (!list) return;
    list.innerHTML = '';
    const active = [...g.quests.states.values()].filter(s => !s.complete);
    const done = [...g.quests.states.values()].filter(s => s.complete);
    const all = [...active, ...done];
    if (!all.length) {
      list.appendChild(el('div', 'empty-note', 'No quests yet. Talk to someone. Anyone. They all have opinions.'));
      this.refs.questDetail.innerHTML = '<div class="empty-note">Your ledger is empty.</div>';
      return;
    }
    if (!this.questSelected || !all.find(s => s.id === this.questSelected)) this.questSelected = all[0].id;
    for (const state of all) {
      const q = QUESTS_BY_ID[state.id];
      if (!q) continue;
      const item = el('button', 'quest-item' + (state.complete ? ' done' : '') + (this.questSelected === state.id ? ' active' : ''));
      item.innerHTML = `<span class="qtype">${q.type === 'main' ? 'Main quest' : 'Side quest'}${state.complete ? ' · complete' : ''}</span><b>${q.title}</b><span>${state.complete ? 'Done. Mostly.' : q.stages[state.stage]?.text || ''}</span>`;
      item.addEventListener('click', () => { this.questSelected = state.id; this.refreshQuests(); });
      list.appendChild(item);
    }
    this.renderQuestDetail(this.questSelected);
  }

  renderQuestDetail(id) {
    const g = this.game;
    const state = g.quests.get(id);
    const q = QUESTS_BY_ID[id];
    const detail = this.refs.questDetail;
    if (!detail) return;
    if (!q || !state) { detail.innerHTML = '<div class="empty-note">Select a quest.</div>'; return; }
    const objectives = q.stages.map((st, i) => {
      let done = i < state.stage || state.complete;
      let text = st.text;
      if (i === state.stage && !state.complete && (st.count || 1) > 1) text = text.replace(/\(\d+\/\d+\)/, `(${state.progress}/${st.count})`);
      return `<li class="${done ? 'done' : ''}">${text}</li>`;
    }).join('');
    const reward = q.reward || {};
    detail.innerHTML = `
      <h3>${q.title}</h3>
      <div class="qmeta">${q.type === 'main' ? 'Main quest' : 'Side quest'} · ${state.complete ? 'Complete' : 'Active'}</div>
      <p>${q.desc}</p>
      <ul class="quest-obj-list">${objectives}</ul>
      <div class="quest-reward">Reward: ${reward.xp || 0} XP · ${reward.gold || 0} gold${reward.items?.length ? ' · ' + reward.items.map(i => ITEMS[i]?.name || i).join(', ') : ''}</div>
      <div style="margin-top:16px;display:flex;gap:8px">
        <button class="btn gold small" id="btn-track-quest">${g.quests.tracked === id ? 'Tracked' : 'Track this quest'}</button>
      </div>`;
    $('btn-track-quest')?.addEventListener('click', () => {
      g.quests.tracked = id;
      g.compassTarget = null;
      this.refreshQuests();
      this.updateQuestTracker();
      this.toast(`Tracking <b>${q.title}</b>`);
    });
  }

  // -------------------------------------------------------------------------
  refreshMapSide() {
    const g = this.game;
    const list = this.refs.mapMarkers;
    if (!list) return;
    list.innerHTML = '';
    const here = g.currentArea?.name || 'Catterfall';
    if (this.refs.mapLoc) this.refs.mapLoc.textContent = here;
    if (this.refs.mapDesc) this.refs.mapDesc.textContent = g.currentArea?.sub || 'Snow, stone, and the occasional deeply rude goat.';
    const markers = [];
    for (const state of g.quests.states.values()) {
      if (state.complete) continue;
      const pos = g.quests.markerPosition(state.id);
      const q = QUESTS_BY_ID[state.id];
      if (pos && q) markers.push({ ...pos, kind: q.type, title: q.title, id: state.id });
    }
    for (const key in LANDMARKS) {
      const l = LANDMARKS[key];
      if (l.radius < 30) continue;
      if (markers.find(m => Math.hypot(m.x - l.x, m.z - l.z) < 8)) continue;
      markers.push({ x: l.x, z: l.z, name: l.name, title: l.name, kind: 'town', id: key });
    }
    for (const m of markers) {
      const b = el('button', 'map-marker', `<b>${m.title || m.name}</b><span>${m.kind === 'main' ? 'Main quest' : m.kind === 'side' ? 'Side quest' : 'Landmark'}</span>`);
      b.addEventListener('click', () => {
        g.compassTarget = { x: m.x, z: m.z, name: m.title || m.name };
        this.toast(`Compass set: <b>${m.title || m.name}</b>`);
      });
      list.appendChild(b);
    }
    this.mapMarkers = markers;
  }

  drawMap() {
    const g = this.game;
    const canvas = this.refs.mapCanvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(320, rect.width), h = Math.max(260, rect.height);
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = 22;
    const size = Math.min(w, h) - pad * 2;
    const ox = (w - size) / 2, oy = (h - size) / 2;
    const toMap = (x, z) => [ox + ((x + 700) / 1400) * size, oy + ((z + 700) / 1400) * size];
    // background
    const bg = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, size * 0.75);
    bg.addColorStop(0, '#152b34');
    bg.addColorStop(0.6, '#0d1c24');
    bg.addColorStop(1, '#070f14');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    // parchment grid
    ctx.strokeStyle = 'rgba(216,177,106,.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const p = ox + (i / 8) * size;
      ctx.beginPath(); ctx.moveTo(p, oy); ctx.lineTo(p, oy + size); ctx.stroke();
      const q = oy + (i / 8) * size;
      ctx.beginPath(); ctx.moveTo(ox, q); ctx.lineTo(ox + size, q); ctx.stroke();
    }
    // border
    ctx.strokeStyle = 'rgba(216,177,106,.35)';
    ctx.strokeRect(ox - 1, oy - 1, size + 2, size + 2);

    // river
    ctx.strokeStyle = 'rgba(100,199,201,.4)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let z = -700; z <= 700; z += 10) {
      const x = 110 * Math.sin(z * 0.0075) + 45 * Math.sin(z * 0.019 + 1.7);
      const [mx, my] = toMap(x, z);
      if (z === -700) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
    }
    ctx.stroke();
    // lake
    const [lx, ly] = toMap(-300, 300);
    ctx.fillStyle = 'rgba(80,150,170,.3)';
    ctx.beginPath(); ctx.ellipse(lx, ly, size * 0.075, size * 0.06, 0, 0, Math.PI * 2); ctx.fill();

    // roads
    if (g.world?.roadPoints?.length) {
      ctx.strokeStyle = 'rgba(190,170,130,.28)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let prev = null;
      for (const p of g.world.roadPoints) {
        const [mx, my] = toMap(p.x, p.z);
        if (!prev || Math.hypot(mx - prev[0], my - prev[1]) > size * 0.25) ctx.moveTo(mx, my);
        else ctx.lineTo(mx, my);
        prev = [mx, my];
      }
      ctx.stroke();
    }

    // mountains
    ctx.fillStyle = 'rgba(210,225,232,.10)';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r = 0.78 + (i % 3) * 0.04;
      const [mx, my] = toMap(Math.cos(a) * 700 * r, Math.sin(a) * 700 * r);
      ctx.beginPath(); ctx.arc(mx, my, 4 + (i % 4) * 2, 0, Math.PI * 2); ctx.fill();
    }

    // landmarks
    for (const key in LANDMARKS) {
      const l = LANDMARKS[key];
      if (l.radius < 30) continue;
      const [mx, my] = toMap(l.x, l.z);
      ctx.fillStyle = '#c8a06b';
      ctx.beginPath(); ctx.arc(mx, my, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,160,107,.35)';
      ctx.beginPath(); ctx.arc(mx, my, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(220,234,240,.7)';
      ctx.font = '9px "Alegreya Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(l.name.toUpperCase(), mx, my - 10);
    }

    // quest markers
    for (const state of g.quests.states.values()) {
      if (state.complete) continue;
      const pos = g.quests.markerPosition(state.id);
      if (!pos) continue;
      const q = QUESTS_BY_ID[state.id];
      const [mx, my] = toMap(pos.x, pos.z);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = q.type === 'main' ? '#f6e2ac' : '#7fb5c8';
      ctx.shadowColor = q.type === 'main' ? '#d8b16a' : '#7fb5c8';
      ctx.shadowBlur = 8;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }

    // player
    const p = g.player;
    if (p) {
      const [mx, my] = toMap(p.position.x, p.position.z);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(-p.camYaw + Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.4)';
      ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.stroke();
    }

    // compass rose
    ctx.fillStyle = 'rgba(216,177,106,.55)';
    ctx.font = '700 11px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', w - 28, 24);
    ctx.strokeStyle = 'rgba(216,177,106,.35)';
    ctx.beginPath(); ctx.moveTo(w - 28, 30); ctx.lineTo(w - 28, 48); ctx.stroke();
  }

  // -------------------------------------------------------------------------
  showShop(npc) {
    this.shopNpc = npc;
    this.openPanel('shop');
    this.refreshShop();
  }

  refreshShop() {
    const g = this.game;
    const npc = this.shopNpc || g.shopNpc;
    if (!npc || !npc.merchant) return;
    const inv = g.inventory;
    if (this.refs.shopName) this.refs.shopName.textContent = npc.name;
    if (this.refs.shopEyebrow) this.refs.shopEyebrow.textContent = npc.role || 'Merchant';
    if (this.refs.shopGold) this.refs.shopGold.textContent = inv.gold;
    if (this.refs.shopLine) this.refs.shopLine.textContent = `“${npc.merchant.line}”`;
    const buy = this.refs.shopBuy;
    if (buy) {
      buy.innerHTML = '';
      for (const id of npc.merchant.stock) {
        const item = ITEMS[id];
        if (!item) continue;
        const price = Math.max(1, Math.round(item.value * 1.35));
        const row = el('button', 'shop-row', `<span class="item-ico">${icon(item.icon)}</span><span class="sr-txt"><b>${item.name}</b><span>${item.desc.slice(0, 58)}${item.desc.length > 58 ? '…' : ''}</span></span><span class="price">${price}</span>`);
        row.addEventListener('click', () => {
          if (inv.gold < price) { this.toast('Not enough gold. Try looking more pitiful.', 'bad'); g.audio.playFail(); return; }
          inv.gold -= price;
          inv.add(id, 1, true);
          g.audio.playPickup();
          this.toast(`Bought <b>${item.name}</b>`, 'good');
          this.refreshShop();
          this.refreshInventory();
          this.updateHUD();
        });
        buy.appendChild(row);
      }
    }
    const sell = this.refs.shopSell;
    if (sell) {
      sell.innerHTML = '';
      const entries = [...inv.slots.entries()].filter(([id]) => ITEMS[id] && ITEMS[id].type !== 'quest' && ITEMS[id].rarity !== 'quest');
      if (!entries.length) sell.appendChild(el('div', 'empty-note', 'Nothing to sell. You are travelling light, and also broke.'));
      for (const [id, qty] of entries) {
        const item = ITEMS[id];
        const price = Math.max(1, Math.round(item.value * 0.5));
        const row = el('button', 'shop-row', `<span class="item-ico">${icon(item.icon)}</span><span class="sr-txt"><b>${item.name}${qty > 1 ? ` ×${qty}` : ''}</b><span>Sells for ${price} gold</span></span><span class="price">${price}</span>`);
        row.addEventListener('click', () => {
          if (inv.remove(id, 1)) {
            inv.gold += price;
            g.audio.playPickup();
            this.toast(`Sold <b>${item.name}</b> for ${price} gold`, 'good');
            this.refreshShop();
            this.refreshInventory();
            this.updateHUD();
          }
        });
        sell.appendChild(row);
      }
    }
  }

  // -------------------------------------------------------------------------
  update(dt) {
    const g = this.game;
    if (!g.player) return;
    this.updateHUD();
    if (g.mode === 'play') {
      const p = g.player;
      if (p.interactTarget || p.nearNPC) {
        // prompt already managed by player
      }
    }
  }
}
