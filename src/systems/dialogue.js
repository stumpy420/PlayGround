// ---------------------------------------------------------------------------
// Conversations. Every cat has an opinion; some of them are even useful.
// ---------------------------------------------------------------------------
import { catAvatarStyle } from '../entities/cat.js';
import { QUESTS_BY_ID } from '../core/data.js';

const MEOWS = [
  ['Meow.', 'A measured response. The cat respects it.'],
  ['Mrrrp?', 'The cat tilts their head. You have asked a very cat question.'],
  ['*slow blink*', 'A great honour. You are now friends, or at least not enemies.'],
  ['*knocks a nearby object off a ledge*', 'The cat looks at the object, then at you, then at the object. No regrets.'],
  ['I am the Tenth.', '“We know,” says the cat. “You are also standing on my tail.”'],
];

export class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.npc = null;
    this.node = null;
    this.history = [];
    this.el = {
      screen: document.getElementById('dialogue'),
      name: document.getElementById('dlg-name'),
      text: document.getElementById('dlg-text'),
      options: document.getElementById('dlg-options'),
      avatar: document.getElementById('dlg-avatar'),
      close: document.getElementById('dlg-close'),
    };
    this.el.close?.addEventListener('click', () => this.close());
  }

  get open() { return this.game.mode === 'dialogue' && !!this.npc; }

  start(npc) {
    if (!npc) return;
    if (this.open) return;
    this.npc = npc;
    this.game.mode = 'dialogue';
    this.game.input.clear?.();
    this.game.ui.hideInteract();
    this.game.audio.meow(0.9 + Math.random() * 0.3);
    npc.cat.playTalk();
    catAvatarStyle(npc.cat, this.el.avatar);
    this.el.name.textContent = npc.name;
    this.el.screen.classList.add('show');
    this.game.ui.setAiming(false);
    this.game.player.aiming = false;

    // face each other
    const p = this.game.player.position;
    npc.facing = Math.atan2(p.x - npc.group.position.x, p.z - npc.group.position.z);
    this.game.player.yaw = Math.atan2(npc.group.position.x - p.x, npc.group.position.z - p.z);
    this.game.player.group.rotation.y = this.game.player.yaw;

    this.root();
  }

  close() {
    if (!this.npc) return;
    const npc = this.npc;
    this.el.screen.classList.remove('show');
    this.npc = null;
    this.node = null;
    this.game.mode = 'play';
    if (npc.cat) npc.cat.anim.talk = 0;
    this.game.input.clear?.();
  }

  say(text, options) {
    this.el.text.innerHTML = text;
    this.el.options.innerHTML = '';
    const opts = options || [];
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'dlg-opt';
      b.innerHTML = `${o.label}${o.tag ? `<span class="tag ${o.kind || ''}">${o.tag}</span>` : ''}`;
      b.addEventListener('click', () => {
        this.game.audio.playUIClick();
        if (o.action) o.action();
      });
      this.el.options.appendChild(b);
      if (i === 0) setTimeout(() => b.focus?.(), 20);
    });
    this.node = { text, options: opts };
  }

  // -------------------------------------------------------------------------
  root() {
    const game = this.game;
    const npc = this.npc;
    if (!npc) return;
    const pending = game.quests.pendingTalk(npc.id);
    const offers = game.quests.offersFor(npc.id);
    const greet = npc.greet?.[Math.floor(Math.random() * npc.greet.length)] || 'Mrrp.';

    if (pending) {
      const stage = game.quests.currentStage(pending);
      const q = QUESTS_BY_ID[pending.id];
      const done = stage.event === 'talk';
      const opts = [];
      if (done) {
        opts.push({
          label: this.turnInLabel(npc, pending),
          tag: 'Quest', kind: 'quest',
          action: () => this.turnIn(npc, pending),
        });
      }
      opts.push(...this.commonOptions(npc));
      this.say(`“${this.pendingLine(npc, q)}”`, opts);
      return;
    }

    const opts = [];
    if (offers.length) {
      for (const q of offers) {
        opts.push({
          label: `“${this.offerPrompt(q, npc)}”`,
          tag: q.type === 'main' ? 'Main quest' : 'Side quest', kind: 'quest',
          action: () => this.offer(q),
        });
      }
    }
    if (npc.def?.companion && !npc.recruited) {
      opts.push({
        label: `“Walk with me, ${npc.name.split(' ')[0]}.”`,
        tag: 'Companion', kind: 'quest',
        action: () => this.recruit(npc),
      });
    }
    if (npc.recruited && npc.companion) {
      opts.push({
        label: npc.waiting ? `“Follow me again.”` : `“Wait here for now.”`,
        tag: 'Companion', kind: 'quest',
        action: () => {
          game.npcs.setCompanionWait(npc, !npc.waiting);
          this.root();
        },
      });
    }
    if (npc.merchant) {
      opts.push({
        label: `“Show me your wares.”`,
        tag: 'Trade', kind: 'shop',
        action: () => { this.close(); game.openShop(npc); },
      });
    }
    opts.push(...this.commonOptions(npc));
    this.say(`“${greet}”`, opts);
  }

  commonOptions(npc) {
    const game = this.game;
    const opts = [];
    if (npc.id === 'seer') {
      opts.push({
        label: '“Tell me about the Tenth.”',
        action: () => this.say(`“${npc.prophecy}”`, [
          { label: '“That is either profound or a threat.”', action: () => this.say('“Yes,” says Mothwhisker, and refuses to elaborate.', this.commonOptions(npc)) },
          { label: 'Back', action: () => this.root() },
        ]),
      });
      opts.push({
        label: '“Can I rest here?”',
        action: () => {
          this.say('“The stones remember warmth. Take some. Try not to take all of it.”', [
            { label: 'Rest at the shrine', action: () => { this.close(); game.restAtShrine('Shrine of the Nine', -40, 178); } },
            { label: 'Back', action: () => this.root() },
          ]);
        },
      });
    }
    if (npc.lore) {
      opts.push({
        label: '“Tell me of this place.”',
        action: () => this.say(`“${npc.lore}”`, [
          { label: '“Fascinating.”', action: () => this.say('“It is,” the cat agrees, and waits for you to leave.', this.commonOptions(npc)) },
          { label: 'Back', action: () => this.root() },
        ]),
      });
    }
    if (npc.merchant) {
      opts.push({
        label: '“What do you sell?”',
        action: () => this.say(`“${npc.merchant.line}”`, [
          { label: 'Browse the wares', tag: 'Trade', kind: 'shop', action: () => { this.close(); game.openShop(npc); } },
          { label: 'Back', action: () => this.root() },
        ]),
      });
    }
    if (npc.guard) {
      opts.push({
        label: '“Any trouble on the roads?”',
        action: () => this.say(this.guardLine(npc), [
          { label: '“I will look into it.”', action: () => this.say('“See that you do. The paperwork is already filed.”', this.commonOptions(npc)) },
          { label: 'Back', action: () => this.root() },
        ]),
      });
    }
    opts.push({
      label: '“*meow*”',
      action: () => {
        const m = MEOWS[Math.floor(Math.random() * MEOWS.length)];
        this.game.audio.meow(1.2);
        this.say(`${m[0]}<br/><span style="color:#7f96a1;font-style:italic">${m[1]}</span>`, this.commonOptions(npc));
      },
    });
    opts.push({ label: '“Farewell.”', action: () => this.close() });
    return opts;
  }

  guardLine(npc) {
    if (npc.id === 'captain') return '“Bandits at Scarwood Camp. Four of them will do. Bring proof, or at least a convincing limp.”';
    if (npc.id === 'brindle') return '“Wolves in the hills. Rats in the fields. And a rumour that the fish have formed a union.”';
    return '“Nothing I cannot handle. Probably. Do not quote me.”';
  }

  offerPrompt(q, npc) {
    if (q.type === 'main') return q.id === 'main1' ? 'I am listening. Make it quick.' : 'What does the prophecy require now?';
    switch (q.id) {
      case 'rats': return 'You look like you can kill things. Small things. Rats.';
      case 'locket': return 'Have you seen a locket? Silver? Fish-related?';
      case 'lute': return 'A tragedy has occurred. My lute has been stolen.';
      case 'fish': return 'Three fish. I need three fish. Do not make it weird.';
      case 'bandits': return 'You. You have a sword-shaped look about you.';
      case 'herb': return 'Do you fetch things? I need a thing fetched.';
      default: return 'I have a task.';
    }
  }

  offer(q) {
    const game = this.game;
    const opts = [
      {
        label: q.type === 'main' ? '“I will do it.”' : '“Fine. I will help.”',
        tag: 'Accept', kind: 'quest',
        action: () => {
          game.quests.start(q.id);
          this.say(`“${this.acceptLine(q)}”`, this.commonOptions(this.npc));
        },
      },
      { label: '“Not right now.”', action: () => this.root() },
    ];
    this.say(`<b>${q.title}</b><br/>${q.summary}`, opts);
  }

  acceptLine(q) {
    switch (q.id) {
      case 'main1': return 'Good. The seer waits at the Shrine of the Nine. Try not to be late twice.';
      case 'main2': return 'The barrow is west of the city. The Hollow are already inside. Bring something sharp and something warm.';
      case 'main3': return 'Bramble is in the Leaky Whisker. Soot is in Frostpelt. They will pretend to be hard to convince.';
      case 'main4': return 'Cinderdeep, in the eastern peaks. Marrowmaw guards the bell. He is very hungry and very rude.';
      case 'main5': return 'The door beneath Frostfang. Bring the Ember and the Bell. Bring your friends. Do not bring snacks; the Bowl is listening.';
      case 'rats': return 'Five rats. The turnips are counting on you. So am I. Mostly the turnips.';
      case 'locket': return 'The old barrow, west of the city. If the fish is still handsome, do not tell it.';
      case 'lute': return 'Scarwood Camp, north of here. Mind the bandits. And the lute. It is sensitive.';
      case 'fish': return 'The river and the lake. Three fish. If they resist, remind them of their place in the food chain.';
      case 'bandits': return 'Four bandits at Scarwood. The Watch will handle the forms.';
      case 'herb': return 'The Whispering Cave. It knows your name. Do not give it your address.';
      default: return 'Good. Off you go.';
    }
  }

  pendingLine(npc, q) {
    if (!q) return 'You have something for me?';
    if (q.type === 'main') {
      if (q.id === 'main1') return 'You are here. The stones are humming. That is either prophecy or indigestion.';
      return 'You return. The snow has been telling stories about you. Mostly flattering.';
    }
    return npc.id === 'mittens' ? 'You have it? You have the locket? Do not look at the fish.' : 'You are back. Good. I was starting to write a ballad about your death.';
  }

  turnInLabel(npc, state) {
    const q = QUESTS_BY_ID[state.id];
    if (q.type === 'main') return `“I have done what you asked.”`;
    return `“About ${q.title}…”`;
  }

  turnIn(npc, state) {
    const game = this.game;
    const q = QUESTS_BY_ID[state.id];
    const beforeStage = state.stage;
    game.quests.turnIn(npc.id);
    const after = game.quests.get(state.id);
    const completed = after?.complete;
    let line;
    if (completed) {
      const reward = q.reward || {};
      line = `“${this.completeLine(q)}”<br/><span style="color:#d8b16a">+${reward.xp || 0} XP · +${reward.gold || 0} gold</span>`;
    } else {
      const nextStage = game.quests.currentStage(after);
      line = `“${this.nextLine(q, nextStage)}”`;
    }
    const opts = this.commonOptions(npc);
    this.say(line, opts);
  }

  completeLine(q) {
    switch (q.id) {
      case 'main1': return 'Then it begins. The Tenth has arrived, and the snow is already nervous.';
      case 'main2': return 'The Ember. Still warm. Still angry. Keep it close; the dark knows its shape.';
      case 'main3': return 'A bard and a mage. The prophecy has a sense of humour after all.';
      case 'main4': return 'The Bell. It has been trying to apologise for a thousand years. Let it.';
      case 'main5': return 'The Bowl is empty. The kingdom is not. That is the difference, little hunter.';
      case 'rats': return 'Five rats fewer. The turnips have nominated you for a medal.';
      case 'locket': return 'The fish is safe. He looks relieved. Do not ask how I can tell.';
      case 'lute': return 'My lute! Gerald the string is still missing, but the rest of the chord progression is intact.';
      case 'fish': return 'Three fish. The feast is saved. The fish are not.';
      case 'bandits': return 'The north road is quiet. I have filed the paperwork in triplicate.';
      case 'herb': return 'Dreamherb. I can finally sleep. Or see the sleeping. Either way, thank you.';
      default: return 'Well done.';
    }
  }

  nextLine(q, stage) {
    if (!stage) return 'Well done.';
    return stage.text;
  }

  recruit(npc) {
    const game = this.game;
    game.npcs.recruit(npc);
    this.game.quests.event('recruit', npc.id, 1);
    const line = npc.companionType === 'mage'
      ? '“I packed three potions and one very bad idea. Let us go.”'
      : '“Finally. I have been practising my heroic entrance for weeks. How was it?”';
    this.say(line, this.commonOptions(npc));
  }
}
