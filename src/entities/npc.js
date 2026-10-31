import * as THREE from 'three';
import { createCat, randomCatLook } from '../entities/cat.js';
import { LANDMARKS, ITEMS } from '../core/data.js';
import { makeRng, dist2d, clamp, angleDelta } from '../core/noise.js';

const AMBIENT_NAMES = ['Biscuit', 'Marmalade', 'Pebble', 'Noodle', 'Thimble', 'Crumb', 'Sorrel', 'Pip', 'Tansy', 'Bramble', 'Moss', 'Clove', 'Rook', 'Dumpling', 'Wick', 'Fig', 'Cinder', 'Barley', 'Nutmeg', 'Sable', 'Custard', 'Rye', 'Mothball', 'Plum'];
const AMBIENT_LINES = [
  'Mrrp.', 'I was not sleeping. I was inspecting my eyelids.', 'The fish was already dead when I ate it.',
  'Have you seen my other boot? It is also a cat.', 'I could catch that bird. I am choosing not to.',
  'The snow is falling. I have notes.', 'Do not tell the guards about the thing in the well.',
  'Nine lives, and I have spent six of them on this conversation.', 'I am not lost. I am exploring aggressively.',
  'Everything is fine. My tail is simply alarmed.', 'I meant to knock that off the table.', 'Mrow. That means “good morning” and also “move.”',
  'The prophecy says nothing about paperwork.', 'I have a very important sit to attend to.',
];

