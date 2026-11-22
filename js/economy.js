// ============ ECONOMY: PROFILE, STORE, REWARDS, SETTLEMENT ============
import { SKINS, OPERATORS, STORE_ITEMS, BATTLE_PASS, BP_XP_PER_TIER, SRN_USD, REWARDS } from './config.js';
import { randomHex } from './util.js';

const KEY = 'sentinel_profile_v2';

function defaultProfile() {
  return {
    version: 2,
    callsign: 'RECRUIT-01',
    createdAt: Date.now(),
    credits: 1200,
    srn: 250,
    pending: 0,
    seasonEarned: 0,
    xp: 0,
    level: 1,
    matches: 0,
    wins: 0,
    kills: 0,
    deaths: 0,
    primary: 'ar',
    ownedCamos: ['camo_standard'],
    ownedOperators: ['op_standard'],
    equipped: { camo: 'camo_standard', operator: 'op_standard' },
    pass: { premium: false, xp: 0, tier: 1, claimed: [] },
    subscription: { active: false, since: 0, plan: '' },
    wallet: '0x' + randomHex(40),
    txs: [],
    settings: { sens: 50, padSens: 55, fov: 80, quality: 'medium', volume: 65, difficulty: 'regular', touch: 'auto', bloom: true, shake: true, invert: false }
  };
}

