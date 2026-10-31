import * as THREE from 'three';
import { ITEMS } from '../core/data.js';

export class Inventory {
  constructor(game) {
    this.game = game;
    this.slots = new Map();
    this.gold = 0;
    this.equipment = { weapon: null, armor: null, trinket: null, bow: null };
  }

  initFromClass(cls) {
    this.slots.clear();
    for (const id of cls.items) this.add(id, 1, true);
    this.gold = 35;
    for (const slot in cls.equip) {
      const id = cls.equip[slot];
      if (id && ITEMS[id]) this.equipment[slot] = id;
    }
  }

  add(id, qty = 1, silent = false) {
    if (id === 'gold') { this.gold += qty; if (!silent) this.game.ui.toast(`+${qty} gold`, 'good'); return; }
    const item = ITEMS[id];
    if (!item) return;
    const cur = this.slots.get(id) || 0;
    this.slots.set(id, cur + qty);
    if (!silent) {
      this.game.ui.toast(`+ ${item.name}${qty > 1 ? ' ×' + qty : ''}`, 'good');
      this.game.audio.playPickup();
    }
    this.game.quests?.event('collect', id, qty);
    this.game.ui?.refreshInventory();
  }

  remove(id, qty = 1) {
    const cur = this.slots.get(id) || 0;
    if (cur < qty) return false;
    if (cur === qty) this.slots.delete(id);
    else this.slots.set(id, cur - qty);
    for (const slot in this.equipment) if (this.equipment[slot] === id && !this.has(id)) this.equipment[slot] = null;
    this.game.ui?.refreshInventory();
    return true;
  }

  has(id, qty = 1) { return (this.slots.get(id) || 0) >= qty; }
  count(id) { return this.slots.get(id) || 0; }

  equip(id) {
    const item = ITEMS[id];
    if (!item) return;
    let slot = null;
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'trinket') slot = 'trinket';
    else if (item.type === 'bow') slot = 'bow';
    if (!slot) return;
    this.equipment[slot] = this.equipment[slot] === id ? null : id;
    this.game.audio.playEquip();
    this.game.player?.refreshGear();
    this.game.ui?.refreshInventory();
    this.game.ui?.toast(this.equipment[slot] ? `Equipped ${item.name}` : `Unequipped ${item.name}`);
  }

  use(id) {
    const item = ITEMS[id];
    if (!item) return false;
    if (item.type === 'potion' || item.type === 'food') {
      const p = this.game.player;
      if (item.heal) p.heal(item.heal);
      if (item.mana) p.restoreMana(item.mana);
      if (item.stamina) p.restoreStamina(item.stamina);
      this.remove(id, 1);
      this.game.audio.playDrink();
      this.game.effects.burst(p.position.clone().add(new THREE.Vector3(0, 1, 0)), item.type === 'potion' ? 0xffd9a0 : 0x9be59b, 12, 2);
      this.game.ui.toast(`Used ${item.name}`, 'good');
      return true;
    }
    return false;
  }

  quickHeal() {
    for (const id of ['healthPotion', 'stew', 'cheese', 'bread', 'fish']) {
      if (this.has(id)) { this.use(id); return true; }
    }
    this.game.ui.toast('No potions or food left. Try not dying.', 'bad');
    return false;
  }

  weight() {
    let w = 0;
    for (const [id, qty] of this.slots) {
      const item = ITEMS[id];
      w += (item?.type === 'armor' ? 4 : item?.type === 'weapon' ? 3 : 0.4) * qty;
    }
    return Math.round(w * 10) / 10;
  }

  statSummary() {
    const eq = this.equipment;
    const w = ITEMS[eq.weapon], a = ITEMS[eq.armor], t = ITEMS[eq.trinket], b = ITEMS[eq.bow];
    return {
      damage: (w?.dmg || 0) + (t?.dmg || 0),
      armor: (a?.armor || 0) + (t?.armor || 0),
      magic: (w?.magic || 0) + (a?.magic || 0) + (t?.magic || 0),
      bow: b?.dmg || 0,
      weaponSpeed: w?.speed || 1,
      weaponName: w?.name || 'Claws',
      bowName: b?.name || 'No bow',
      armorName: a?.name || 'No armor',
      trinketName: t?.name || 'No trinket',
    };
  }

  save() {
    return { slots: [...this.slots.entries()], gold: this.gold, equipment: { ...this.equipment } };
  }
  load(data) {
    if (!data) return;
    this.slots = new Map(data.slots || []);
    this.gold = data.gold || 0;
    this.equipment = { weapon: null, armor: null, trinket: null, bow: null, ...(data.equipment || {}) };
  }
}
