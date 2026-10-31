import { QUESTS, QUESTS_BY_ID, LANDMARKS } from '../core/data.js';
import { dist2d } from '../core/noise.js';

const MAIN_ORDER = ['main1', 'main2', 'main3', 'main4', 'main5'];

export class QuestLog {
  constructor(game) {
    this.game = game;
    this.states = new Map();
    this.tracked = null;
    this.reachTimer = 0;
  }

  isActive(id) { const s = this.states.get(id); return !!s && !s.complete; }
  isComplete(id) { return !!this.states.get(id)?.complete; }
  get(id) { return this.states.get(id); }
  def(id) { return QUESTS_BY_ID[id]; }

  canStart(id) {
    const q = QUESTS_BY_ID[id];
    if (!q || this.isActive(id) || this.isComplete(id)) return false;
    if (q.type === 'main') {
      const i = MAIN_ORDER.indexOf(id);
      if (i > 0 && !this.isComplete(MAIN_ORDER[i - 1])) return false;
    }
    return true;
  }

  start(id, silent = false) {
    if (!this.canStart(id)) return false;
    const q = QUESTS_BY_ID[id];
    this.states.set(id, { id, stage: 0, progress: 0, complete: false, started: true, killBase: {} });
    this.game.compassTarget = null;
    if (!this.tracked || q.type === 'main') this.tracked = id;
    if (!silent) {
      this.game.ui.toast(`<b>Quest started:</b> ${q.title}`, 'quest');
      this.game.audio.playQuest();
      this.game.ui.showArea(q.title, q.type === 'main' ? 'Main quest' : 'Side quest');
    }
    this.game.ui.refreshQuests();
    this.game.ui.updateHUD();
    return true;
  }

  currentStage(state) {
    const q = QUESTS_BY_ID[state.id];
    return q?.stages[state.stage];
  }

  event(type, target, amount = 1) {
    let changed = false;
    for (const state of this.states.values()) {
      if (state.complete) continue;
      const stage = this.currentStage(state);
      if (!stage || stage.event !== type || stage.target !== target) continue;
      if (type === 'kill' || type === 'collect') {
        state.progress = Math.min(stage.count || 1, state.progress + amount);
        if (state.progress < (stage.count || 1)) {
          this.game.ui.updateHUD();
          this.game.ui.refreshQuests();
          continue;
        }
      }
      this.advance(state);
      changed = true;
    }
    if (changed) {
      this.game.ui.updateHUD();
      this.game.ui.refreshQuests();
      this.game.save(true);
    }
  }

  advance(state) {
    const q = QUESTS_BY_ID[state.id];
    state.stage++;
    state.progress = 0;
    state.killBase = {};
    this.game.compassTarget = null;
    if (state.stage >= q.stages.length) {
      this.complete(state);
    } else {
      this.game.ui.toast(`<b>${q.title}</b><br>${q.stages[state.stage].text}`, 'quest');
      this.game.audio.playQuest();
    }
  }

  complete(state) {
    const q = QUESTS_BY_ID[state.id];
    state.complete = true;
    state.stage = q.stages.length - 1;
    const r = q.reward || {};
    if (r.xp) this.game.player.addXP(r.xp);
    if (r.gold) this.game.inventory.add('gold', r.gold);
    for (const item of (r.items || [])) this.game.inventory.add(item, 1, true);
    this.game.ui.toast(`<b>Quest complete:</b> ${q.title}<br>+${r.xp || 0} XP · +${r.gold || 0} gold`, 'good');
    this.game.audio.playQuestComplete();
    if (this.tracked === state.id) {
      const next = [...this.states.values()].find(s => !s.complete && QUESTS_BY_ID[s.id].type === 'main');
      this.tracked = next ? next.id : [...this.states.values()].find(s => !s.complete)?.id || null;
    }
    if (state.id === 'main5') this.game.victory();
    this.game.ui.refreshQuests();
  }

  pendingTalk(npcId) {
    for (const state of this.states.values()) {
      if (state.complete) continue;
      const stage = this.currentStage(state);
      if (stage && stage.event === 'talk' && stage.target === npcId) return state;
    }
    return null;
  }

  offersFor(npcId) {
    return QUESTS.filter(q => q.giver === npcId && this.canStart(q.id));
  }

  turnIn(npcId) {
    const state = this.pendingTalk(npcId);
    if (!state) return false;
    this.event('talk', npcId, 1);
    return true;
  }

  update(dt) {
    this.reachTimer -= dt;
    if (this.reachTimer > 0) return;
    this.reachTimer = 0.45;
    const p = this.game.player.position;
    for (const state of this.states.values()) {
      if (state.complete) continue;
      const stage = this.currentStage(state);
      if (!stage || stage.event !== 'reach') continue;
      const l = LANDMARKS[stage.target];
      if (!l) continue;
      if (dist2d(p.x, p.z, l.x, l.z) < (l.radius || 30) * 0.82) this.event('reach', stage.target, 1);
    }
  }

  markerPosition(id) {
    const state = this.states.get(id);
    if (!state || state.complete) return null;
    const stage = this.currentStage(state);
    if (!stage) return null;
    const marker = stage.marker || stage.target;
    const npc = this.game.npcs?.byId?.[marker];
    if (npc) {
      if (npc.mapPos) return { x: npc.mapPos.x, z: npc.mapPos.z, name: npc.name };
      return { x: npc.group.position.x, z: npc.group.position.z, name: npc.name };
    }
    const l = LANDMARKS[marker];
    if (l) return { x: l.x, z: l.z, name: l.name };
    return null;
  }

  trackedInfo() {
    if (!this.tracked) {
      const main = [...this.states.values()].find(s => !s.complete && QUESTS_BY_ID[s.id].type === 'main');
      if (main) this.tracked = main.id;
    }
    const state = this.tracked ? this.states.get(this.tracked) : null;
    if (!state || state.complete) return null;
    const q = QUESTS_BY_ID[state.id];
    const stage = this.currentStage(state);
    if (!stage) return null;
    let text = stage.text;
    if ((stage.count || 1) > 1) text = text.replace(/\(\d+\/\d+\)/, `(${state.progress}/${stage.count})`);
    return { id: state.id, title: q.title, type: q.type, text, stage, marker: this.markerPosition(state.id), progress: state.progress, count: stage.count || 1 };
  }

  save() {
    return { states: [...this.states.entries()], tracked: this.tracked };
  }
  load(data) {
    if (!data) return;
    this.states = new Map(data.states || []);
    this.tracked = data.tracked || null;
  }
}