class Economy {
  constructor() {
    this.profile = this.load();
    if (!this.profile.wallet) this.profile.wallet = '0x' + randomHex(40);
    this.listeners = [];
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultProfile();
      const p = JSON.parse(raw);
      const base = defaultProfile();
      return { ...base, ...p, settings: { ...base.settings, ...(p.settings || {}) }, pass: { ...base.pass, ...(p.pass || {}) }, equipped: { ...base.equipped, ...(p.equipped || {}) } };
    } catch { return defaultProfile(); }
  }

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.profile)); } catch {}
    this.emit();
  }

  onChange(fn) { this.listeners.push(fn); }
  emit() { for (const fn of this.listeners) fn(this.profile); }

  reset() {
    localStorage.removeItem(KEY);
    this.profile = defaultProfile();
    this.save();
  }

  get passTier() { return this.profile.pass.tier; }
  get level() { return 1 + Math.floor(this.profile.xp / 1200); }
  get storeDiscount() { return this.profile.subscription.active ? 0.1 : 1; }

  camoPrice(item) { return Math.round(item.price * this.storeDiscount); }

  priceFor(item) {
    return Math.round(item.price * this.storeDiscount);
  }

  canAfford(credits) { return this.profile.credits >= credits; }

  addCredits(n, label = 'Credit top-up') {
    this.profile.credits += n;
    this.profile.txs.unshift({ type: 'purchase', label, amount: n, symbol: 'CR', hash: 'cs_' + randomHex(24), date: Date.now(), status: 'paid' });
    this.trimTx();
    this.save();
  }

  addPending(n) {
    this.profile.pending = +(this.profile.pending + n).toFixed(2);
    this.profile.seasonEarned = +(this.profile.seasonEarned + n).toFixed(2);
    this.save();
  }

  async settle() {
    if (this.profile.pending <= 0) return { ok: false, reason: 'NO_PENDING' };
    const amount = +this.profile.pending.toFixed(2);
    await new Promise(r => setTimeout(r, 1500));
    const tx = {
      type: 'settle', label: 'Match rewards settled', amount,
      symbol: 'SRN', hash: '0x' + randomHex(64), date: Date.now(), status: 'confirmed',
      gas: +(0.0018 + Math.random() * 0.0012).toFixed(4)
    };
    this.profile.pending = 0;
    this.profile.srn = +(this.profile.srn + amount).toFixed(2);
    this.profile.txs.unshift(tx);
    this.trimTx();
    this.save();
    return { ok: true, tx };
  }

  trimTx() { if (this.profile.txs.length > 30) this.profile.txs.length = 30; }

  ownCamo(id) { return this.profile.ownedCamos.includes(id); }
  ownOperator(id) { return this.profile.ownedOperators.includes(id); }

  equipCamo(id) {
    if (!this.ownCamo(id)) return false;
    this.profile.equipped.camo = id;
    this.save();
    return true;
  }

  equipOperator(id) {
    if (!this.ownOperator(id)) return false;
    this.profile.equipped.operator = id;
    this.save();
    return true;
  }

  setPrimary(id) {
    this.profile.primary = id;
    this.save();
  }

  grant(grants = {}) {
    const result = { credits: 0, camos: [], operators: [], tiers: 0 };
    if (grants.credits) {
      this.profile.credits += grants.credits;
      result.credits = grants.credits;
    }
    for (const c of grants.camos || []) {
      if (!this.ownCamo(c)) { this.profile.ownedCamos.push(c); result.camos.push(c); }
    }
    for (const o of grants.operators || []) {
      if (!this.ownOperator(o)) { this.profile.ownedOperators.push(o); result.operators.push(o); }
    }
    if (grants.operator && !this.ownOperator(grants.operator)) {
      this.profile.ownedOperators.push(grants.operator);
      result.operators.push(grants.operator);
    }
    if (grants.pass) {
      this.profile.pass.premium = true;
      this.syncPassRewards(result);
    }
    if (grants.bpTiers) {
      this.profile.pass.xp += grants.bpTiers * BP_XP_PER_TIER;
      this.recalcTier();
      this.syncPassRewards(result);
      result.tiers = grants.bpTiers;
    }
    this.save();
    return result;
  }

  purchaseItem(item) {
    if (this.ownsItem(item)) return { ok: false, reason: 'OWNED' };
    const price = this.priceFor(item);
    if (this.profile.credits < price) return { ok: false, reason: 'FUNDS' };
    this.profile.credits -= price;
    const grants = { ...(item.grants || {}) };
    const res = this.grant(grants);
    this.profile.txs.unshift({ type: 'purchase', label: item.name, amount: -price, symbol: 'CR', hash: 'pi_' + randomHex(20), date: Date.now(), status: 'paid' });
    this.trimTx();
    this.save();
    return { ok: true, grants: res, price };
  }

  ownsItem(item) {
    if (!item.grants) return false;
    if (item.grants.pass) return this.profile.pass.premium;
    if (item.grants.operator && this.ownOperator(item.grants.operator)) return true;
    if (item.grants.camos && item.grants.camos.every(c => this.ownCamo(c))) return true;
    return false;
  }

  checkoutStripe(pack) {
    // DEMO ONLY. Production: Stripe Checkout Session + webhook (see DESIGN.md §6).
    if (pack.recurring) {
      this.profile.subscription = { active: true, since: Date.now(), plan: pack.id };
      this.profile.credits += pack.credits;
      this.profile.txs.unshift({ type: 'purchase', label: 'SENTINEL+ subscription', amount: -pack.usd, symbol: 'USD', hash: 'sub_' + randomHex(20), date: Date.now(), status: 'active' });
    } else {
      this.profile.credits += pack.credits;
      this.profile.txs.unshift({ type: 'purchase', label: pack.name, amount: -pack.usd, symbol: 'USD', hash: 'cs_' + randomHex(20), date: Date.now(), status: 'paid' });
    }
    this.trimTx();
    this.save();
    return { ok: true, credits: pack.credits, subscription: !!pack.recurring };
  }

  addXP(amount) {
    this.profile.xp += amount;
    this.profile.level = 1 + Math.floor(this.profile.xp / 1200);
    this.profile.pass.xp += amount;
    const before = this.profile.pass.tier;
    this.recalcTier();
    const res = { credits: 0, camos: [], operators: [], tiers: this.profile.pass.tier - before };
    this.syncPassRewards(res);
    this.save();
    return res;
  }

  recalcTier() {
    this.profile.pass.tier = Math.min(BATTLE_PASS.length, 1 + Math.floor(this.profile.pass.xp / BP_XP_PER_TIER));
  }

  syncPassRewards(out = {}) {
    if (!this.profile.pass.premium) return out;
    for (const tier of BATTLE_PASS) {
      if (tier.tier > this.profile.pass.tier) break;
      if (this.profile.pass.claimed.includes(tier.tier)) continue;
      this.profile.pass.claimed.push(tier.tier);
      if (tier.type === 'credits') { this.profile.credits += tier.amount; out.credits = (out.credits || 0) + tier.amount; }
      else if (tier.type === 'srn') { this.profile.pending = +(this.profile.pending + tier.amount).toFixed(2); out.srn = (out.srn || 0) + tier.amount; }
      else if (tier.type === 'camo') {
        if (!this.ownCamo(tier.id)) { this.profile.ownedCamos.push(tier.id); out.camos = [...(out.camos || []), tier.id]; }
      } else if (tier.type === 'operator') {
        if (!this.ownOperator(tier.id)) { this.profile.ownedOperators.push(tier.id); out.operators = [...(out.operators || []), tier.id]; }
      }
    }
    return out;
  }

  applyMatchResult(result) {
    const p = this.profile;
    p.matches++;
    if (result.win) p.wins++;
    p.kills += result.kills;
    p.deaths += result.deaths;

    const base = REWARDS.base + (result.completed ? REWARDS.perMatchComplete : 0);
    const killReward = result.kills * REWARDS.perKill;
    const winReward = result.win ? REWARDS.win : 0;
    const objReward = (result.captures || 0) * REWARDS.perCapture + Math.round((result.objectiveScore || 0) * REWARDS.perObjectiveTick);
    const total = +(base + killReward + winReward + objReward).toFixed(2);
    p.pending = +(p.pending + total).toFixed(2);
    p.seasonEarned = +(p.seasonEarned + total).toFixed(2);

    const xp = REWARDS.xpBase + result.kills * REWARDS.xpPerKill + (result.captures || 0) * REWARDS.xpPerCapture + (result.win ? REWARDS.xpWin : 0) + Math.round((result.objectiveScore || 0) * 2);
    const xpRes = this.addXP(xp);
    this.save();
    return { base, killReward, winReward, objReward, total, xp, xpRes };
  }

  setSetting(k, v) {
    this.profile.settings[k] = v;
    this.save();
  }

  buyCredits(pack) {
    return this.checkoutStripe(pack);
  }

  srnUsd(srn = this.profile.srn) { return +(srn * SRN_USD).toFixed(2); }
  pendingUsd() { return +(this.profile.pending * SRN_USD).toFixed(2); }
  skin(id) { return SKINS[id] || SKINS.camo_standard; }
  operator(id) { return OPERATORS[id] || OPERATORS.op_standard; }
  storeItems() { return STORE_ITEMS; }
}

export const economy = new Economy();
