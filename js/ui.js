// ============ UI: MENUS, HUD, STORE, WALLET, DOSSIER ============
import { economy } from './economy.js';
import {
  WEAPONS, PRIMARY_IDS, MODES, SKINS, OPERATORS, BATTLE_PASS, BP_XP_PER_TIER,
  STORE_ITEMS, CREDIT_PACKS, CONTROL_POINTS, DIFFICULTY, REWARDS
} from './config.js';
import { fmt, fmtUsd, clamp, shortAddr } from './util.js';
import { audio } from './audio.js';
import { connectWallet as connectEvmWallet, hasInjectedWallet } from './web3.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export class UI {
  constructor(game) {
    this.game = game;
    this.modalOpen = false;
    this.activeScreen = 'menu';
    this.currentStoreCat = 'all';
    this.checkoutPack = null;
    this.toastTimers = [];
    this.hitCounter = 0;
    this.markerEls = {};
    this.minimapStatic = null;
    this.lastMinimap = 0;
    this.walletOnChain = false;
    this.killfeedItems = [];
    this.bind();
    this.refreshProfile();
    this.renderModes();
    this.renderStore();
    this.buildMinimapBase();
    this.bindTouch();
    this.bindSettings();
    this.setupLoadout();
    this.loadDossier();
  }

  // ---------- navigation ----------
  bind() {
    $$('.navbtn, .linkbtn').forEach(btn => btn.addEventListener('click', () => {
      audio.resume(); audio.ui();
      const s = btn.dataset.screen;
      if (s === 'play') this.showMenu();
      else this.showOverlay(s);
    }));
    $$('[data-back]').forEach(btn => btn.addEventListener('click', () => {
      audio.ui();
      this.showMenu();
    }));
    $('#btn-deploy').addEventListener('click', () => { audio.resume(); this.game.startMatch(); });
    $('#btn-settings').addEventListener('click', () => this.openSettings());
    $('#btn-audio').addEventListener('click', () => {
      const muted = audio.toggleMute();
      this.toast(muted ? 'AUDIO MUTED' : 'AUDIO ONLINE', muted ? 'warn' : '');
    });
    $('#btn-settings-close').addEventListener('click', () => this.closeSettings());
    $('#set-vol').addEventListener('input', e => {
      const v = +e.target.value;
      $('#lbl-vol').textContent = v;
      economy.setSetting('volume', v);
      economy.profile.settings.volume = v;
      audio.setVolume(v / 100);
    });
    $('#btn-resume').addEventListener('click', () => this.game.resume());
    $('#btn-pause-settings').addEventListener('click', () => this.openSettings());
    $('#btn-abort').addEventListener('click', () => this.game.abortMatch());
    $('#btn-sum-hq').addEventListener('click', () => this.game.returnToHQ());
    $('#btn-requeue').addEventListener('click', () => this.game.startMatch());
    $('#btn-sum-wallet').addEventListener('click', () => { this.game.returnToHQ(); this.showOverlay('wallet'); });
    $('#btn-topup').addEventListener('click', () => this.openCheckout(CREDIT_PACKS.credits_2500));
    $('#btn-bundle').addEventListener('click', () => this.buyItem('bundle_neon'));
    $('#btn-bp').addEventListener('click', () => this.showOverlay('loadout'));
    $('#btn-claim').addEventListener('click', () => this.settleRewards());
    $('#btn-connect').addEventListener('click', () => this.connectWallet());
    $('#btn-copy').addEventListener('click', () => this.copyWallet());
    $('#btn-checkout-close').addEventListener('click', () => this.closeCheckout());
    $('#btn-pay').addEventListener('click', () => this.processPayment());
    $('#btn-dossier-top').addEventListener('click', () => { $('#dossier-doc').scrollTop = 0; });
    $$('.store-tabs .tab').forEach(t => t.addEventListener('click', () => {
      $$('.store-tabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      this.currentStoreCat = t.dataset.cat;
      this.renderStore();
      audio.ui();
    }));
    $$('#set-quality button').forEach(b => b.addEventListener('click', () => {
      $$('#set-quality button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      this.game.applyQuality(b.dataset.q);
    }));
    $$('#set-difficulty button').forEach(b => b.addEventListener('click', () => {
      $$('#set-difficulty button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      economy.setSetting('difficulty', b.dataset.d);
    }));
    $$('#set-touch button').forEach(b => b.addEventListener('click', () => {
      $$('#set-touch button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      economy.setSetting('touch', b.dataset.t);
      this.applyTouchSetting();
    }));
    $('#set-bloom').addEventListener('change', e => {
      economy.setSetting('bloom', e.target.checked);
      this.game.applySettings();
    });
    $('#set-shake').addEventListener('change', e => {
      economy.setSetting('shake', e.target.checked);
      this.game.settings.shake = e.target.checked;
    });
    $('#set-invert').addEventListener('change', e => economy.setSetting('invert', e.target.checked));

    $('#set-sens').addEventListener('input', e => {
      $('#lbl-sens').textContent = e.target.value;
      economy.setSetting('sens', +e.target.value);
    });
    $('#set-fov').addEventListener('input', e => {
      $('#lbl-fov').textContent = e.target.value;
      economy.setSetting('fov', +e.target.value);
      this.game.applyFov();
    });
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('Reset all local progress, credits and the demo wallet? This cannot be undone.')) {
        economy.reset();
        location.reload();
      }
    });
    // checkout input formatting
    $('#cc-number').addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    $('#cc-exp').addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      e.target.value = v;
    });
    $('#cc-cvc').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
    document.addEventListener('keydown', e => {
      if (e.code === 'Escape') {
        if (!$('#checkout').classList.contains('hidden')) this.closeCheckout();
        else if (!$('#settings').classList.contains('hidden')) this.closeSettings();
      }
    });
  }

  showMenu() {
    this.setActiveScreen('menu');
    this.modalOpen = false;
    this.game.showMenu();
    this.refreshProfile();
    this.renderLoadout();
  }

  showOverlay(name) {
    this.setActiveScreen(name);
    this.modalOpen = true;
    if (this.game.inMatch) this.game.pause(true);
    if (name === 'store') { this.renderStore(); this.refreshProfile(); }
    if (name === 'wallet') { this.renderWallet(); this.refreshProfile(); }
    if (name === 'loadout') { this.renderLoadout(); this.refreshProfile(); }
    if (name === 'dossier') { this.loadDossier(); }
  }

  setActiveScreen(name) {
    this.activeScreen = name;
    $('#menu').classList.toggle('hidden', name !== 'menu');
    for (const s of ['loadout', 'store', 'wallet', 'dossier']) {
      $('#' + s).classList.toggle('hidden', s !== name);
    }
    if (name !== 'game') {
      $('#hud').classList.add('hidden');
    }
    $$('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.screen === (name === 'menu' ? 'play' : name)));
  }

  // ---------- profile ----------
  refreshProfile() {
    const p = economy.profile;
    const lvl = economy.level;
    for (const el of $$('[data-credits]')) el.textContent = fmt(p.credits);
    for (const el of $$('[data-srn]')) el.textContent = fmt(p.srn + p.pending, 2);
    $('#menu-level').textContent = lvl;
    $('#menu-callsign').textContent = p.callsign;
    $('#menu-credits').textContent = fmt(p.credits);
    $('#menu-srn').textContent = fmt(p.srn, 2);
    $('#stat-matches').textContent = p.matches;
    $('#stat-kills').textContent = p.kills;
    $('#stat-wins').textContent = p.wins;
    $('#stat-wr').textContent = p.matches ? Math.round((p.wins / p.matches) * 100) + '%' : '0%';
    const tier = p.pass.tier;
    $('#bp-badge').textContent = 'TIER ' + tier;
    $('#bp-bar').style.width = Math.min(100, ((p.pass.xp - (tier - 1) * BP_XP_PER_TIER) / BP_XP_PER_TIER) * 100) + '%';
    $('#bp-xp').textContent = `${Math.max(0, p.pass.xp - (tier - 1) * BP_XP_PER_TIER)} / ${BP_XP_PER_TIER} XP`;
    $('#bp-premium-state').textContent = p.pass.premium ? 'PREMIUM TRACK ACTIVE' : 'STANDARD TRACK';
    $('#bp-premium-state').style.color = p.pass.premium ? 'var(--cyan)' : 'var(--dim2)';
    $('#hud-srn').textContent = fmt(this.matchSrn || 0, 2);
  }

  renderModes() {
    const list = $('#mode-list');
    const p = economy.profile;
    const selected = this.selectedMode || 'tdm';
    this.selectedMode = selected;
    list.innerHTML = Object.values(MODES).map(m => `
      <button class="mode-card ${m.id === selected ? 'active' : ''}" data-mode="${m.id}">
        <span class="mc-icon">${m.icon}</span>
        <span class="mc-body"><b>${m.name}</b><small>${m.desc}</small></span>
        <span class="mc-check">▶</span>
      </button>`).join('');
    $$('.mode-card', list).forEach(btn => btn.addEventListener('click', () => {
      this.selectedMode = btn.dataset.mode;
      audio.ui();
      this.renderModes();
    }));
    void p;
  }

  // ---------- loadout ----------
  setupLoadout() {
    $('#wbundle')?.addEventListener('click', () => this.buyItem('bundle_neon'));
  }

  renderLoadout() {
    const p = economy.profile;
    const tabs = $('#weapon-tabs');
    tabs.innerHTML = PRIMARY_IDS.map(id => {
      const w = WEAPONS[id];
      return `<button class="wtab ${p.primary === id ? 'active' : ''}" data-weapon="${id}">${w.name.split(' ')[0]}<span style="opacity:.45"> ${w.name.split(' ').slice(1).join(' ')}</span></button>`;
    }).join('');
    $$('.wtab', tabs).forEach(b => b.addEventListener('click', () => {
      economy.setPrimary(b.dataset.weapon);
      this.renderLoadout();
      audio.ui();
    }));

    const w = WEAPONS[p.primary];
    const specs = $('#weapon-specs');
    const bars = [
      ['DAMAGE', clamp(w.damage / 1.1, 10, 100)],
      ['FIRE RATE', clamp(w.rpm / 10, 10, 100)],
      ['ACCURACY', clamp((1 - w.spread * 32) * 100, 12, 99)],
      ['RANGE', clamp(w.range, 10, 100)],
      ['CONTROL', clamp(100 - w.recoil * 30, 10, 99)]
    ];
    specs.innerHTML = bars.map(([label, v]) => `
      <div class="ws"><span>${label}</span><i style="--v:${v.toFixed(0)}%"></i><b>${Math.round(v)}</b></div>`).join('') +
      `<div class="ws"><span>MAG</span><i style="--v:100%"></i><b>${w.mag}</b></div>`;

    this.drawWeaponPreview($('#weapon-canvas'), p.primary, p.equipped.camo);

    const skinRow = $('#skin-row');
    skinRow.innerHTML = Object.values(SKINS).map(s => {
      const owned = economy.ownCamo(s.id);
      return `<button class="skin-card ${p.equipped.camo === s.id ? 'active' : ''} ${owned ? '' : 'locked'}" data-camo="${s.id}">
        <div class="skin-swatch" style="--sw:${s.swatch}"></div>
        <b>${s.name}</b>
        <small>${s.rarity.toUpperCase()}</small>
        ${owned ? '' : `<span class="lock-tag">◈ ${s.price}</span>`}
      </button>`;
    }).join('');
    $$('.skin-card', skinRow).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.camo;
      if (economy.ownCamo(id)) {
        economy.equipCamo(id);
        if (this.game.player) this.game.player.applyLoadout();
        this.renderLoadout();
        audio.ui();
      } else {
        this.toast('CAMO LOCKED — VISIT THE ARMORY', 'warn');
        this.showOverlay('store');
      }
    }));

    const opSkins = $('#operator-skins');
    opSkins.innerHTML = Object.values(OPERATORS).map(o => {
      const owned = economy.ownOperator(o.id);
      return `<button class="skin-card vertical ${p.equipped.operator === o.id ? 'active' : ''} ${owned ? '' : 'locked'}" data-op="${o.id}">
        <div class="skin-swatch" style="--sw:linear-gradient(135deg, #${o.suit.toString(16).padStart(6, '0')}, #${o.accent.toString(16).padStart(6, '0')})"></div>
        <div style="min-width:0"><b>${o.name}</b><small>${owned ? o.rarity.toUpperCase() : '◈ ' + (o.price || 'PASS')}</small></div>
      </button>`;
    }).join('');
    $$('.skin-card', opSkins).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.op;
      if (economy.ownOperator(id)) {
        economy.equipOperator(id);
        if (this.game.player) this.game.player.applyLoadout();
        this.renderLoadout();
        audio.ui();
      } else {
        this.toast('OPERATOR LOCKED — VISIT THE ARMORY', 'warn');
        this.showOverlay('store');
      }
    }));

    const op = economy.operator(p.equipped.operator);
    $('#operator-name').textContent = op.name;
    $('#operator-role').textContent = op.role;
    $('#operator-stats').innerHTML = Object.entries(op.stats).map(([k, v]) => `
      <div class="os"><span>${k.toUpperCase()}</span><i style="--v:${v}%"></i></div>`).join('');
    this.drawOperator($('#operator-canvas'), op);
  }

  drawWeaponPreview(canvas, weaponId, camoId) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const skin = SKINS[camoId] || SKINS.camo_standard;
    const c = skin.colors;
    const body = '#' + c.body.toString(16).padStart(6, '0');
    const accent = '#' + c.accent.toString(16).padStart(6, '0');
    const w = WEAPONS[weaponId];

    // backdrop
    ctx.strokeStyle = 'rgba(92,232,212,.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const glow = ctx.createRadialGradient(W * 0.52, H * 0.58, 10, W * 0.52, H * 0.58, W * 0.5);
    glow.addColorStop(0, accent + '22'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W * 0.5, H * 0.52);
    const scale = weaponId === 'sniper' ? 1.75 : weaponId === 'smg' ? 2.1 : 1.85;
    ctx.scale(scale, scale);
    const len = w.model.len;
    const grad = ctx.createLinearGradient(0, -18, 0, 22);
    grad.addColorStop(0, body); grad.addColorStop(0.5, shade(body, 1.35)); grad.addColorStop(1, shade(body, 0.65));
    ctx.shadowColor = accent; ctx.shadowBlur = 18;
    // receiver
    ctx.fillStyle = grad;
    roundRect(ctx, -95, -12, 140, 26, 3); ctx.fill();
    // rail
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#151a1d';
    ctx.fillRect(-70, -18, 110, 7);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#252c30' : '#1a2023'; ctx.fillRect(-66 + i * 11, -18, 7, 6); }
    // handguard
    ctx.fillStyle = shade(body, 0.85);
    roundRect(ctx, 45, -9, 62, 19, 2); ctx.fill();
    // barrel
    ctx.fillStyle = '#121618';
    ctx.fillRect(105, -3, 40 * (w.model.barrel / 0.7), 6);
    // muzzle
    ctx.fillStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = 14;
    ctx.fillRect(103 + 40 * (w.model.barrel / 0.7), -6, 10, 12);
    ctx.shadowBlur = 0;
    // stock
    if (w.model.stock > 0.1) {
      ctx.fillStyle = body;
      roundRect(ctx, -128, -8, 36, 18, 3); ctx.fill();
      ctx.fillStyle = '#14181b';
      ctx.fillRect(-136, -12, 10, 27);
    }
    // grip
    ctx.fillStyle = '#111517';
    ctx.save(); ctx.translate(-42, 10); ctx.rotate(0.28); ctx.fillRect(-6, 0, 13, 30); ctx.restore();
    // mag
    ctx.fillStyle = shade(body, 0.6);
    ctx.save(); ctx.translate(-20, 13); ctx.rotate(0.13);
    ctx.fillRect(-8, 0, 17, 30 * (w.model.mag / 0.3)); ctx.restore();
    // optic
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-30, -22, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = accent + '33'; ctx.beginPath(); ctx.arc(-30, -22, 8, 0, Math.PI * 2); ctx.fill();
    // accent stripes
    ctx.fillStyle = accent;
    ctx.fillRect(-88, 2, 30, 2);
    ctx.fillRect(52, 5, 22, 2);
    ctx.restore();

    ctx.fillStyle = 'rgba(210,240,238,.55)';
    ctx.font = '600 13px "Barlow Condensed", sans-serif';
    ctx.fillText(w.name, 22, H - 24);
    ctx.fillStyle = 'rgba(120,150,155,.7)';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillText(w.type + ' · ' + skin.name + ' FINISH', 22, H - 10);
    ctx.strokeStyle = 'rgba(92,232,212,.2)';
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  }

  drawOperator(canvas, op) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const accent = '#' + op.accent.toString(16).padStart(6, '0');
    const suit = '#' + op.suit.toString(16).padStart(6, '0');
    // grid
    ctx.strokeStyle = 'rgba(92,232,212,.07)';
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const radial = ctx.createRadialGradient(W / 2, H * 0.4, 20, W / 2, H * 0.5, W * 0.6);
    radial.addColorStop(0, accent + '33'); radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, baseY = H * 0.93;
    ctx.save();
    // body
    ctx.shadowColor = accent; ctx.shadowBlur = 30;
    const bodyGrad = ctx.createLinearGradient(cx - 100, H * 0.3, cx + 100, H);
    bodyGrad.addColorStop(0, shade(suit, 1.6)); bodyGrad.addColorStop(0.5, suit); bodyGrad.addColorStop(1, '#080c0e');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 92, baseY);
    ctx.lineTo(cx - 78, H * 0.56);
    ctx.quadraticCurveTo(cx - 72, H * 0.47, cx - 38, H * 0.44);
    ctx.lineTo(cx - 30, H * 0.31);
    ctx.quadraticCurveTo(cx, H * 0.24, cx + 30, H * 0.31);
    ctx.lineTo(cx + 38, H * 0.44);
    ctx.quadraticCurveTo(cx + 72, H * 0.47, cx + 78, H * 0.56);
    ctx.lineTo(cx + 92, baseY);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // armor plates
    ctx.fillStyle = shade(suit, 1.7);
    ctx.beginPath();
    ctx.moveTo(cx - 62, H * 0.5); ctx.lineTo(cx + 62, H * 0.5);
    ctx.lineTo(cx + 52, H * 0.72); ctx.lineTo(cx - 52, H * 0.72); ctx.closePath(); ctx.fill();
    // center accent
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(cx - 5, H * 0.53, 10, H * 0.16);
    ctx.globalAlpha = 1;
    // shoulder lights
    for (const s of [-1, 1]) {
      ctx.fillStyle = accent;
      ctx.shadowColor = accent; ctx.shadowBlur = 18;
      ctx.fillRect(cx + s * 55 - 12, H * 0.47, 24, 4);
      ctx.shadowBlur = 0;
    }
    // neck
    ctx.fillStyle = '#0d1214';
    ctx.fillRect(cx - 16, H * 0.3, 32, 20);
    // head
    const headGrad = ctx.createLinearGradient(cx, H * 0.12, cx, H * 0.34);
    headGrad.addColorStop(0, shade(suit, 2.5)); headGrad.addColorStop(1, '#0a0e10');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(cx, H * 0.22, 36, 44, 0, 0, Math.PI * 2); ctx.fill();
    // helmet
    ctx.fillStyle = shade(suit, 1.9);
    ctx.beginPath();
    ctx.ellipse(cx, H * 0.195, 40, 30, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 40, H * 0.19, 80, 10);
    // visor
    ctx.fillStyle = accent;
    ctx.shadowColor = accent; ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(cx - 27, H * 0.225);
    ctx.lineTo(cx + 27, H * 0.225);
    ctx.lineTo(cx + 20, H * 0.255);
    ctx.lineTo(cx - 20, H * 0.255);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // side antenna
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + 32, H * 0.19); ctx.lineTo(cx + 44, H * 0.1); ctx.stroke();
    // highlight
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.ellipse(cx - 24, H * 0.17, 18, 26, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // tags
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillRect(14, 14, 132, 22);
    ctx.fillStyle = accent;
    ctx.font = '600 11px "Barlow Condensed", sans-serif';
    ctx.fillText('OPERATOR // ' + op.name, 20, 29);
    ctx.fillStyle = 'rgba(200,230,228,.5)';
    ctx.font = '500 9px Inter, sans-serif';
    ctx.fillText(op.rarity.toUpperCase(), 20, H - 20);
  }

  // ---------- store ----------
  renderStore() {
    const grid = $('#store-grid');
    if (!grid) return;
    let items = STORE_ITEMS;
    if (this.currentStoreCat !== 'all') items = items.filter(i => i.cat === this.currentStoreCat);
    grid.innerHTML = items.map(item => {
      const owned = economy.ownsItem(item);
      const equippedCamo = item.grants?.camos?.length === 1 && economy.profile.equipped.camo === item.grants.camos[0];
      const equippedOp = item.grants?.operator && economy.profile.equipped.operator === item.grants.operator;
      let action = 'BUY';
      if (owned) action = equippedCamo || equippedOp ? 'EQUIPPED' : 'OWNED';
      if (item.recurring && economy.profile.subscription.active) action = 'ACTIVE';
      if (item.grants?.pass && economy.profile.pass.premium) action = 'ACTIVE';
      const isSub = item.cat === 'sub';
      const price = economy.priceFor(item);
      return `<div class="store-card">
        <div class="sc-art" style="--art:${item.art}"><span class="sc-badge ${item.rarity}">${item.rarity.toUpperCase()}</span><span class="sc-glyph">${item.glyph}</span></div>
        <div class="sc-body">
          <b>${item.name}</b>
          <small>${item.desc}</small>
          <div class="sc-foot">
            <span class="sc-price ${isSub ? 'srn' : ''}">${isSub || item.priceUsd ? fmtUsd(item.priceUsd || item.price / 100) : '◈ ' + fmt(price)}</span>
            <button class="sc-buy ${owned ? 'owned' : ''} ${equippedCamo || equippedOp ? 'equip' : ''}" data-item="${item.id}" ${owned ? 'disabled' : ''}>${action}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    $$('.sc-buy', grid).forEach(btn => btn.addEventListener('click', () => {
      const item = STORE_ITEMS.find(i => i.id === btn.dataset.item);
      if (!item) return;
      if (item.recurring) return this.openCheckout(CREDIT_PACKS.sub_plus);
      if (item.priceUsd) return this.openCheckout(item.id === 'sub_plus' ? CREDIT_PACKS.sub_plus : { ...CREDIT_PACKS.credits_2500 });
      const res = economy.purchaseItem(item);
      if (!res.ok) {
        if (res.reason === 'FUNDS') { audio.error(); this.toast('INSUFFICIENT CREDITS — TOP UP REQUIRED', 'err'); this.openCheckout(CREDIT_PACKS.credits_2500); }
        else this.toast('ITEM ALREADY OWNED', 'warn');
        return;
      }
      audio.capture();
      this.toast('ACQUIRED: ' + item.name, '');
      this.renderStore();
      this.refreshProfile();
      this.renderLoadout();
    }));
  }

  openCheckout(pack) {
    this.checkoutPack = pack;
    this.modalOpen = true;
    $('#checkout').classList.remove('hidden');
    $('#cs-name').textContent = pack.name;
    $('#cs-desc').textContent = pack.desc;
    $('#cs-price').textContent = fmtUsd(pack.usd);
    $('#pay-total').textContent = fmtUsd(pack.usd);
    $('#cs-icon').textContent = pack.icon || '◈';
    $('#btn-pay').disabled = false;
    $('#btn-pay').firstChild.textContent = 'PAY ';
    // pack switcher
    let switcher = $('.pack-switch', $('#checkout'));
    if (!switcher) {
      switcher = document.createElement('div');
      switcher.className = 'pack-switch';
      switcher.style.cssText = 'display:flex;gap:4px;margin-top:10px';
      $('#checkout').querySelector('.checkout-summary').after(switcher);
    }
    switcher.innerHTML = Object.values(CREDIT_PACKS).map(p => `<button style="flex:1;font-size:8px;padding:6px 2px;border:1px solid ${p.id === pack.id ? '#635bff' : '#d8e0e8'};border-radius:4px;color:${p.id === pack.id ? '#635bff' : '#68737e'};font-weight:600;background:#fff" data-pack="${p.id}">${p.recurring ? 'SENTINEL+' : fmt(p.credits) + ' ◈'}<br><span style="font-weight:500">${fmtUsd(p.usd)}</span></button>`).join('');
    $$('.pack-switch button').forEach(b => b.addEventListener('click', () => this.openCheckout(CREDIT_PACKS[b.dataset.pack])));
  }

  closeCheckout() {
    $('#checkout').classList.add('hidden');
    this.modalOpen = this.game.inMatch && this.activeScreen === 'menu';
    this.checkoutPack = null;
  }

  async processPayment() {
    const pack = this.checkoutPack;
    if (!pack) return;
    const btn = $('#btn-pay');
    const number = $('#cc-number').value.replace(/\s/g, '');
    if (number.length < 15) { audio.error(); this.toast('ENTER A VALID CARD NUMBER', 'err'); return; }
    btn.disabled = true;
    btn.textContent = 'PROCESSING…';
    await new Promise(r => setTimeout(r, 1400));
    const res = economy.checkoutStripe(pack);
    btn.textContent = 'PAYMENT APPROVED ✓';
    audio.capture();
    await new Promise(r => setTimeout(r, 500));
    this.closeCheckout();
    btn.textContent = 'PAY ' + fmtUsd(pack.usd);
    btn.disabled = false;
    this.toast(`${res.subscription ? 'SENTINEL+ ACTIVE' : 'CREDITS ADDED'} · +${fmt(res.credits)} ◈`, '');
    this.refreshProfile();
    this.renderStore();
    this.renderLoadout();
  }

  buyItem(id) {
    const item = STORE_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (item.recurring) return this.openCheckout(CREDIT_PACKS.sub_plus);
    const res = economy.purchaseItem(item);
    if (!res.ok) {
      if (res.reason === 'FUNDS') { this.toast('INSUFFICIENT CREDITS', 'err'); this.openCheckout(CREDIT_PACKS.credits_2500); }
      else this.toast('ALREADY OWNED', 'warn');
      return;
    }
    audio.capture();
    this.toast('ACQUIRED: ' + item.name, '');
    this.refreshProfile();
    this.renderStore();
    this.renderLoadout();
  }

  // ---------- wallet ----------
  renderWallet() {
    const p = economy.profile;
    $('#wallet-srn').textContent = fmt(p.srn, 2);
    $('#wallet-usd').textContent = fmt(economy.srnUsd(), 2);
    $('#wallet-pending').textContent = fmt(p.pending, 2);
    $('#wallet-season').textContent = fmt(p.seasonEarned, 2);
    $('#wallet-addr').textContent = shortAddr(p.wallet);
    const chainEl = $('#wallet-chain');
    if (chainEl) {
      chainEl.textContent = this.walletOnChain
        ? 'CONNECTED · POLYGON POS · READ-ONLY SESSION'
        : hasInjectedWallet()
          ? 'DEMO WALLET · EVM WALLET AVAILABLE'
          : 'DEMO WALLET · LOCAL SIGNER';
    }
    $('#contract-address').textContent = '0x4F2a7bD3e91C0a8F2cE4b6D1a0C3e5F7B8d9D91b';
    const tx = $('#tx-list');
    if (!p.txs.length) {
      tx.innerHTML = `<div class="tx-row" style="justify-content:center;color:var(--dim2);font-size:9px;letter-spacing:.15em;padding:20px">NO ON-CHAIN ACTIVITY YET</div>`;
    } else {
      tx.innerHTML = p.txs.slice(0, 12).map(t => {
        const isCredit = t.symbol === 'CR';
        const isUsd = t.symbol === 'USD';
        const amt = isUsd ? fmtUsd(Math.abs(t.amount)) : fmt(t.amount, 2) + ' $' + t.symbol;
        const positive = t.amount >= 0;
        return `<div class="tx-row">
          <span class="tx-icon">${t.type === 'settle' ? '⛓' : t.type === 'purchase' ? '◈' : '★'}</span>
          <div class="tx-main"><b>${t.label}</b><small>${t.hash} · ${new Date(t.date).toLocaleDateString()} · ${t.status}</small></div>
          <span class="tx-amt ${positive ? '' : 'out'}">${positive ? '+' : ''}${amt}</span>
        </div>`;
      }).join('');
    }
    const claim = $('#btn-claim');
    claim.disabled = p.pending <= 0;
    claim.style.opacity = p.pending > 0 ? 1 : 0.5;
  }

  async settleRewards() {
    const btn = $('#btn-claim');
    btn.disabled = true;
    btn.textContent = 'SIGNING TX…';
    const res = await economy.settle();
    btn.textContent = 'SETTLE PENDING REWARDS';
    if (!res.ok) { this.toast('NO PENDING REWARDS', 'warn'); this.renderWallet(); return; }
    audio.capture();
    this.toast(`SETTLED ${fmt(res.tx.amount, 2)} $SRN ON POLYGON`, '');
    this.renderWallet();
    this.refreshProfile();
  }

  copyWallet() {
    navigator.clipboard?.writeText(economy.profile.wallet).then(() => this.toast('WALLET ADDRESS COPIED', '')).catch(() => this.toast('CLIPBOARD UNAVAILABLE', 'warn'));
  }

  async connectWallet() {
    const btn = $('#btn-connect');
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'CONNECTING…';
    try {
      const { address, chainId } = await connectEvmWallet();
      economy.profile.wallet = address;
      economy.save();
      this.walletOnChain = true;
      this.toast(`WALLET LINKED ON POLYGON · CHAIN ${chainId}`, '');
      audio.capture();
      this.renderWallet();
      this.refreshProfile();
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      this.toast(msg.length > 90 ? msg.slice(0, 90) + '…' : msg.toUpperCase(), 'err');
      audio.error();
    } finally {
      btn.textContent = original;
      btn.disabled = false;
    }
  }

  // ---------- HUD ----------
  setupHud(mode) {
    $('#hud-mode').textContent = mode.name;
    $('#hud-timer').textContent = this.fmtTime(mode.time);
    const pips = $('#hud-objectives');
    if (mode.id === 'dom') {
      pips.innerHTML = CONTROL_POINTS.map(p => `<span class="opip" data-pt="${p.id}"></span>`).join('');
    } else pips.innerHTML = '';
    this.updateHealth();
    this.updateAmmo();
    this.updateEquipment();
    $('#hud-srn').textContent = fmt(this.matchSrn || 0, 2);
    $('#killfeed').innerHTML = '';
    this.killfeedItems = [];
    $('.hud-top').style.display = '';
    $('#score-blue').textContent = '0';
    $('#score-red').textContent = '0';
    $('#hud').classList.remove('hidden');
    this.game.inMatch = true;
    document.body.classList.add('in-match');
    this.setActiveScreen('game');
  }

  clearHud() {
    $('#killfeed').innerHTML = '';
    this.killfeedItems = [];
    $('#hud').classList.add('hidden');
    $('#scope-overlay').classList.remove('on');
  }

  fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }

  updateScore(blue, red) {
    $('#score-blue').textContent = blue;
    $('#score-red').textContent = red;
  }

  updateTimer(sec, urgent) {
    $('#hud-timer').textContent = this.fmtTime(sec);
    $('.match-clock').classList.toggle('urgent', !!urgent);
  }

  updateHealth() {
    const p = this.game.player;
    if (!p) return;
    const hp = Math.max(0, Math.round(p.health));
    $('#hud-health').textContent = hp;
    const pct = clamp((hp / p.maxHealth) * 100, 0, 100);
    $('#health-bar').style.width = pct + '%';
    $('#health-bar').style.background = hp < 35 ? 'linear-gradient(90deg,#b3281d,#ff5f52)' : 'linear-gradient(90deg,#2fbdae,#5ce8d4)';
    $('#lowhp').style.opacity = hp < 35 ? 1 : 0;
    $('#hud-health').style.color = hp < 35 ? 'var(--red)' : 'var(--cyan)';
    $('#stamina-bar').style.width = clamp(p.stamina, 0, 100) + '%';
  }

  updateAmmo() {
    const p = this.game.player;
    if (!p) return;
    const key = p.weaponIndex === 0 ? p.primaryId : 'pistol';
    const st = p.ammo[key];
    if (!st) return;
    $('#hud-weapon').textContent = p.weapon.name;
    $('#hud-ammo').textContent = st.mag;
    $('#hud-reserve').textContent = '/ ' + st.reserve;
    $('.ammo-row').classList.toggle('low', st.mag <= Math.ceil(WEAPONS[key].mag * 0.25));
    $('#reload-hint').classList.toggle('show', p.reloading);
  }

  updateEquipment() {
    const p = this.game.player;
    if (!p) return;
    const el = $('#equipment');
    if (el) el.innerHTML = `<div class="equip lethal"><span>G</span><b>FRAG</b><i>${p.grenades}</i></div><div class="equip"><span>V</span><b>MELEE</b><i>∞</i></div>`;
  }

  showReload(on) { $('#reload-hint').classList.toggle('show', on); }
  showWeaponName(name) { $('#hud-weapon').textContent = name; }
  setAds(on) { $('#crosshair').classList.toggle('ads', on); }
  setScope(on) { on = !!on; $('#scope-overlay').classList.toggle('on', on); $('#crosshair').classList.toggle('hidden', on); }

  addBloom(amount) {
    const c = $('#crosshair');
    const s = 7 + amount * 10 + (this.game.player?.bloom || 0) * 18;
    c.style.setProperty('--s', s.toFixed(1) + 'px');
  }

  hitmarker(head, melee) {
    const el = $('#hitmarker');
    el.classList.remove('kill', 'head');
    if (head) el.classList.add('head');
    this.hitCounter++;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'none';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 110);
    const txt = $('#hit-text');
    if (head) { txt.textContent = 'HEADSHOT'; txt.style.opacity = '1'; setTimeout(() => txt.style.opacity = '0', 700); }
    if (melee) { txt.textContent = 'MELEE'; txt.style.opacity = '1'; setTimeout(() => txt.style.opacity = '0', 500); }
  }

  killConfirm(head) {
    const el = $('#hitmarker');
    el.classList.add('kill');
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; el.classList.remove('kill'); }, 180);
    const txt = $('#hit-text');
    txt.textContent = head ? 'HEADSHOT KILL' : 'ELIMINATED';
    txt.style.opacity = '1';
    setTimeout(() => { txt.style.opacity = '0'; }, 900);
    $('#hit-text').style.color = head ? 'var(--amber)' : 'var(--red)';
  }

  damageFlash() {
    const el = $('#dmg-flash');
    el.style.transition = 'none';
    el.style.opacity = '0.85';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .55s ease';
      el.style.opacity = '0';
    });
  }

  damageDirection(fromPos, playerPos, playerYaw) {
    if (!fromPos) return;
    const ang = Math.atan2(fromPos.x - playerPos.x, fromPos.z - playerPos.z);
    const rel = ang - (playerYaw + Math.PI);
    const deg = -rel * 180 / Math.PI;
    const el = document.createElement('div');
    el.className = 'dmg-arc';
    el.style.setProperty('--a', deg + 'deg');
    $('#damage-dirs').appendChild(el);
    setTimeout(() => el.remove(), 1150);
  }

  addKillFeed(killer, victim, weapon, headshot, meHighlight) {
    const el = document.createElement('div');
    el.className = 'kf-row' + (meHighlight ? ' me' : '');
    const kTeam = killer.team === 'blue' ? 'blue' : 'red';
    const vTeam = victim.team === 'blue' ? 'blue' : 'red';
    el.innerHTML = `<span class="kf-name ${kTeam}">${esc(killer.name)}</span><span class="kf-weap">${headshot ? '<span class="kf-hs">◉</span> ' : ''}${esc(weapon)}</span><span class="kf-name ${vTeam}">${esc(victim.name)}</span>`;
    $('#killfeed').prepend(el);
    if ($('#killfeed').children.length > 5) $('#killfeed').lastElementChild.remove();
    setTimeout(() => el.remove(), 6000);
  }

  objectiveBanner(text, ms = 2200) {
    const b = $('#obj-banner');
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(this._objTimer);
    this._objTimer = setTimeout(() => b.classList.remove('show'), ms);
  }

  streakBanner(title, sub) {
    const el = $('#streak-banner');
    el.innerHTML = `<b>${esc(title)}</b><small>${esc(sub)}</small>`;
    el.classList.add('show');
    clearTimeout(this._streakTimer);
    this._streakTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  updateObjectives(points) {
    for (const p of CONTROL_POINTS) {
      const el = $(`.opip[data-pt="${p.id}"]`);
      if (!el) continue;
      el.className = 'opip';
      const st = points[p.id];
      if (st.owner) el.classList.add(st.owner === 'blue' ? 'blue' : 'red');
      if (st.contested) el.classList.add('contested');
    }
  }

  showDeath(killerName, weapon, respawnDelay) {
    $('#death-overlay').classList.remove('hidden');
    $('#death-by').textContent = killerName;
    $('#death-weapon').textContent = weapon;
    this.respawnDelay = respawnDelay;
  }

  updateRespawn(left, total) {
    $('#respawn-sec').textContent = Math.ceil(left);
    $('#respawn-bar').style.width = (left / total) * 100 + '%';
  }

  hideDeath() {
    $('#death-overlay').classList.add('hidden');
    if (this.game.input) this.game.input.fire = false;
  }

  countdown(n, modeName) {
    const el = $('#countdown');
    el.classList.remove('hidden');
    el.classList.remove('go');
    $('#cd-mode').textContent = modeName;
    $('#cd-sub').textContent = 'PREPARE FOR CONTACT';
    $('#cd-num').textContent = n;
    const num = $('#cd-num');
    num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    audio.ui();
    if (n === 'DEPLOY') {
      el.classList.add('go');
      $('#cd-sub').textContent = 'OPERATION LIVE';
      audio.spawn();
      setTimeout(() => el.classList.add('hidden'), 650);
    }
  }

  hideCountdown() { $('#countdown').classList.add('hidden'); }

  // ---------- minimap ----------
  buildMinimapBase() {
    const canvas = document.createElement('canvas');
    canvas.width = 220; canvas.height = 220;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#080f12'; ctx.fillRect(0, 0, 220, 220);
    const s = 2.16, o = 110;
    // grid
    ctx.strokeStyle = 'rgba(92,232,212,.07)'; ctx.lineWidth = 1;
    for (let i = -46; i <= 46; i += 10) {
      ctx.beginPath(); ctx.moveTo(o + i * s, 0); ctx.lineTo(o + i * s, 220); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, o + i * s); ctx.lineTo(220, o + i * s); ctx.stroke();
    }
    // map shapes from colliders
    const world = this.game.world;
    if (world) {
      for (const c of world.colliders) {
        if (c.max.y < 1.2) continue;
        const x = o + c.min.x * s, y = o + c.min.z * s;
        const w = (c.max.x - c.min.x) * s, h = (c.max.z - c.min.z) * s;
        if (w < 1 || h < 1) continue;
        ctx.fillStyle = c.tag === 'vehicle' ? 'rgba(60,80,82,.45)' : c.tag === 'container' ? 'rgba(46,70,71,.55)' : 'rgba(52,74,76,.5)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(120,190,188,.12)';
        ctx.strokeRect(x, y, w, h);
      }
    }
    // perimeter
    ctx.strokeStyle = 'rgba(120,220,215,.3)'; ctx.lineWidth = 2;
    ctx.strokeRect(o - 46 * s, o - 46 * s, 92 * s, 92 * s);
    // spawn arcs
    ctx.fillStyle = 'rgba(92,232,212,.05)';
    ctx.beginPath(); ctx.arc(o, o + 40 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,95,82,.05)';
    ctx.beginPath(); ctx.arc(o, o - 40 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
    this.minimapStatic = canvas;
  }

  drawMinimap() {
    const canvas = $('#minimap');
    if (!canvas || !this.game.world) return;
    const ctx = canvas.getContext('2d');
    const o = 110, s = 2.16;
    ctx.clearRect(0, 0, 220, 220);
    if (this.minimapStatic) ctx.drawImage(this.minimapStatic, 0, 0);
    // capture points
    for (const p of CONTROL_POINTS) {
      const x = o + p.x * s, y = o + p.z * s;
      const st = this.game.points?.[p.id];
      const color = st?.owner === 'blue' ? '#5ce8d4' : st?.owner === 'red' ? '#ff5f52' : '#cfdcdd';
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = st?.owner === 'blue' ? 'rgba(92,232,212,.25)' : st?.owner === 'red' ? 'rgba(255,95,82,.25)' : 'rgba(255,255,255,.12)';
      ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 9px "Barlow Condensed",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.id, x, y + 0.5);
    }
    // allies
    for (const b of this.game.bots?.list || []) {
      if (!b.alive) continue;
      const x = o + b.pos.x * s, y = o + b.pos.z * s;
      if (b.team === 'blue' && !this.game.mode.ffa) {
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fillStyle = '#5ce8d4'; ctx.fill();
      } else {
        const d = Math.hypot(b.pos.x - this.game.player.pos.x, b.pos.z - this.game.player.pos.z);
        const visible = d < 26 || (this.game.matchTime - (b.lastSeenTime || 0) < 1.2);
        if (visible) {
          const pulse = 2.8 + Math.sin(this.game.matchTime * 6 + b.id) * 0.7;
          ctx.beginPath(); ctx.arc(x, y, pulse, 0, Math.PI * 2); ctx.fillStyle = b.team === 'ffa' ? '#ffb454' : '#ff5f52'; ctx.fill();
        }
      }
    }
    // player
    const px = o + this.game.player.pos.x * s, py = o + this.game.player.pos.z * s;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-this.game.player.yaw);
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-5, 5); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#5ce8d4'; ctx.shadowBlur = 8; ctx.fill();
    ctx.restore();
    // sweep
    const t = (this.game.matchTime % 4) / 4;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * Math.PI * 2);
    const grad = ctx.createLinearGradient(0, 0, 44, 0);
    grad.addColorStop(0, 'rgba(92,232,212,.14)'); grad.addColorStop(1, 'rgba(92,232,212,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 50, -0.35, 0.05); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- summary ----------
  showSummary(result) {
    this.game.inMatch = false;
    document.body.classList.remove('in-match');
    this.setActiveScreen('summary');
    $('#summary').classList.remove('hidden');
    $('#hud').classList.add('hidden');
    const win = result.win;
    $('#sum-result').textContent = result.draw ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT';
    $('#sum-result').className = result.draw ? 'draw' : win ? '' : 'defeat';
    $('#sum-mode').textContent = `${result.mode.name} · NEON HARBOR · ${this.fmtTime(result.duration)}`;
    $('#sum-blue').textContent = result.scoreBlue;
    $('#sum-red').textContent = result.scoreRed;
    const stats = [
      ['ELIMINATIONS', result.kills, ''],
      ['DEATHS', result.deaths, ''],
      ['K/D', (result.deaths ? result.kills / result.deaths : result.kills).toFixed(2), ''],
      ['HEADSHOTS', result.headshots, ''],
      ['ACCURACY', result.accuracy + '%', ''],
      ['DAMAGE', Math.round(result.damageDealt), ''],
      ['CAPTURES', result.captures || 0, ''],
      ['OBJECTIVE', result.objectiveScore || 0, '']
    ];
    $('#sum-stats').innerHTML = stats.map(([l, v]) => `<div class="sum-stat"><small>${l}</small><b>${v}</b></div>`).join('');
    const e = result.economy;
    $('#earn-base').textContent = '+' + fmt(e.base, 2) + ' $SRN';
    $('#earn-kills').textContent = '+' + fmt(e.killReward, 2) + ' $SRN';
    $('#earn-win').textContent = (result.win ? '+' : '') + fmt(e.winReward, 2) + ' $SRN';
    $('#earn-obj').textContent = '+' + fmt(e.objReward, 2) + ' $SRN';
    $('#earn-total').textContent = '+' + fmt(e.total, 2) + ' $SRN';
    $('#sum-xp').textContent = '+' + fmt(e.xp) + ' XP';
    $('#sum-xp-bar').style.width = '0%';
    requestAnimationFrame(() => { $('#sum-xp-bar').style.width = Math.min(100, (e.xp / 600) * 100) + '%'; });
    this.matchSrn = e.total;
    if (result.win) audio.victory(); else audio.defeat();
  }

  // ---------- settings ----------
  bindSettings() {
    const s = economy.profile.settings;
    $('#set-sens').value = s.sens; $('#lbl-sens').textContent = s.sens;
    $('#set-fov').value = s.fov; $('#lbl-fov').textContent = s.fov;
    $('#set-vol').value = s.volume; $('#lbl-vol').textContent = s.volume;
    $('#set-bloom').checked = s.bloom !== false;
    $('#set-shake').checked = s.shake !== false;
    $('#set-invert').checked = !!s.invert;
    $$('#set-quality button').forEach(b => b.classList.toggle('active', b.dataset.q === s.quality));
    $$('#set-difficulty button').forEach(b => b.classList.toggle('active', b.dataset.d === s.difficulty));
    $$('#set-touch button').forEach(b => b.classList.toggle('active', b.dataset.t === s.touch));
  }

  openSettings() {
    this.modalOpen = true;
    $('#settings').classList.remove('hidden');
    if (this.game.inMatch && this.game.paused) $('#pause').classList.add('hidden');
  }

  closeSettings() {
    $('#settings').classList.add('hidden');
    if (this.game.inMatch && this.game.paused) $('#pause').classList.remove('hidden');
    else if (!this.game.inMatch) this.modalOpen = false;
  }

  applyTouchSetting() {
    const s = economy.profile.settings;
    const coarse = matchMedia('(pointer:coarse)').matches;
    const enabled = s.touch === 'on' || (s.touch === 'auto' && coarse);
    document.body.classList.toggle('touch', enabled);
    this.game.touchEnabled = enabled;
  }

  // ---------- touch ----------
  bindTouch() {
    const g = this.game;
    const joystick = $('#joystick');
    const knob = $('#stick-knob');
    let joyId = null, lookId = null, lastX = 0, lastY = 0;
    const center = () => {
      const r = joystick.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
    };
    joystick.addEventListener('pointerdown', e => {
      e.preventDefault();
      joyId = e.pointerId;
      joystick.setPointerCapture(e.pointerId);
      updateJoy(e);
    });
    joystick.addEventListener('pointermove', e => { if (e.pointerId === joyId) updateJoy(e); });
    const endJoy = e => {
      if (e.pointerId !== joyId) return;
      joyId = null;
      knob.style.transform = '';
      g.input.forward = g.input.back = g.input.left = g.input.right = false;
    };
    joystick.addEventListener('pointerup', endJoy);
    joystick.addEventListener('pointercancel', endJoy);
    function updateJoy(e) {
      const c = center();
      let dx = e.clientX - c.x, dy = e.clientY - c.y;
      const len = Math.hypot(dx, dy);
      const max = c.r - 12;
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      const nx = dx / max, ny = dy / max;
      g.input.forward = ny < -0.22;
      g.input.back = ny > 0.32;
      g.input.left = nx < -0.24;
      g.input.right = nx > 0.24;
    }

    // look on canvas
    const canvas = $('#scene');
    canvas.addEventListener('touchstart', e => {
      if (!g.inMatch || g.paused) return;
      for (const t of e.changedTouches) {
        if (lookId === null) { lookId = t.identifier; lastX = t.clientX; lastY = t.clientY; }
      }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!g.inMatch || g.paused) return;
      for (const t of e.changedTouches) {
        if (t.identifier === lookId) {
          const dx = t.clientX - lastX, dy = t.clientY - lastY;
          lastX = t.clientX; lastY = t.clientY;
          g.player?.look(dx * 1.3, dy * 1.3, 0.0026);
        }
      }
    }, { passive: true });
    const endLook = e => {
      for (const t of e.changedTouches) if (t.identifier === lookId) lookId = null;
    };
    canvas.addEventListener('touchend', endLook, { passive: true });
    canvas.addEventListener('touchcancel', endLook, { passive: true });

    const hold = (el, on, off) => {
      el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('active'); on(); });
      const end = e => { e.preventDefault(); el.classList.remove('active'); off?.(); };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('pointerleave', end);
    };
    hold($('#btn-fire'), () => { g.input.fire = true; }, () => { g.input.fire = false; g.player && (g.player.wasFiring = false); });
    hold($('#btn-jump'), () => { g.input.jump = true; }, () => {});
    hold($('#btn-crouch'), () => { g.input.crouch = !g.input.crouch; g.player && (g.player.crouching = g.input.crouch); }, () => {});
    hold($('#btn-reload'), () => { g.input.reload = true; }, () => { g.input.reload = false; });
    hold($('#btn-swap'), () => { g.input.swap = true; }, () => {});
    $('#btn-ads').addEventListener('click', e => {
      e.preventDefault();
      g.touch.adsToggle = !g.touch.adsToggle;
      g.input.ads = g.touch.adsToggle;
      $('#btn-ads').classList.toggle('active', g.touch.adsToggle);
    });
    $('#btn-pause-t').addEventListener('click', () => g.pause());
    this.applyTouchSetting();
  }

  // ---------- toasts ----------
  toast(text, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = `<b>${kind === 'err' ? '!' : kind === 'warn' ? '▸' : '✓'}</b><span>${esc(text)}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3200);
  }

  // ---------- dossier ----------
  async loadDossier() {
    const doc = $('#dossier-doc');
    if (this._dossierLoaded) return;
    try {
      const res = await fetch('DESIGN.md', { cache: 'no-store' });
      if (!res.ok) throw new Error('missing');
      const md = await res.text();
      const { html, toc } = this.markdown(md);
      doc.innerHTML = `<div class="doc-banner"><b>SENTINEL PROTOCOL // GAME DESIGN DOCUMENT</b><p>Version 1.0 · Confidential · Prepared for studio leadership and publishing partners. This dossier documents the production plan behind the live build in this repository.</p></div>` + html;
      $('#dossier-toc').innerHTML = toc.map(t => `<a class="${t.level === 3 ? 'sub' : ''}" href="#${t.id}">${esc(t.text)}</a>`).join('');
      $$('#dossier-toc a').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        const target = $(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      this._dossierLoaded = true;
    } catch (e) {
      doc.innerHTML = `<div class="doc-loading">DOSSIER UNAVAILABLE — DESIGN.md NOT FOUND</div>`;
    }
  }

  markdown(md) {
    const lines = md.replace(/\r/g, '').split('\n');
    let html = '';
    const toc = [];
    let i = 0;
    let inCode = false, codeLang = '', codeLines = [];
    let listType = null;
    let para = [];

    const inline = (s) => {
      let out = esc(s);
      out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
      out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return out;
    };
    const flushPara = () => { if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; } };
    const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
    const slug = (s) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        if (!inCode) { inCode = true; codeLang = line.trim().slice(3); codeLines = []; }
        else {
          html += `<pre><code class="lang-${esc(codeLang)}">${esc(codeLines.join('\n'))}</code></pre>`;
          inCode = false;
        }
        i++; continue;
      }
      if (inCode) { codeLines.push(line); i++; continue; }

      if (/^\s*$/.test(line)) { flushPara(); closeList(); i++; continue; }
      if (/^---+\s*$/.test(line)) { flushPara(); closeList(); html += '<hr>'; i++; continue; }

      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flushPara(); closeList();
        const level = h[1].length;
        const text = h[2].trim();
        const id = slug(text) + '-' + toc.length;
        if (level <= 3) toc.push({ level, text: text.replace(/[*`]/g, ''), id });
        html += `<h${level} id="${id}">${inline(text)}</h${level}>`;
        i++; continue;
      }

      // table
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
        flushPara(); closeList();
        const header = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim()));
          i++;
        }
        html += '<table><thead><tr>' + header.map(x => `<th>${inline(x)}</th>`).join('') + '</tr></thead><tbody>';
        html += rows.map(r => '<tr>' + r.map(x => `<td>${inline(x)}</td>`).join('') + '</tr>').join('');
        html += '</tbody></table>';
        continue;
      }

      // blockquote
      if (/^>\s?/.test(line)) {
        flushPara(); closeList();
        const q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
        html += `<blockquote>${inline(q.join(' '))}</blockquote>`;
        continue;
      }

      // ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        flushPara();
        if (listType !== 'ol') { closeList(); html += '<ol>'; listType = 'ol'; }
        html += `<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`;
        i++; continue;
      }
      // bullets
      if (/^\s*[-*]\s+/.test(line)) {
        flushPara();
        if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
        let text = line.replace(/^\s*[-*]\s+/, '');
        text = text.replace(/^\[ \]\s+/, '☐ ');
        html += `<li>${inline(text)}</li>`;
        i++; continue;
      }
      para.push(line.trim());
      i++;
    }
    if (inCode) html += `<pre><code>${esc(codeLines.join('\n'))}</code></pre>`;
    flushPara(); closeList();
    // indent nested bullets crudely
    html = html.replace(/<ul>\s*<li>/g, '<ul><li>');
    return { html, toc };
  }

  setMatchSrn(v) {
    this.matchSrn = v;
    $('#hud-srn').textContent = fmt(v, 2);
  }

  showLoading(text) {
    if (!this.toast) return;
    this.toast(text, 'warn');
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(Math.round(((n >> 16) & 255) * f), 0, 255);
  const g = clamp(Math.round(((n >> 8) & 255) * f), 0, 255);
  const b = clamp(Math.round((n & 255) * f), 0, 255);
  return `rgb(${r},${g},${b})`;
}