const NPC_DEFS = [
  // ---------------- PAWMOUTH ----------------
  {
    id: 'elder', name: 'Elder Whiskerby', role: 'Elder of Pawsmouth', breed: 'longhair', fur: 'smoke', eye: 'amber', scale: 1.04,
    x: 175, z: 322, home: { x: 175, z: 322 }, work: { x: 175, z: 322 }, mapPos: { x: 175, z: 306 },
    gear: { scarf: '#8d6b3f' },
    greet: ['You are late. The snow has been waiting three days for you, and it is not a patient snow.', 'Another adventurer. You smell of wet ambition and fish. Good. We can work with that.'],
    lore: 'Pawsmouth was built on the one stretch of river that refuses to freeze. The fish are smug about it. The cats are smugder.',
    prophecy: 'Nine lives were given to the first cats. A tenth was withheld, because the Nine were afraid of what it might do. The snow remembers. I remember. I am also very old.',
  },
  {
    id: 'mittens', name: 'Mittens', role: 'Locket Enthusiast', breed: 'calico', fur: 'snow', eye: 'jade', scale: 0.96,
    x: 208, z: 330, home: { x: 208, z: 330 }, work: { x: 196, z: 318 }, mapPos: { x: 208, z: 330 },
    greet: ['I had a locket. Silver. A fish inside. Do not look at me like that. It was a very handsome fish.', 'If you find a small silver locket in the old barrow, I will pay you. In gold. Not fish. Probably.'],
    lore: 'The locket belonged to my grandmother. Or her fish. The family history is complicated.',
  },
  {
    id: 'gull', name: 'Gull', role: 'Fishmonger', breed: 'snowshoe', fur: 'frost', eye: 'copper', scale: 1.0,
    x: 148, z: 300, home: { x: 190, z: 290 }, work: { x: 148, z: 300 }, mapPos: { x: 148, z: 300 },
    merchant: { stock: ['fish', 'stew', 'bread', 'healthPotion'], line: 'Fresh fish. Fresh opinions. Both are non-refundable.' },
    greet: ['The river gives fish. The fish give opinions. The opinions give me a headache.', 'Buy a fish. It is the most honest transaction in Catterfall.'],
    lore: 'The river runs north in winter and south in summer. Nobody knows why. The fish refuse to comment.',
  },
  {
    id: 'brindle', name: 'Guard Brindle', role: 'Village Watch', breed: 'tabby', fur: 'ginger', eye: 'amber', scale: 1.02,
    x: 190, z: 306, home: { x: 190, z: 306 }, work: { x: 186, z: 302 }, mapPos: { x: 190, z: 306 },
    gear: { armor: 'ironArmor', weapon: 'guardSaber' }, guard: true,
    greet: ['Move along. Or don\'t. I am not your mother. She is probably asleep in a box somewhere.', 'No trouble in Pawsmouth. We have enough trouble in Whiskerhold. It is a distribution problem.'],
    lore: 'The Watch protects the village from wolves, bandits, and people who say the fish here are “just okay.”',
  },
  {
    id: 'whisker', name: 'Old Whisker', role: 'Net Mender', breed: 'longhair', fur: 'moss', eye: 'jade', scale: 1.0,
    x: 158, z: 340, home: { x: 158, z: 340 }, work: { x: 162, z: 338 }, mapPos: { x: 158, z: 340 },
    greet: ['You can tell a lot about a cat by their knots. Yours are... ambitious.', 'The river took my best net. The river has expensive taste.'],
    lore: 'Every net in Pawsmouth is mended by a cat who cannot swim. It builds character. And a healthy fear of water.',
  },
  // ---------------- SHRINE ----------------
  {
    id: 'seer', name: 'Seer Mothwhisker', role: 'Keeper of the Nine', breed: 'chinchilla', fur: 'dusk', eye: 'moon', scale: 1.0,
    x: -40, z: 162, home: { x: -40, z: 162 }, work: { x: -40, z: 166 }, mapPos: { x: -40, z: 170 },
    gear: { armor: 'mageRobe', weapon: 'oakStaff' }, seer: true,
    greet: ['You have a tenth life. I can see it. It is... a bit scruffy.', 'The stones have been humming since dawn. Either the prophecy is beginning, or someone brought a very resonant fish.'],
    lore: 'The Shrine of the Nine was raised before Whiskerhold had walls, before the river had a name, before the first cat decided that sitting in a box was a political act.',
    prophecy: 'The Nine sealed the Empty Bowl beneath Frostfang. They left a door, a bell, and a promise: the Tenth would finish what they could not. The Tenth is late. The Tenth is you.',
  },
  // ---------------- WHISKERHOLD ----------------
  {
    id: 'bramble', name: 'Bramble', role: 'Bard of the Leaky Whisker', breed: 'ginger', fur: 'ginger', eye: 'copper', scale: 1.0,
    interior: 'tavern', x: -8, z: 3, home: { x: -8, z: 3 }, mapPos: { x: -332, z: -146 },
    gear: { scarf: '#8d3b35', weapon: 'clawWraps' }, companion: true, companionType: 'bard',
    greet: ['I have written forty-seven ballads about you. Most of them rhyme. Two are legally actionable.', 'You have the look of a cat who has never been in a ballad. That is about to change. Badly.'],
    lore: 'I was the finest bard in Whiskerhold until the lute was stolen. Now I am a cat with a lot of feelings and no chord progression.',
    combatLine: 'For the chorus!',
  },
  {
    id: 'cook', name: 'Cook Barley', role: 'Cook of the Leaky Whisker', breed: 'tabby', fur: 'ember', eye: 'amber', scale: 1.05,
    interior: 'tavern', x: 6, z: 0, home: { x: 6, z: 0 }, mapPos: { x: -332, z: -146 },
    gear: { armor: 'leatherArmor' },
    greet: ['I need three fish. Not two. Two is a snack. Three is a feast. Four is a diplomatic incident.', 'The stew is fine. The stew is always fine. Do not ask what is in the stew.'],
    lore: 'The Nine Bells Feast happens every winter. Last year the bell was stolen. This year we are using a very large spoon.',
  },
  {
    id: 'marrow', name: 'Marrow', role: 'Proprietor, Nine Lives Goods', breed: 'sootpaw', fur: 'ink', eye: 'amber', scale: 1.0,
    interior: 'shop', x: 0, z: -1, home: { x: 0, z: -1 }, mapPos: { x: -230, z: -160 },
    merchant: { stock: ['healthPotion', 'manaPotion', 'staminaPotion', 'bread', 'cheese', 'stew', 'leatherArmor', 'ironArmor', 'moonBow', 'emberAmulet'], line: 'Everything is negotiable except the fish.' },
    greet: ['Buy something or stop breathing my air. Actually, buy something and keep breathing. Package deal.', 'You look like you need a potion. Or several. I have several.'],
    lore: 'Nine Lives Goods has served Whiskerhold for six generations. We have never once sold a ninth life. Not for lack of trying.',
  },
  {
    id: 'forge', name: 'Forge', role: 'Smith of Whiskerhold', breed: 'tabby', fur: 'smoke', eye: 'copper', scale: 1.08,
    x: -300, z: -140, home: { x: -330, z: -132 }, work: { x: -300, z: -140 }, mapPos: { x: -300, z: -140 },
    merchant: { stock: ['guardSaber', 'frostAxe', 'ironArmor', 'wardenArmor', 'oathBlade'], line: 'I make swords. You break swords. It is a beautiful economy.' },
    gear: { armor: 'leatherArmor' }, smith: true,
    greet: ['I make swords. You break swords. It is a beautiful economy.', 'That blade is rusty. Rust is a seasoning, not a strategy.'],
    lore: 'The smithy has been in my family for nine generations. The ninth generation was a cat. The eighth was also a cat. It is a pattern.',
  },
  {
    id: 'captain', name: 'Captain Sable', role: 'Captain of the Watch', breed: 'sootpaw', fur: 'ink', eye: 'jade', scale: 1.08,
    x: -280, z: -102, home: { x: -280, z: -102 }, work: { x: -280, z: -96 }, mapPos: { x: -280, z: -102 },
    gear: { armor: 'wardenArmor', weapon: 'guardSaber', scarf: '#2b6a70' }, guard: true,
    greet: ['Bandits on the north road. We would go, but it is nearly lunch.', 'You have the look of someone who solves problems with a sword. We have a problem-shaped opening.'],
    lore: 'The Watch has nine bells. One for each district. We lost the ninth bell. We are not allowed to talk about it.',
  },
  {
    id: 'courtMage', name: 'Court Mage Pellucid', role: 'Reader of Falling Skies', breed: 'ashpoint', fur: 'dusk', eye: 'ice', scale: 1.0,
    x: 224, z: -266, home: { x: 224, z: -266 }, work: { x: 228, z: -270 }, mapPos: { x: 224, z: -266 },
    gear: { armor: 'mageRobe', weapon: 'oakStaff' },
    greet: ['The sky is falling. Not literally. Metaphorically. Possibly literally. I am still reading.', 'I have consulted the stars. They have asked me to stop.'],
    lore: 'Highpaw Keep was built on a hill because hills are easier to defend and much easier to look dramatic on.',
  },
  {
    id: 'steward', name: 'Steward Pell', role: 'Steward of Highpaw', breed: 'snowshoe', fur: 'frost', eye: 'moon', scale: 0.98,
    interior: 'castlehall', x: 0, z: -3, home: { x: 0, z: -3 }, mapPos: { x: 238, z: -292 },
    gear: { scarf: '#365a83' },
    greet: ['The Queen is... resting. She has been resting for eleven years. It is a very long nap.', 'Highpaw welcomes you. Please do not touch the throne. Or the Queen. Especially the Queen.'],
    lore: 'The Snow Queen has ruled Highpaw for forty years. For the last eleven, the Steward has ruled Highpaw and the Queen has ruled the duvet.',
  },
  // ---------------- HEARTHWHISKER ----------------
  {
    id: 'farmer', name: 'Pelt-Pincher Nibs', role: 'Turnip Magnate', breed: 'tabby', fur: 'moss', eye: 'amber', scale: 1.02,
    x: -398, z: 142, home: { x: -398, z: 142 }, work: { x: -408, z: 154 }, mapPos: { x: -398, z: 142 },
    greet: ['Rats. Big as my regrets. Twice as hungry.', 'The turnips are fine. The fence is fine. The rats are... a growth opportunity.'],
    lore: 'Hearthwhisker feeds half the kingdom. The other half says the turnips are “earthy.” We have chosen to take that as a compliment.',
  },
  {
    id: 'farmhand', name: 'Sprout', role: 'Farmhand', breed: 'ginger', fur: 'ginger', eye: 'jade', scale: 0.94,
    x: -380, z: 150, home: { x: -380, z: 150 }, work: { x: -386, z: 158 }, mapPos: { x: -380, z: 150 },
    greet: ['I am not scared of the rats. I am scared of what the turnips will do when they find out.', 'I have been here three weeks. The geese know my name. I do not know theirs.'],
    lore: 'The windmill grinds grain, gossip, and occasionally a very unlucky bird.',
  },
  // ---------------- FROSTPELT ----------------
  {
    id: 'soot', name: 'Soot', role: 'Apprentice of Frostpelt', breed: 'sootpaw', fur: 'ink', eye: 'violet', scale: 0.9,
    x: 340, z: 220, home: { x: 340, z: 220 }, work: { x: 336, z: 214 }, mapPos: { x: 340, z: 220 },
    gear: { armor: 'mageRobe', weapon: 'oakStaff' }, companion: true, companionType: 'mage',
    greet: ['I dreamed of a door under the mountain. It had my name on it. My name is Soot. It is a very short name for a door.', 'You are the Tenth. I knew it. I drew a picture. It is mostly a circle with ears.'],
    lore: 'I am apprenticed to Nettle. She teaches me potions, patience, and how to pretend I meant to set that on fire.',
    combatLine: 'Please stop moving. I am trying to aim.',
  },
  {
    id: 'nettle', name: 'Nettle', role: 'Apothecary', breed: 'ashpoint', fur: 'smoke', eye: 'jade', scale: 0.98,
    x: 326, z: 198, home: { x: 326, z: 198 }, work: { x: 330, z: 200 }, mapPos: { x: 326, z: 198 },
    merchant: { stock: ['healthPotion', 'manaPotion', 'staminaPotion', 'dreamHerb'], line: 'Potions, tinctures, and one jar of something that is definitely not jam.' },
    gear: { armor: 'mageRobe' },
    greet: ['Dreamherb. It makes you sleep. Or it makes you see the sleeping. One of those. I forget.', 'You look tired. Or haunted. I have something for both. The haunted one is more expensive.'],
    lore: 'Frostpelt is the last warm roof before the peaks. After that, it is just snow, wind, and the occasional deeply rude mountain goat.',
  },
  {
    id: 'hunter', name: 'Hunter Vane', role: 'Trapper', breed: 'snowshoe', fur: 'frost', eye: 'copper', scale: 1.0,
    x: 370, z: 230, home: { x: 370, z: 230 }, work: { x: 376, z: 224 }, mapPos: { x: 370, z: 230 },
    gear: { armor: 'leatherArmor', bow: 'huntingBow' },
    greet: ['Wolves do not hate you. They just think you are made of meat. Which, to be fair...', 'The mountain is quiet today. That is how it lures you in.'],
    lore: 'I have trapped every kind of animal in Catterfall except the snow hare. It knows what I am thinking. I respect it.',
  },
];

