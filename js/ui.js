// DOM interface: menu, campaign, armory, manual, settings, pause, results, HUD.

import {
  MISSIONS, WEAPONS, UPGRADES, ENEMY_TYPES, PALETTES, threatDots, resolveWeapon,
} from './content.js';
import { clamp, formatTime, formatNumber } from './util.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(game) {
    this.game = game;
    this.panelKind = null;
    this.armorySelected = null;
    this.resetArmed = false;
    this.toastTimer = null;
    this.tipTimer = null;
    this.killfeedTimers = [];
    this.cache();
  }

  cache() {
    const ids = [
      'menu', 'hud', 'overlay', 'panel', 'panel-kicker', 'panel-title', 'panel-body', 'panel-foot', 'panel-close',
      'menu-credits', 'menu-level', 'menu-cleared', 'menu-kills', 'menu-accuracy',
      'play-kicker', 'card-tag', 'card-status', 'card-loc', 'card-name', 'card-brief',
      'card-threat', 'card-intel', 'card-reward', 'btn-play', 'btn-deploy-card',
      'hp-fill', 'hp-text', 'armor-fill', 'focus-fill', 'focus-state',
      'obj-kicker', 'obj-text', 'obj-sub', 'minimap-label', 'killfeed',
      'weapon-cls', 'weapon-name', 'ammo-mag', 'ammo-reserve', 'fire-mode', 'reload-fill',
      'grenade-count', 'dash-state', 'focus-text', 'toast', 'hud-tip', 'damage-flash', 'low-health',
      'deploy', 'deploy-name', 'deploy-loc', 'deploy-fill', 'deploy-status', 'rotate-hint',
      'stick-move', 'stick-aim', 'lock-hint', 'btn-fire',
    ];
    this.el = {};
    for (const id of ids) this.el[id] = $(id);
    this.el.minimap = $('minimap');
    this.el.grenadeBtn = document.querySelector('[data-action="grenade"] small');
    this.el.focusBtn = document.querySelector('[data-action="focus"] small');
    this.el.dashBtn = document.querySelector('[data-action="dash"] small');
    this.el.reloadBtn = document.querySelector('[data-action="reload"] small');
  }

  init() {
    this.bindMenu();
    this.bindPanel();
    this.el['panel-close'].addEventListener('click', () => this.closePanel());
    window.addEventListener('pointerdown', () => this.game.ensureAudio(), { once: false });
    window.addEventListener('keydown', () => this.game.ensureAudio(), { once: true });
    this.updateRotateHint();
  }

  bindMenu() {
    this.el['btn-play'].addEventListener('click', () => {
      this.game.ensureAudio();
      this.game.audio.ui(true);
      this.game.playNext();
    });
    this.el['btn-deploy-card'].addEventListener('click', () => {
      this.game.ensureAudio();
      this.game.audio.ui(true);
      this.game.playNext();
    });
    document.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.game.ensureAudio();
        this.game.audio.ui();
        this.openPanel(btn.dataset.nav);
      });
    });
  }

  bindPanel() {
    this.el.overlay.addEventListener('click', (e) => {
      if (e.target === this.el.overlay && !['results', 'failed'].includes(this.panelKind)) this.closePanel();
    });
    this.el['panel-body'].addEventListener('input', (e) => {
      const input = e.target.closest('[data-setting]');
      if (!input) return;
      this.game.setSetting(input.dataset.setting, Number(input.value) / 100);
      const out = input.parentElement.querySelector('.slider-val');
      if (out) out.textContent = `${input.value}%`;
    });
    this.el.overlay.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      this.game.audio.ui();
      this.handleAction(btn.dataset.act, btn.dataset.arg);
    });
  }

  handleAction(action, arg) {
    const g = this.game;
    if (action === 'close') return this.closePanel();
    if (action === 'campaign') return this.openPanel('campaign');
    if (action === 'armory') {
      this.armorySelected = arg || g.save.loadout.primary;
      return this.openPanel('armory');
    }
    if (action === 'manual') return this.openPanel('manual');
    if (action === 'settings') return this.openPanel('settings');
    if (action === 'mission') return this.renderBriefing(Number(arg));
    if (action === 'skirmishBriefing') {
      if (!g.allComplete()) return;
      return this.openPanel('skirmishBrief');
    }
    if (action === 'deploy') {
      this.closePanel(true);
      return g.startMission(Number(arg));
    }
    if (action === 'deploySkirmish') {
      this.closePanel(true);
      return g.startSkirmish();
    }
    if (action === 'buyWeapon') {
      if (g.buyWeapon(arg)) this.armorySelected = arg;
      return this.openPanel('armory');
    }
    if (action === 'equipWeapon') {
      g.equipWeapon(arg);
      this.armorySelected = arg;
      return this.openPanel('armory');
    }
    if (action === 'buyUpgrade') {
      g.buyUpgrade(arg);
      return this.openPanel('armory');
    }
    if (action === 'toggle') {
      g.setSetting(arg, !g.save.settings[arg]);
      return this.openPanel(this.panelKind);
    }
    if (action === 'reset') {
      if (!this.resetArmed) {
        this.resetArmed = true;
        return this.renderSettings();
      }
      this.resetArmed = false;
      g.resetProgress();
      this.closePanel(true);
      this.showToast('PROGRESS RESET', 'bad', 2200);
      return;
    }
    if (action === 'resume') return g.resume();
    if (action === 'restart') return g.restartMission();
    if (action === 'abort') {
      this.closePanel(true);
      return g.returnToMenu();
    }
    if (action === 'next') return g.continueAfterResults();
    if (action === 'retry') return g.restartMission();
    if (action === 'base') {
      this.closePanel(true);
      return g.returnToMenu();
    }
  }

  // --------------------------------------------------------------------- menu
  refreshMenu() {
    const g = this.game;
    const save = g.save;
    const allDone = g.allComplete();
    const next = allDone ? null : MISSIONS[g.nextMissionIndex()];
    const def = allDone ? g.skirmishPreview() : next;
    const level = Math.floor((save.xp || 0) / 500) + 1;
    this.el['menu-credits'].textContent = formatNumber(save.credits);
    this.el['menu-level'].textContent = String(level).padStart(2, '0');
    this.el['menu-cleared'].textContent = `${save.completed.length} / 6`;
    this.el['menu-kills'].textContent = formatNumber(save.stats.kills || 0);
    const accuracy = save.stats.shots ? Math.round((save.stats.hits / save.stats.shots) * 100) : null;
    this.el['menu-accuracy'].textContent = accuracy === null ? '—' : `${accuracy}%`;
    this.el['play-kicker'].textContent = allDone ? 'ENDLESS SKIRMISH' : 'NEXT OPERATION';
    this.el['card-tag'].textContent = allDone ? 'ENDLESS MODE' : 'NEXT OPERATION';
    this.el['card-status'].textContent = allDone ? 'ONLINE' : next && save.completed.includes(next.id) ? 'REPLAY' : 'READY';
    this.el['card-loc'].textContent = def.loc.split('//')[0].trim();
    this.el['card-name'].textContent = def.name;
    this.el['card-brief'].textContent = def.brief;
    this.el['card-threat'].textContent = threatDots(allDone ? 4 : def.threat);
    this.el['card-intel'].textContent = allDone ? 'SKIRMISH' : `${def.intel} FILES`;
    this.el['card-reward'].textContent = allDone ? '40 CR / WAVE' : `${def.reward} CR`;
    this.el['card-status'].style.color = allDone ? 'var(--violet)' : '';
    this.el['btn-deploy-card'].setAttribute('aria-label', allDone ? 'Start skirmish' : 'Deploy to next operation');
    const footer = $('footer-hint');
    if (footer) footer.textContent = allDone ? 'ALL OPERATIONS CLEARED — ENDLESS PROTOCOL UNLOCKED' : 'TOUCH OR CLICK TO ENGAGE AUDIO';
  }

  // --------------------------------------------------------------------- HUD
  enterMission(def, skirmish) {
    this.el.menu.classList.add('hidden');
    this.el.hud.classList.remove('hidden');
    this.el.overlay.classList.add('hidden');
    this.panelKind = null;
    document.body.classList.add('playing');
    this.el.killfeed.innerHTML = '';
    this.el['minimap-label'].textContent = def.loc.split('//')[0].trim();
    this.el['ammo-mag'].classList.remove('low');
    this.el['hud-tip'].classList.remove('show');
    this.el['toast'].classList.remove('show');
  }

  exitMission() {
    this.el.menu.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el.overlay.classList.add('hidden');
    this.el.deploy.classList.add('hidden');
    this.panelKind = null;
    document.body.classList.remove('playing');
    this.el.killfeed.innerHTML = '';
    this.updateRotateHint();
  }

  showDeploy(def, skirmish) {
    this.el.deploy.classList.remove('hidden');
    this.el['deploy-name'].textContent = def.name;
    this.el['deploy-loc'].textContent = skirmish ? 'HOT ZONE // ADAPTIVE INSERTION' : def.loc;
    this.el['deploy-status'].textContent = skirmish ? 'WAVE ONE INBOUND' : 'INSERTION IN PROGRESS';
    this.el['deploy-fill'].style.width = '0%';
  }

  setDeployProgress(p) {
    this.el['deploy-fill'].style.width = `${clamp(p, 0, 1) * 100}%`;
    if (p > 0.82) this.el['deploy-status'].textContent = 'SIGNAL LOCKED';
  }

  hideDeploy() {
    this.el.deploy.classList.add('hidden');
  }

  setText(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }

  updateHUD() {
    const g = this.game;
    if (!g.player || this.el.hud.classList.contains('hidden')) return;
    const p = g.player;
    const w = p.weapons[p.slot];
    const hpRatio = clamp(p.hp / p.maxHp, 0, 1);
    this.el['hp-fill'].style.transform = `scaleX(${hpRatio})`;
    this.setText(this.el['hp-text'], String(Math.max(0, Math.ceil(p.hp))));
    this.el['armor-fill'].style.transform = `scaleX(${clamp(p.armor / p.maxArmor, 0, 1)})`;
    let focusRatio;
    let focusLabel;
    if (p.focusActive > 0) {
      focusRatio = 1;
      focusLabel = 'ACTIVE';
    } else if (p.focusCd > 0) {
      focusRatio = 1 - p.focusCd / p.focusFull;
      focusLabel = `${Math.ceil(p.focusCd)}S`;
    } else {
      focusRatio = 1;
      focusLabel = 'READY';
    }
    this.el['focus-fill'].style.transform = `scaleX(${clamp(focusRatio, 0, 1)})`;
    this.setText(this.el['focus-state'], focusLabel);
    this.setText(this.el['focus-text'], focusLabel);
    this.el['focus-fill'].style.background = p.focusActive > 0 ? '#c4b5fd' : '#a78bfa';

    const objective = g.getObjective();
    this.setText(this.el['obj-kicker'], objective.kicker);
    this.setText(this.el['obj-text'], objective.text);
    this.setText(this.el['obj-sub'], objective.sub);
    this.el['obj-sub'].classList.toggle('live', Boolean(objective.live));

    this.setText(this.el['weapon-cls'], w.def.cls);
    this.setText(this.el['weapon-name'], w.def.name);
    this.setText(this.el['ammo-mag'], String(w.mag));
    this.setText(this.el['ammo-reserve'], `/ ${formatNumber(w.reserve)}`);
    this.setText(this.el['fire-mode'], w.def.auto ? 'AUTO' : 'SEMI');
    this.el['ammo-mag'].classList.toggle('low', w.mag <= Math.max(3, Math.ceil(w.def.mag * 0.22)));
    this.el['reload-fill'].style.width = w.reloading ? `${(1 - w.reloadT / w.def.reload) * 100}%` : '0%';
    this.setText(this.el['grenade-count'], String(p.grenades));
    const dashLabel = p.dashCd > 0 ? `${p.dashCd.toFixed(1)}S` : 'READY';
    this.setText(this.el['dash-state'], dashLabel);
    this.setText(this.el['dashBtn'], p.dashCd > 0 ? `${p.dashCd.toFixed(1)}` : 'DASH');
    this.setText(this.el.grenadeBtn, `FRAG ${p.grenades}`);
    this.setText(this.el.focusBtn, p.focusActive > 0 ? 'ACTIVE' : p.focusCd > 0 ? `${Math.ceil(p.focusCd)}S` : 'FOCUS');
    this.setText(this.el.reloadBtn, w.reloading ? 'RELOADING' : 'RELOAD');
    this.el['damage-flash'].style.opacity = String(clamp(g.damageFlash, 0, 1) * 0.85);
    this.el['low-health'].classList.toggle('active', p.hp < 32 && !p.dead);
    if (this.el['lock-hint']) {
      const showLock = !g.isTouch && g.state === 'playing' && !document.pointerLockElement;
      this.el['lock-hint'].classList.toggle('hidden', !showLock);
    }
  }

  showToast(text, type = '', duration = 2200) {
    const toast = this.el.toast;
    toast.textContent = text;
    toast.className = `hud-toast show ${type}`;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  showTip(text, duration = 2600) {
    const tip = this.el['hud-tip'];
    tip.textContent = text;
    tip.classList.add('show');
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => tip.classList.remove('show'), duration);
  }

  addKillfeed(name, head) {
    const el = document.createElement('div');
    el.className = `kill-item${head ? ' head' : ''}`;
    el.innerHTML = `<b>${head ? 'HEADSHOT' : 'ELIMINATED'}</b> ${name}`;
    this.el.killfeed.prepend(el);
    while (this.el.killfeed.children.length > 4) this.el.killfeed.lastChild.remove();
    const t = setTimeout(() => el.remove(), 3600);
    this.killfeedTimers.push(t);
  }

  showJoystick(stick, side) {
    const el = this.el[`stick-${side}`];
    if (!el) return;
    el.style.left = `${stick.baseX}px`;
    el.style.top = `${stick.baseY}px`;
    el.classList.add('active');
    const knob = el.querySelector('i');
    if (knob) knob.style.transform = 'translate(0px, 0px)';
  }

  updateJoystick(stick, side) {
    const el = this.el[`stick-${side}`];
    if (!el) return;
    const knob = el.querySelector('i');
    if (knob) knob.style.transform = `translate(${stick.dx}px, ${stick.dy}px)`;
  }

  hideJoystick(side) {
    this.el[`stick-${side}`]?.classList.remove('active');
  }

  updateRotateHint() {
    const hint = this.el['rotate-hint'];
    if (!hint) return;
    const portrait = window.innerHeight > window.innerWidth;
    hint.classList.toggle('hidden', !(portrait && this.game.isTouch));
  }

  // ------------------------------------------------------------------- panels
  openPanel(kind, data = null) {
    const g = this.game;
    if (!kind) return;
    this.panelKind = kind;
    this.el.overlay.classList.remove('hidden');
    this.el['panel-close'].style.display = ['results', 'failed'].includes(kind) ? 'none' : 'grid';
    if (kind === 'campaign') this.renderCampaign();
    else if (kind === 'armory') this.renderArmory();
    else if (kind === 'manual') this.renderManual();
    else if (kind === 'settings') this.renderSettings();
    else if (kind === 'pause') this.renderPause();
    else if (kind === 'results' || kind === 'failed') this.renderResults(kind === 'results', data || g.pendingResults);
    else if (kind === 'skirmishBrief') this.renderSkirmishBrief();
    else if (kind === 'briefing') this.renderBriefing(data ?? g.nextMissionIndex());
    else this.renderCampaign();
  }

  closePanel(force = false) {
    if (!force && ['results', 'failed'].includes(this.panelKind)) return;
    this.el.overlay.classList.add('hidden');
    this.panelKind = null;
    this.resetArmed = false;
    if (!force && this.game.state === 'paused') this.game.resume();
  }

  setPanel(kicker, title, body, foot = '') {
    this.el['panel-kicker'].textContent = kicker;
    this.el['panel-title'].textContent = title;
    this.el['panel-body'].innerHTML = body;
    this.el['panel-foot'].innerHTML = foot;
    this.el['panel-body'].scrollTop = 0;
  }

  // ------------------------------------------------------------------- panels
  renderCampaign() {
    const g = this.game;
    const save = g.save;
    let cards = '';
    MISSIONS.forEach((m, i) => {
      const locked = i > save.unlocked;
      const complete = save.completed.includes(m.id);
      const best = save.best[m.id];
      const total = Object.values(m.enemies).reduce((a, b) => a + b, 0);
      const badge = locked ? 'LOCKED' : complete ? 'CLEARED' : 'READY';
      const badgeCls = locked ? 'locked-badge' : complete ? '' : 'new';
      cards += `
        <button class="op-card ${locked ? 'locked' : ''} ${complete ? 'complete' : ''}" data-act="mission" data-arg="${i}" ${locked ? 'disabled' : ''}>
          <span class="op-num">OPERATION ${String(i + 1).padStart(2, '0')}</span>
          <span class="op-badge ${badgeCls}">${badge}</span>
          <h3>${m.name}</h3>
          <span class="op-loc">${m.loc}</span>
          <span class="op-meta">
            <span>THREAT <b>${threatDots(m.threat)}</b></span>
            <span>HOSTILES <b>${total}</b></span>
            <span>INTEL <b>${m.intel}</b></span>
            <span>PAYOUT <b>${m.reward} CR</b></span>
          </span>
          ${best ? `<span class="op-clear">BEST TIME ${formatTime(best)}</span>` : ''}
        </button>`;
    });
    const allDone = g.allComplete();
    cards += allDone
      ? `<button class="skirmish-card" data-act="skirmishBriefing">
        <span class="sk-icon">∞</span>
        <div><h3>HOT ZONE — SKIRMISH</h3><p>Endless waves on a random compound. Stack the multiplier and take your record as far as it goes.</p></div>
        <span class="sk-best">BEST WAVE<b>${save.stats.bestSurvival || 0}</b></span>
      </button>`
      : `<button class="skirmish-card locked" disabled>
        <span class="sk-icon">∞</span>
        <div><h3>HOT ZONE — SKIRMISH</h3><p>Endless waves on a random compound. Complete all six operations to unlock.</p></div>
        <span class="sk-best">STATUS<b>LOCKED</b></span>
      </button>`;
    const body = `
      <div class="section-label">SELECT AN OPERATION</div>
      <div class="ops-grid">${cards}</div>
      <div class="tip-box">Complete an operation to unlock the next. Recovered intel and fast exfils pay bonus credits. Every operation is replayable for a better rank.</div>`;
    this.setPanel(
      'VANGUARD COMMAND',
      'CAMPAIGN',
      body,
      `<button class="btn-outline" data-act="armory">ARMORY</button><button class="btn-outline" data-act="close">CLOSE</button>`,
    );
  }

  hostiles(m) {
    return Object.values(m.enemies).reduce((a, b) => a + b, 0);
  }

  renderBriefing(index) {
    const g = this.game;
    const m = MISSIONS[index];
    if (!m) return this.renderCampaign();
    const locked = index > g.save.unlocked;
    const complete = g.save.completed.includes(m.id);
    const best = g.save.best[m.id];
    const loadout = resolveWeapon(g.save.loadout.primary, g.save);
    const body = `
      <div class="briefing-grid">
        <div class="briefing-text">
          <p>${m.brief}</p>
          <div class="intel-line">PRIMARY // ELIMINATE ALL HOSTILES THEN REACH EXTRACTION</div>
          <p style="margin-top:8px;color:var(--muted)">SECONDARY // RECOVER ${m.intel} INTEL FILE${m.intel === 1 ? '' : 'S'} FOR BONUS CREDITS</p>
          <div class="tip-box">${m.tip}</div>
          ${locked ? '<div class="tip-box" style="border-color:var(--red);background:rgba(248,113,113,.06);color:#fecaca">OPERATION LOCKED — COMPLETE THE PREVIOUS OPERATION FIRST.</div>' : ''}
        </div>
        <div>
          <div class="briefing-facts">
            <div class="fact"><span>LOCATION</span><b>${m.loc}</b></div>
            <div class="fact"><span>THREAT</span><b style="color:var(--red)">${threatDots(m.threat)}</b></div>
            <div class="fact"><span>HOSTILES</span><b>${this.hostiles(m)}</b></div>
            <div class="fact"><span>INTEL</span><b>${m.intel} FILES</b></div>
            <div class="fact"><span>PAR TIME</span><b>${formatTime(m.par)}</b></div>
            <div class="fact"><span>PAYOUT</span><b style="color:var(--amber)">${m.reward} CR</b></div>
            <div class="fact"><span>LOADOUT</span><b>${loadout.name}</b></div>
            <div class="fact"><span>BEST</span><b>${best ? formatTime(best) : '—'}</b></div>
          </div>
          ${complete ? '<div class="tip-box" style="margin-top:10px;border-color:var(--green);color:#bbf7d0">OPERATION CLEARED. REPLAY FOR A BETTER RANK AND PAYOUT.</div>' : ''}
        </div>
      </div>`;
    this.setPanel(
      `OPERATION BRIEF // OP ${String(index + 1).padStart(2, '0')}`,
      m.name,
      body,
      `<button class="btn-outline" data-act="campaign">BACK</button>
       <button class="btn-solid" data-act="deploy" data-arg="${index}" ${locked ? 'disabled' : ''}>DEPLOY OPERATION</button>`,
    );
  }

  renderSkirmishBrief() {
    const g = this.game;
    const body = `
      <div class="briefing-grid">
        <div class="briefing-text">
          <p>No extraction window. No resupply drops. A rotating compound, an endless supply of hostiles, and one operator. Clear a wave, scavenge the field, and do it again with a heavier assault on your doorstep.</p>
          <div class="intel-line">PROTOCOL // SURVIVE. RESUPPLY. REPEAT.</div>
          <div class="tip-box">Waves grant a full resupply window. Ammo, armor, and grenades drop from every hostile. Best wave is saved to your operator record.</div>
        </div>
        <div class="briefing-facts">
          <div class="fact"><span>MODE</span><b>ENDLESS SKIRMISH</b></div>
          <div class="fact"><span>THREAT</span><b style="color:var(--violet)">ADAPTIVE</b></div>
          <div class="fact"><span>BEST WAVE</span><b>${g.save.stats.bestSurvival || 0}</b></div>
          <div class="fact"><span>PAYOUT</span><b style="color:var(--amber)">40 CR / WAVE</b></div>
          <div class="fact"><span>LOADOUT</span><b>${resolveWeapon(g.save.loadout.primary, g.save).name}</b></div>
        </div>
      </div>`;
    this.setPanel('ENDLESS PROTOCOL', 'HOT ZONE', body,
      `<button class="btn-outline" data-act="campaign">BACK</button><button class="btn-solid" data-act="deploySkirmish">DEPLOY SKIRMISH</button>`);
  }

  renderArmory() {
    const g = this.game;
    const save = g.save;
    if (!this.armorySelected || !WEAPONS[this.armorySelected]) this.armorySelected = save.loadout.primary;
    const selected = WEAPONS[this.armorySelected];
    let list = '';
    Object.values(WEAPONS).forEach((w) => {
      const owned = save.ownedWeapons.includes(w.id);
      const equipped = save.loadout.primary === w.id;
      list += `
        <button class="weapon-row ${selected.id === w.id ? 'selected' : ''} ${equipped ? 'equipped' : ''}" data-act="${owned ? 'equipWeapon' : 'buyWeapon'}" data-arg="${w.id}">
          <span class="w-icon">${w.cls === 'SHOTGUN' ? '▰' : w.cls === 'DMR' ? '⌖' : w.cls === 'LMG' ? '▤' : '▬'}</span>
          <span class="w-info"><strong>${w.name}</strong><span>${w.cls} // ${owned ? (equipped ? 'EQUIPPED' : 'OWNED') : 'LOCKED'}</span></span>
          <span class="w-price ${owned ? 'owned' : save.credits >= w.price ? '' : 'locked'}">${owned ? '✓' : `${w.price} CR`}</span>
        </button>`;
    });
    const owned = save.ownedWeapons.includes(selected.id);
    const equipped = save.loadout.primary === selected.id;
    const canBuy = save.credits >= selected.price;
    const detail = `
      <div class="weapon-detail">
        <span class="wd-class">${selected.cls} PLATFORM</span>
        <h3>${selected.name}</h3>
        <p>${selected.desc}</p>
        <div class="weapon-meta">
          <span>CALIBER <b>${selected.caliber}</b></span>
          <span>MODE <b>${selected.mode}</b></span>
          <span>RANGE <b>${selected.range} u</b></span>
          <span>PEN <b>TIER ${selected.pen}</b></span>
        </div>
        <div class="stat-bars">
          ${Object.entries(selected.bars).map(([k, v]) => `
            <div class="stat-bar"><span>${k.toUpperCase()}</span><div class="track"><i style="width:${v}%"></i></div><b>${v}</b></div>
          `).join('')}
        </div>
        <div class="detail-actions">
          ${!owned
            ? `<button class="btn-solid" data-act="buyWeapon" data-arg="${selected.id}" ${canBuy ? '' : 'disabled'}>${canBuy ? `ACQUIRE — ${selected.price} CR` : `NEED ${selected.price} CR`}</button>`
            : equipped
              ? '<button class="btn-solid" disabled>EQUIPPED</button>'
              : `<button class="btn-solid" data-act="equipWeapon" data-arg="${selected.id}">EQUIP PRIMARY</button>`}
        </div>
        <div class="tip-box" style="margin-top:12px;border-color:var(--line-bright);background:rgba(148,163,184,.05);color:var(--muted)">
          Field mods apply to every primary weapon. Buy once, keep forever.
        </div>
      </div>`;
    let upgrades = '';
    UPGRADES.forEach((u) => {
      const has = save.upgrades.includes(u.id);
      const can = save.credits >= u.price;
      upgrades += `
        <button class="upgrade ${has ? 'owned' : ''}" data-act="buyUpgrade" data-arg="${u.id}" ${has || !can ? 'disabled' : ''}>
          <span class="u-icon">${u.icon}</span>
          <span class="u-info"><strong>${u.name}</strong><span>${u.desc}</span></span>
          <span class="u-price">${has ? 'INSTALLED' : `${u.price} CR`}</span>
        </button>`;
    });
    const body = `
      <div class="loadout-bar">
        ACTIVE PRIMARY <b>${resolveWeapon(save.loadout.primary, save).name}</b>
        <span>MODS INSTALLED <b>${save.upgrades.length}/${UPGRADES.length}</b></span>
        <span class="credits">◈ ${formatNumber(save.credits)} CR</span>
      </div>
      <div class="armory-layout">
        <div>
          <div class="section-label">WEAPON PLATFORMS</div>
          <div class="weapon-list">${list}</div>
        </div>
        <div>
          <div class="section-label">PLATFORM DETAIL</div>
          ${detail}
        </div>
      </div>
      <div class="section-label">FIELD MODIFICATIONS</div>
      <div class="upgrade-grid">${upgrades}</div>`;
    this.setPanel(
      `REQUISITION // ${formatNumber(save.credits)} CR AVAILABLE`,
      'ARMORY',
      body,
      `<button class="btn-outline" data-act="campaign">CAMPAIGN</button><button class="btn-outline" data-act="close">CLOSE</button>`,
    );
  }

  renderManual() {
    const enemies = Object.values(ENEMY_TYPES).map((e) => `
      <div class="enemy-row">
        <span class="enemy-dot" style="background:${e.color};color:${e.color}"></span>
        <div><strong>${e.name}</strong><span>${e.id === 'grunt' ? 'Standard rifleman. Burst fire and steady advances.' : e.id === 'scout' ? 'Fast flanker. Closes distance and sprays SMG fire.' : e.id === 'marksman' ? 'Laser sight, long range, punishing single shots. Break line of sight.' : 'Armored suppression unit. Soaks damage and pins you down.'}</span></div>
      </div>`).join('');
    const body = `
      <div class="manual-grid">
        <div class="manual-card">
          <h3>OPERATOR CONTROL</h3>
          <div class="key-table">
            <kbd>WASD</kbd><span>Move / strafe</span>
            <kbd>MOUSE</kbd><span>Look around (click to lock)</span>
            <kbd>LMB</kbd><span>Fire (hold for auto)</span>
            <kbd>R</kbd><span>Reload</span>
            <kbd>G</kbd><span>Throw frag grenade</span>
            <kbd>Q</kbd><span>Tactical Focus</span>
            <kbd>SPACE</kbd><span>Dash / dodge</span>
            <kbd>1 / 2</kbd><span>Swap primary & sidearm</span>
            <kbd>ESC</kbd><span>Pause / release cursor</span>
          </div>
        </div>
        <div class="manual-card">
          <h3>TOUCH CONTROLS</h3>
          <p>Left half: drag to move. Right half: drag to look around. Hold the round FIRE button to shoot.</p>
          <p>Use reload before a push. Dash makes you briefly invulnerable. Grenades bounce and detonate on a fuse.</p>
          <p>Landscape gives the widest field of view. Aim assist can be disabled in Options.</p>
        </div>
        <div class="manual-card">
          <h3>BALLISTICS & COVER</h3>
          <p>Every round is simulated. Bullets travel, lose energy, ricochet off hard angles, and can punch through soft cover.</p>
          <p><b style="color:var(--amber)">Concrete</b> stops almost everything. <b style="color:#e0a080">Crates</b> stop pistol rounds but AP ammunition punches through. <b style="color:#7b735c">Sandbags</b> eat velocity. <b style="color:var(--red)">Fuel barrels</b> detonate when shot.</p>
          <p>Armor absorbs 62% of incoming damage until it breaks. Cover is better than armor.</p>
        </div>
        <div class="manual-card">
          <h3>HOSTILE RECOGNITION</h3>
          ${enemies}
        </div>
        <div class="manual-card">
          <h3>TACTICAL FOCUS</h3>
          <p>Press <b>Q</b> or the focus button to slow the world for 2.6 seconds. Aiming and reactions stay sharp; incoming fire crawls.</p>
          <p>The meter recharges automatically. Chain Focus with a grenade or a reload to turn a losing fight.</p>
        </div>
        <div class="manual-card">
          <h3>FIELD NOTES</h3>
          <p>Suppressed shots have a much smaller alert radius. Gunfire without a suppressor pulls every hostile in earshot.</p>
          <p>Enemies drop ammo, armor, and medical supplies. Intel laptops are optional but pay bonus credits.</p>
          <p>Extraction stays locked until every hostile is down. Watch the minimap for the green beacon.</p>
        </div>
      </div>`;
    this.setPanel('OPERATOR HANDBOOK', 'FIELD MANUAL', body,
      `<button class="btn-outline" data-act="campaign">CAMPAIGN</button><button class="btn-outline" data-act="close">CLOSE</button>`);
  }

  renderSettings() {
    const g = this.game;
    const s = g.save.settings;
    const row = (label, desc, control) => `
      <div class="setting-row"><div class="s-info"><strong>${label}</strong><span>${desc}</span></div>${control}</div>`;
    const toggle = (key) => `<button class="toggle ${s[key] ? 'on' : ''}" data-act="toggle" data-arg="${key}" aria-label="Toggle ${key}"></button>`;
    const slider = (key, label) => `
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="100" value="${Math.round(s[key] * 100)}" data-setting="${key}" aria-label="${label}" />
        <span class="slider-val" style="font-family:var(--mono);font-size:9px;color:var(--muted);width:34px;text-align:right">${Math.round(s[key] * 100)}%</span>
      </div>`;
    const accuracy = g.save.stats.shots ? Math.round((g.save.stats.hits / g.save.stats.shots) * 100) : 0;
    const body = `
      <div class="settings-list">
        ${row('MASTER VOLUME', 'Weapons, impacts and field audio.', slider('volume', 'Master volume'))}
        ${row('MUSIC & AMBIENCE', 'Low industrial underscore and drone.', slider('music', 'Music volume'))}
        ${row('SCREEN SHAKE', 'Camera impulse from gunfire and explosions.', toggle('shake'))}
        ${row('LOOK SENSITIVITY', 'Mouse and stick look speed.', slider('sensitivity', 'Look sensitivity'))}
        ${row('AIM ASSIST', 'Gentle target magnetism for touch and controller.', toggle('aimAssist'))}
        ${row('CONTEXT HINTS', 'Show contextual tactical prompts in the field.', toggle('hints'))}
      </div>
      <div class="section-label" style="margin-top:22px">OPERATOR RECORD</div>
      <div class="briefing-facts" style="max-width:620px">
        <div class="fact"><span>MISSIONS CLEARED</span><b>${g.save.completed.length} / 6</b></div>
        <div class="fact"><span>LIFETIME KILLS</span><b>${formatNumber(g.save.stats.kills)}</b></div>
        <div class="fact"><span>ACCURACY</span><b>${accuracy}%</b></div>
        <div class="fact"><span>BEST SKIRMISH WAVE</span><b>${g.save.stats.bestSurvival}</b></div>
        <div class="fact"><span>CREDITS</span><b style="color:var(--amber)">${formatNumber(g.save.credits)} CR</b></div>
      </div>
      <div class="section-label" style="margin-top:22px">DANGER ZONE</div>
      <button class="danger-btn" data-act="reset">${this.resetArmed ? 'CONFIRM RESET — CLICK AGAIN' : 'RESET ALL PROGRESS'}</button>
      <p style="font-size:9px;color:var(--muted);margin-top:8px">Deletes campaign progress, armory unlocks, credits, and records from this device.</p>`;
    this.setPanel('SYSTEM CONFIGURATION', 'OPTIONS', body,
      `<button class="btn-outline" data-act="close">CLOSE</button>`);
  }

  renderPause() {
    const g = this.game;
    const run = g.run;
    if (!run) return this.closePanel(true);
    const accuracy = run.shots ? Math.round((run.hits / run.shots) * 100) : 0;
    const body = `
      <div class="results" style="padding-top:0">
        <span class="result-kicker" style="color:var(--amber)">SIMULATION SUSPENDED</span>
        <h2 style="font-size:clamp(30px,4vw,48px)">${g.mission.name}</h2>
        <div class="result-sub">${g.mission.loc}${g.skirmish ? ` // WAVE ${g.wave}` : ''}</div>
      </div>
      <div class="result-stats">
        <div><span>MISSION TIME</span><b>${formatTime(run.elapsed)}</b></div>
        <div><span>HOSTILES DOWN</span><b>${run.kills}</b></div>
        <div><span>ACCURACY</span><b>${accuracy}%</b></div>
        <div><span>INTEL</span><b class="gold">${run.intel}</b></div>
      </div>
      <div class="detail-actions" style="justify-content:center;margin-top:18px">
        <button class="btn-solid" data-act="resume">RESUME OPERATION</button>
        <button class="btn-outline" data-act="settings">OPTIONS</button>
        <button class="btn-outline" data-act="restart">RESTART</button>
        <button class="btn-outline" data-act="abort">ABORT TO BASE</button>
      </div>`;
    this.setPanel('TACTICAL PAUSE', 'HOLD POSITION', body,
      `<button class="btn-outline" data-act="abort">ABORT</button><button class="btn-solid" data-act="resume">RESUME</button>`);
  }

  renderResults(success, data) {
    if (!data) return;
    const g = this.game;
    const s = data.stats;
    const r = data.rewards;
    const skirmish = Boolean(data.skirmish);
    const accuracy = Math.round(s.accuracy * 100);
    const title = success ? 'OPERATION COMPLETE' : skirmish ? 'SKIRMISH OVER' : 'OPERATOR DOWN';
    const kicker = success ? 'EXFIL CONFIRMED // OBJECTIVE SECURED' : skirmish ? 'SIGNAL LOST // RECORD SAVED' : 'SIGNAL LOST // OPERATOR KIA';
    const statCells = skirmish
      ? `<div><span>WAVE REACHED</span><b class="gold">${data.wave}</b></div>
         <div><span>HOSTILES DOWN</span><b>${s.kills}</b></div>
         <div><span>ACCURACY</span><b>${accuracy}%</b></div>
         <div><span>TIME</span><b>${formatTime(s.time)}</b></div>`
      : `<div><span>MISSION TIME</span><b>${formatTime(s.time)}</b></div>
         <div><span>HOSTILES DOWN</span><b>${s.kills}</b></div>
         <div><span>ACCURACY</span><b>${accuracy}%</b></div>
         <div><span>INTEL RECOVERED</span><b class="gold">${s.intel} / ${data.mission.intel}</b></div>`;
    const rewards = success
      ? `<div class="result-rewards">
           <span>CONTRACT <b>+${r.base} CR</b></span>
           <span>INTEL <b>+${r.intel} CR</b></span>
           <span>TIME <b>+${r.time} CR</b></span>
           <span>COMBAT <b>+${r.kills} CR</b></span>
           <span>ACCURACY <b>+${r.accuracy} CR</b></span>
         </div>
         <div class="result-rewards" style="font-size:12px;color:var(--amber-bright)">
           TOTAL <b style="font-size:18px">+${formatNumber(r.credits)} CR</b> <span style="color:var(--dim)">//</span> XP <b>+${formatNumber(r.xp)}</b>
         </div>`
      : skirmish
        ? `<div class="result-rewards">
             <span>WAVES CLEARED <b>${Math.max(0, data.wave - 1)}</b></span>
             <span>SURVIVAL PAYOUT <b>+${formatNumber(r.credits)} CR</b></span>
           </div>
           <div class="result-rewards" style="font-size:12px;color:var(--amber-bright)">
             TOTAL <b style="font-size:18px">+${formatNumber(r.credits)} CR</b> <span style="color:var(--dim)">//</span> XP <b>+${formatNumber(r.xp)}</b>
           </div>`
        : `<div class="result-rewards" style="color:var(--muted)">NO CONTRACT PAYOUT <b>+0 CR</b> <span style="color:var(--dim)">//</span> RECORDS UPDATED</div>`;
    const rank = success ? `<div class="result-rank">FIELD RATING <b>${data.rank}</b></div>` : '';
    const hasNext = success && data.mission.index < 5 && g.save.unlocked > data.mission.index;
    let foot;
    if (success) {
      foot = `${hasNext ? `<button class="btn-solid" data-act="next">NEXT OPERATION</button>` : ''}
        <button class="btn-outline" data-act="retry">REPLAY</button>
        <button class="btn-outline" data-act="base">RETURN TO BASE</button>`;
    } else {
      foot = `<button class="btn-solid" data-act="retry">${skirmish ? 'REDEPLOY' : 'RETRY OPERATION'}</button>
        <button class="btn-outline" data-act="base">RETURN TO BASE</button>`;
    }
    const body = `
      <div class="results">
        <span class="result-kicker" style="color:${success ? 'var(--green)' : 'var(--red)'}">${kicker}</span>
        <h2 class="${success ? '' : 'failed'}">${title}</h2>
        <div class="result-sub">${data.mission.name} // ${data.mission.loc}</div>
        <div class="result-stats">${statCells}</div>
        ${rewards}
        ${rank}
      </div>`;
    this.setPanel(success ? 'DEBRIEF // CLEAN EXFIL' : 'DEBRIEF // FAILED EXFIL', success ? 'MISSION DEBRIEF' : 'DEBRIEF', body, foot);
  }

  // __UI_MORE__
}