const INTERIOR_NPCS = NPC_DEFS.filter(d => d.interior);
const OUTDOOR_DEFS = NPC_DEFS.filter(d => !d.interior);

export class NPCManager {
  constructor(game) {
    this.game = game;
    this.rng = makeRng(5521);
    this.list = [];
    this.byId = {};
    this.interiorId = null;
    this.barks = 0;
    this.ambientTimer = 8;
    this.createOutdoor();
    this.createAmbient();
  }

  buildNpc(def, group, local = false) {
    const cat = createCat({
      breed: def.breed, fur: def.fur, eye: def.eye, scale: def.scale || 1,
      weapon: def.gear?.weapon, armor: def.gear?.armor, bow: def.gear?.bow, scarf: def.gear?.scarf,
    });
    cat.root.name = 'npc-' + def.id;
    group.add(cat.root);
    const npc = {
      ...def, def, cat, group: cat.root, local, companion: false, recruited: false,
      hp: 100, maxHp: 100, alive: true, dead: false, speed: 0,
      target: null, state: 'idle', idleT: this.rng.range(0, 4), chatT: this.rng.range(8, 30),
      wanderT: 0, stuck: 0, attackCd: 0, downed: 0, marker: null, facing: 0,
      interior: def.interior || null, baseX: def.x, baseZ: def.z,
      mapPos: def.mapPos || { x: def.x, z: def.z },
    };
    if (!local) {
      npc.group.position.set(def.x, this.game.world.terrain.heightAt(def.x, def.z), def.z);
    } else {
      npc.group.position.set(def.x, 0, def.z);
    }
    // quest marker
    const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xffcf6a }));
    marker.position.y = 2.45;
    marker.visible = false;
    npc.group.add(marker);
    npc.marker = marker;
    this.list.push(npc);
    this.byId[npc.id] = npc;
    return npc;
  }

  createOutdoor() {
    for (const def of OUTDOOR_DEFS) this.buildNpc(def, this.game.world.group);
  }

  createAmbient() {
    const spots = [
      { x: -292, z: -128, n: 5, r: 20 }, { x: -260, z: -180, n: 3, r: 18 },
      { x: 190, z: 316, n: 3, r: 14 }, { x: -392, z: 130, n: 2, r: 16 },
      { x: 352, z: 214, n: 2, r: 12 }, { x: 238, z: -280, n: 2, r: 12 },
    ];
    let idx = 0;
    for (const s of spots) {
      for (let i = 0; i < s.n; i++) {
        const look = randomCatLook(this.rng, {});
        const id = 'citizen' + (idx++);
        const x = s.x + this.rng.range(-s.r, s.r);
        const z = s.z + this.rng.range(-s.r, s.r);
        const def = {
          id, name: AMBIENT_NAMES[idx % AMBIENT_NAMES.length], role: 'Citizen',
          breed: look.breed, fur: look.fur, eye: look.eye, scale: this.rng.range(0.86, 1.06),
          x, z, home: { x: s.x, z: s.z }, work: { x: s.x + this.rng.range(-6, 6), z: s.z + this.rng.range(-6, 6) },
          mapPos: { x, z }, ambient: true,
          greet: [this.rng.pick(AMBIENT_LINES), this.rng.pick(AMBIENT_LINES)],
          lore: this.rng.pick(['I have lived here all my lives.', 'The snow is louder than it looks.', 'Do not trust the geese.']),
          gear: this.rng.chance(0.25) ? { armor: 'leatherArmor' } : {},
        };
        const npc = this.buildNpc(def, this.game.world.group);
        npc.home = def.home; npc.work = def.work;
        npc.wander = { x: s.x, z: s.z, r: s.r };
      }
    }
  }

  setInterior(id) {
    this.interiorId = id;
    if (id) {
      const interior = this.game.world.interiors.get(id);
      if (!interior) return;
      // hide outdoor npcs, but companions travel with you
      for (const npc of this.list) if (!npc.interior && !npc.companion) npc.group.visible = false;
      // create interior npcs on demand
      for (const def of INTERIOR_NPCS.filter(d => d.interior === id)) {
        if (!this.byId[def.id]) {
          const npc = this.buildNpc(def, interior.group, true);
          npc.interior = id;
          npc.home = { x: def.x, z: def.z }; npc.work = { x: def.x, z: def.z };
        }
        this.byId[def.id].group.visible = true;
      }
      // companions follow into the interior
      const sp = interior.spawn || { x: 0, z: 8 };
      let ci = 0;
      for (const npc of this.list) {
        if (npc.companion) {
          if (npc.group.parent !== interior.group) interior.group.add(npc.group);
          npc.group.position.set(1.4 + ci * 0.9, 0, sp.z - 2.4 - ci * 0.8);
          npc.group.visible = true;
          npc.facing = Math.PI;
          ci++;
        } else if (npc.interior && npc.interior !== id) npc.group.visible = false;
      }
    } else {
      for (const npc of this.list) {
        if (npc.companion) {
          // companions return to the player
          this.game.world.group.add(npc.group);
          const p = this.game.player.position;
          npc.group.position.set(p.x + 1.6, this.game.world.terrain.heightAt(p.x + 1.6, p.z + 1.6), p.z + 1.6);
          npc.group.visible = true;
        } else if (!npc.interior) npc.group.visible = true;
        else npc.group.visible = false;
      }
    }
  }

  reset() {
    for (const npc of this.list) {
      if (npc.group && npc.group.parent) npc.group.parent.remove(npc.group);
    }
    this.list = [];
    this.byId = {};
    this.interiorId = null;
    this.rng = makeRng(5521);
    this.createOutdoor();
    this.createAmbient();
  }

  talkables() {
    return this.list.filter(n => n.group.visible && !n.dead && (!this.interiorId ? !n.interior : n.interior === this.interiorId));
  }

  nearestTalkable(pos, maxDist = 3.4) {
    let best = null, bd = maxDist;
    for (const n of this.talkables()) {
      if (n.companion) continue;
      const d = pos.distanceTo(n.group.position);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  recruit(npc) {
    if (npc.companion) return;
    npc.companion = true; npc.recruited = true; npc.hp = 140; npc.maxHp = 140;
    this.game.companions.push(npc);
    this.game.quests.event('recruit', npc.id, 1);
    this.game.ui.toast(`<b>${npc.name}</b> joins you.`, 'good');
    this.game.audio.playQuestComplete();
  }

  setCompanionWait(npc, wait) {
    npc.waiting = wait;
    this.game.ui.toast(wait ? `${npc.name} will wait here.` : `${npc.name} follows.`);
  }

  update(dt) {
    const game = this.game;
    const hour = game.time.hours;
    const night = hour >= 21 || hour < 7;
    const playerPos = game.player.position;
    let nearestEnemy = null, ned = 18;
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const d = playerPos.distanceTo(e.group.position);
      if (d < ned) { ned = d; nearestEnemy = e; }
    }
    for (const npc of this.list) {
      if (!npc.group.visible) continue;
      if (npc.dead) continue;
      if (npc.companion) this.updateCompanion(npc, dt, nearestEnemy);
      else if (npc.guard && nearestEnemy && !this.interiorId && ned < 15) this.updateGuard(npc, dt, nearestEnemy);
      else if (npc.ambient) this.updateAmbient(npc, dt, night, hour);
      else this.updateScheduled(npc, dt, night, hour);
      // face player while talking
      if (game.mode === 'dialogue' && game.dialogue?.npc === npc) {
        const d = playerPos.clone().sub(npc.group.position);
        npc.facing = Math.atan2(d.x, d.z);
      }
      npc.group.rotation.y += angleDelta(npc.group.rotation.y, npc.facing) * Math.min(1, dt * 6);
      npc.cat.update(dt, { speed: npc.speed, sitting: npc.sitting, sleeping: npc.sleeping, talking: game.mode === 'dialogue' && game.dialogue?.npc === npc, lookYaw: npc.lookYaw || 0 });
      // marker
      const pending = game.quests.pendingTalk(npc.id);
      const offers = game.quests.offersFor(npc.id);
      const show = !!(pending || offers.length);
      npc.marker.visible = show && !npc.companion;
      if (show) {
        npc.marker.position.y = 2.45 + Math.sin(performance.now() * 0.002 + npc.group.position.x) * 0.08;
        npc.marker.rotation.y += dt * 1.5;
        npc.marker.material.color.set(pending ? 0x8ee39b : 0xffcf6a);
      }
      // ambient barks
      npc.chatT -= dt;
      if (npc.chatT <= 0) {
        npc.chatT = this.rng.range(18, 44);
        if (playerPos.distanceTo(npc.group.position) < 13 && game.mode === 'play' && !npc.companion) {
          const line = this.rng.pick(npc.ambient ? AMBIENT_LINES : (npc.greet || AMBIENT_LINES));
          game.ui.subtitle(`${npc.name}: ${line}`, 4.5);
          game.audio.meow(this.rng.range(0.7, 1.2));
          if (npc.ambient) npc.cat.playTalk();
        }
      }
    }
    // ambient meows near player even without dialogue
    this.ambientTimer -= dt;
    if (this.ambientTimer <= 0) {
      this.ambientTimer = this.rng.range(16, 35);
      if (game.mode === 'play') {
        game.audio.meow(this.rng.range(0.6, 1.4));
        if (Math.random() < 0.45) game.ui.subtitle(this.rng.pick(['Somewhere, a cat is very disappointed in you.', 'A distant meow. It sounds judgmental.', 'You hear a box being sat in.']), 3.5);
      }
    }
  }

  updateScheduled(npc, dt, night, hour) {
    const game = this.game;
    npc.attackCd = Math.max(0, npc.attackCd - dt);
    let target = npc.work;
    if (night) target = npc.home;
    else if (hour < 8 || hour > 19) target = npc.home;
    const tx = target.x, tz = target.z;
    const dx = tx - npc.group.position.x, dz = tz - npc.group.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 1.3) {
      npc.sleeping = false; npc.sitting = false;
      const speed = 1.35;
      npc.facing = Math.atan2(dx, dz);
      let nx = npc.group.position.x + (dx / dist) * speed * dt;
      let nz = npc.group.position.z + (dz / dist) * speed * dt;
      if (game.world.collidesCircle(nx, nz, 0.45)) {
        // sidestep
        const a = npc.facing + Math.PI / 2;
        nx = npc.group.position.x + Math.sin(a) * speed * dt;
        nz = npc.group.position.z + Math.cos(a) * speed * dt;
        npc.stuck += dt;
        if (npc.stuck > 3) { npc.group.position.set(tx, game.world.groundHeight(tx, tz), tz); npc.stuck = 0; }
      }
      npc.group.position.x = nx; npc.group.position.z = nz;
      npc.group.position.y = game.world.groundHeight(nx, nz);
      npc.speed = speed;
      npc.state = 'walk';
    } else {
      npc.speed = 0;
      npc.state = 'idle';
      npc.sitting = night || hour > 20;
      npc.sleeping = night;
      if (npc.sleeping) npc.facing = npc.home.rot || npc.facing;
      // face plaza / random
      if (!npc.sitting && Math.random() < dt * 0.4) npc.facing += this.rng.range(-1.2, 1.2);
    }
  }

  updateAmbient(npc, dt, night, hour) {
    const game = this.game;
    npc.speed = 0;
    if (night) { npc.sitting = true; npc.sleeping = true; return; }
    npc.sleeping = false;
    npc.idleT -= dt;
    if (npc.idleT <= 0) {
      npc.idleT = this.rng.range(3, 9);
      const w = npc.wander || { x: npc.home.x, z: npc.home.z, r: 8 };
      npc.wanderTarget = { x: w.x + this.rng.range(-w.r, w.r), z: w.z + this.rng.range(-w.r, w.r) };
      npc.sitting = this.rng.chance(0.35);
    }
    if (npc.wanderTarget && !npc.sitting) {
      const dx = npc.wanderTarget.x - npc.group.position.x, dz = npc.wanderTarget.z - npc.group.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.6) {
        npc.facing = Math.atan2(dx, dz);
        const nx = npc.group.position.x + Math.sin(npc.facing) * 1.1 * dt;
        const nz = npc.group.position.z + Math.cos(npc.facing) * 1.1 * dt;
        if (!game.world.collidesCircle(nx, nz, 0.4)) {
          npc.group.position.set(nx, game.world.groundHeight(nx, nz), nz);
          npc.speed = 1.1;
        } else npc.idleT = 0;
      } else { npc.speed = 0; npc.sitting = true; }
    }
  }

  updateGuard(npc, dt, enemy) {
    const game = this.game;
    npc.attackCd = Math.max(0, npc.attackCd - dt);
    const dx = enemy.group.position.x - npc.group.position.x, dz = enemy.group.position.z - npc.group.position.z;
    const d = Math.hypot(dx, dz);
    npc.facing = Math.atan2(dx, dz);
    if (d > 2.2) {
      const nx = npc.group.position.x + (dx / d) * 2.0 * dt;
      const nz = npc.group.position.z + (dz / d) * 2.0 * dt;
      npc.group.position.set(nx, game.world.groundHeight(nx, nz), nz);
      npc.speed = 2.0; npc.sitting = false; npc.sleeping = false;
    } else {
      npc.speed = 0;
      if (npc.attackCd <= 0) {
        npc.attackCd = 1.3;
        npc.cat.playAttack();
        game.audio.playSword();
        enemy.takeDamage(10, npc);
        game.effects.spark(enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xffd7a0);
      }
    }
  }

  updateCompanion(npc, dt, nearestEnemy) {
    const game = this.game;
    if (npc.downed > 0) {
      npc.downed -= dt; npc.sitting = true; npc.speed = 0;
      return;
    }
    npc.sitting = false; npc.sleeping = false;
    npc.attackCd = Math.max(0, npc.attackCd - dt);
    npc.healCd = Math.max(0, (npc.healCd || 0) - dt);
    const p = game.player.position;
    const enemy = this.findEnemyFor(npc, 16);
    if (enemy) {
      const dx = enemy.group.position.x - npc.group.position.x, dz = enemy.group.position.z - npc.group.position.z;
      const d = Math.hypot(dx, dz);
      npc.facing = Math.atan2(dx, dz);
      if (d > (npc.companionType === 'mage' ? 7 : 2.2)) {
        const nx = npc.group.position.x + (dx / d) * 3.2 * dt;
        const nz = npc.group.position.z + (dz / d) * 3.2 * dt;
        if (!game.world.collidesCircle(nx, nz, 0.4)) npc.group.position.set(nx, game.world.groundHeight(nx, nz), nz);
        npc.speed = 3.2;
      } else {
        npc.speed = 0;
        if (npc.attackCd <= 0) {
          npc.attackCd = npc.companionType === 'mage' ? 1.9 : 1.1;
          if (npc.companionType === 'mage') {
            npc.cat.playCast();
            const from = npc.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));
            const dir = enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0)).sub(from).normalize();
            game.effects.spawnProjectile({ pos: from, dir, speed: 22, damage: 16, owner: 'player', type: 'ice', color: 0x9fd8ff, size: 0.18, onHit: (t) => { t.takeDamage(16, npc); if (t.applySlow) t.applySlow(2); } });
            game.audio.playMagic('ice');
          } else {
            npc.cat.playAttack();
            game.audio.playSword();
            enemy.takeDamage(12, npc);
            game.effects.spark(enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xffd7a0);
          }
        }
      }
      if (npc.companionType === 'mage' && npc.healCd <= 0 && game.player.health < game.player.maxHealth * 0.55) {
        npc.healCd = 8;
        npc.cat.playCast();
        game.player.heal(18);
        game.effects.burst(game.player.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x8ee39b, 16, 2.4, 0.8);
        game.ui.toast(`${npc.name} mends your fur.`, 'good');
      }
    } else if (!npc.waiting) {
      const dx = p.x - npc.group.position.x, dz = p.z - npc.group.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 3.2) {
        npc.facing = Math.atan2(dx, dz);
        const speed = d > 12 ? 7.5 : 3.8;
        const nx = npc.group.position.x + (dx / d) * speed * dt;
        const nz = npc.group.position.z + (dz / d) * speed * dt;
        if (!game.world.collidesCircle(nx, nz, 0.4)) npc.group.position.set(nx, game.world.groundHeight(nx, nz), nz);
        npc.speed = speed;
      } else {
        npc.speed = 0;
        if (d < 2.0) npc.facing = Math.atan2(-dx, -dz);
      }
    } else npc.speed = 0;
  }

  findEnemyFor(npc, range) {
    let best = null, bd = range;
    for (const e of this.game.enemies) {
      if (!e.alive) continue;
      if (this.interiorId && e.interior !== this.interiorId) continue;
      const d = npc.group.position.distanceTo(e.group.position);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  companionDown(npc) {
    npc.downed = 18;
    npc.sitting = true;
    this.game.ui.toast(`${npc.name} is down. They will recover in a moment.`, 'bad');
  }

  save() {
    return this.list.filter(n => n.companion).map(n => n.id);
  }
  loadCompanions(ids) {
    for (const id of ids || []) {
      let npc = this.byId[id];
      if (!npc) {
        const def = NPC_DEFS.find(d => d.id === id);
        if (def) {
          const parent = def.interior ? this.game.world.buildInteriorIfNeeded(def.interior).group : this.game.world.group;
          npc = this.buildNpc(def, parent, !!def.interior);
          if (def.interior) {
            npc.interior = def.interior;
            npc.home = { x: def.x, z: def.z }; npc.work = { x: def.x, z: def.z };
          }
        }
      }
      if (npc) {
        npc.companion = true; npc.recruited = true; npc.hp = 140; npc.maxHp = 140;
        if (!this.game.companions.includes(npc)) this.game.companions.push(npc);
      }
    }
  }
}
