import * as THREE from '../vendor/three.module.js';
import { ELEVATOR, REFINERY, formatNumber, formatAether, clamp } from './util.js';
import { MISSIONS, CAMPAIGN_TITLE } from './campaign.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.el = {
      hud: $('hud'),
      start: $('start-screen'),
      help: $('help-screen'),
      pause: $('pause-screen'),
      end: $('end-screen'),
      startScrap: $('start-scrap'),
      startAether: $('start-aether'),
      startRuns: $('start-runs'),
      startBest: $('start-best'),
      campaignLabel: $('campaign-label'),
      campaignSub: $('campaign-sub'),
      campaignPips: $('campaign-pips'),
      campaignBtn: $('start-btn'),
      brief: $('brief-screen'),
      briefEyebrow: $('brief-eyebrow'),
      briefTitle: $('brief-title'),
      briefLocation: $('brief-location'),
      briefThreat: $('brief-threat'),
      briefStory: $('brief-story'),
      briefSpeaker: $('brief-speaker'),
      briefLine: $('brief-line'),
      briefObjectives: $('brief-objectives'),
      briefFoot: $('brief-foot'),
      briefDeploy: $('brief-deploy'),
      missionPanel: $('mission-panel'),
      missionOp: $('mission-op'),
      missionTitle: $('mission-title'),
      missionSteps: $('mission-steps'),
      bossBar: $('boss-bar'),
      bossName: $('boss-name'),
      bossFill: $('boss-fill'),
      comms: $('comms'),
      commsSpeaker: $('comms-speaker'),
      commsText: $('comms-text'),
      walletScrap: $('wallet-scrap'),
      walletAether: $('wallet-aether'),
      healthFill: $('health-fill'),
      healthText: $('health-text'),
      staminaFill: $('stamina-fill'),
      staminaText: $('stamina-text'),
      vitals: document.querySelector('.vitals'),
      ammoMag: $('ammo-mag'),
      ammoReserve: $('ammo-reserve'),
      ammoState: $('ammo-state'),
      ammo: document.querySelector('.ammo'),
      weaponName: $('weapon-name'),
      weaponSlots: [...document.querySelectorAll('#weapon-slots [data-weapon]')],
      cargoCores: $('cargo-cores'),
      cargoScrap: $('cargo-scrap'),
      cargoFill: $('cargo-fill'),
      cargoText: $('cargo-text'),
      cargo: $('cargo'),
      storm: $('storm'),
      stormFill: $('storm-fill'),
      stormText: $('storm-text'),
      stormLabel: $('storm-label'),
      objective: $('objective-text'),
      prompt: $('prompt'),
      promptText: $('prompt-text'),
      promptFill: $('prompt-fill'),
      crosshair: $('crosshair'),
      hitmarker: $('hitmarker'),
      toasts: $('toasts'),
      vignette: $('damage-vignette'),
      stormVignette: $('storm-vignette'),
      lowHealth: $('low-health'),
      extractPanel: $('extract-panel'),
      extractCount: $('extract-count'),
      extractFill: $('extract-fill'),
      endKicker: $('end-kicker'),
      endTitle: $('end-title'),
      endNote: $('end-note'),
      endScrap: $('end-scrap'),
      endCores: $('end-cores'),
      endAether: $('end-aether'),
      endTotal: $('end-total'),
      redeploy: $('redeploy-btn'),
      mute: $('mute-btn'),
      markers: $('markers'),
      padChip: $('pad-chip'),
      padLabel: $('pad-label'),
      padNote: $('pad-note'),
    };

    this.damageLevel = 0;
    this.toastCount = 0;
    this.lastPrompt = null;
    this.lastWeaponId = null;
    this.markers = [];
    this.missionId = null;
    this.missionStepCount = 0;
    this.commsQueue = [];
    this.commsCurrent = null;
    this.commsChars = 0;
    this.commsHold = 0;
    this.commsLine = '';

    const defs = [
      { id: 'lift', label: 'LIFT 04', pos: new THREE.Vector3(ELEVATOR.x, 10, ELEVATOR.z), cls: 'cyan' },
      { id: 'refinery', label: 'REFINERY 09', pos: new THREE.Vector3(REFINERY.x, 24, REFINERY.z), cls: '' },
    ];
    for (const def of defs) {
      const el = document.createElement('div');
      el.className = 'marker ' + def.cls;
      el.innerHTML = `<span class="m-icon"></span><span class="m-label">${def.label}</span><span class="m-dist">0 M</span>`;
      el.style.opacity = '0';
      this.el.markers.appendChild(el);
      this.markers.push({ ...def, el, distEl: el.querySelector('.m-dist'), shown: false });
    }

    const waypointEl = document.createElement('div');
    waypointEl.className = 'marker waypoint';
    waypointEl.innerHTML = '<span class="m-icon"></span><span class="m-label">OBJECTIVE</span><span class="m-dist">0 M</span>';
    waypointEl.style.opacity = '0';
    this.el.markers.appendChild(waypointEl);
    this.waypoint = {
      id: 'waypoint',
      pos: new THREE.Vector3(),
      el: waypointEl,
      labelEl: waypointEl.querySelector('.m-label'),
      distEl: waypointEl.querySelector('.m-dist'),
      shown: false,
      hidden: true,
    };
    this.markers.push(this.waypoint);

    this.vec = new THREE.Vector3();
    this.campaignPips = [];
    this.buildCampaignPips();
  }

  setWallet(wallet) {
    this.el.walletScrap.textContent = formatNumber(wallet.scrap);
    this.el.walletAether.textContent = formatAether(wallet.aether);
    this.el.startScrap.textContent = formatNumber(wallet.scrap);
    this.el.startAether.textContent = formatAether(wallet.aether);
    this.el.startRuns.textContent = formatNumber(wallet.runs);
    this.el.startBest.textContent = formatAether(wallet.best);
  }

  /* ---------------------------------------------------------------- */
  /* Campaign                                                          */
  /* ---------------------------------------------------------------- */
  buildCampaignPips() {
    if (!this.el.campaignPips) return;
    this.el.campaignPips.innerHTML = '';
    this.campaignPips = MISSIONS.map(() => {
      const pip = document.createElement('i');
      this.el.campaignPips.appendChild(pip);
      return pip;
    });
  }

  setCampaignProgress(progress) {
    const mission = MISSIONS[progress.mission] || MISSIONS[0];
    const complete = !!progress.ending;
    if (this.el.campaignLabel) this.el.campaignLabel.textContent = CAMPAIGN_TITLE;

    if (this.el.campaignSub) {
      if (complete) {
        this.el.campaignSub.textContent = `COMPLETE // ${progress.ending === 'upload' ? 'THE CHOIR ASCENDS' : 'ASHES IN THE VEIN'}`;
      } else if (progress.completed > 0) {
        this.el.campaignSub.textContent = `OP ${mission.op} // ${mission.title}`;
      } else {
        this.el.campaignSub.textContent = 'NEW CAMPAIGN // 5 OPERATIONS';
      }
    }

    for (let i = 0; i < this.campaignPips.length; i++) {
      const pip = this.campaignPips[i];
      pip.classList.toggle('done', complete || i < progress.completed);
      pip.classList.toggle('current', !complete && i === progress.mission);
    }

    if (this.el.campaignBtn) {
      this.el.campaignBtn.textContent = complete
        ? 'Replay Campaign'
        : progress.completed > 0
          ? `Continue // OP ${mission.op}`
          : 'Start Campaign';
    }
  }

  showBriefing(mission, progress) {
    if (!mission) return;
    this.el.briefEyebrow.textContent = `OPERATION ${mission.op} // ${CAMPAIGN_TITLE}`;
    this.el.briefTitle.textContent = mission.title;
    this.el.briefLocation.textContent = mission.location;
    this.el.briefThreat.textContent = mission.threat;
    this.el.briefStory.innerHTML = '';
    for (const text of mission.brief) {
      const p = document.createElement('p');
      p.textContent = text;
      this.el.briefStory.appendChild(p);
    }
    this.el.briefSpeaker.textContent = mission.quote.speaker;
    this.el.briefSpeaker.dataset.role = mission.quote.speaker === 'WARDEN' ? 'warden' : 'moth';
    this.el.briefLine.textContent = mission.quote.text;
    this.el.briefObjectives.innerHTML = '';
    mission.steps.forEach((step, i) => {
      const li = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(i + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.textContent = step.label;
      li.append(num, label);
      this.el.briefObjectives.appendChild(li);
    });
    this.el.briefDeploy.textContent = `Deploy // OP ${mission.op}`;
    if (progress.ending) {
      this.el.briefFoot.textContent = 'Campaign complete. Deploying Operation 01 starts a new loop and resets operation progress.';
    } else if (progress.completed > 0) {
      this.el.briefFoot.textContent = `${progress.completed} / ${MISSIONS.length} operations complete. Progress saves locally; death keeps you on the current operation.`;
    } else {
      this.el.briefFoot.textContent = 'Campaign progress saves locally. Death keeps you on the current operation.';
    }
  }

  setMission(mission) {
    if (!mission) {
      this.missionId = null;
      this.missionStepCount = 0;
      this.el.missionPanel.classList.add('hidden');
      return;
    }
    if (this.missionId === mission.id) return;
    this.missionId = mission.id;
    this.missionStepCount = mission.steps.length;
    this.el.missionOp.textContent = `OP ${mission.op} // ${CAMPAIGN_TITLE}`;
    this.el.missionTitle.textContent = mission.title;
    this.el.missionSteps.innerHTML = '';
    mission.steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = 'mission-step';
      li.dataset.index = String(i);
      li.innerHTML = '<span class="ms-mark"></span><span class="ms-label"></span><span class="ms-count"></span>';
      li.querySelector('.ms-label').textContent = step.label;
      this.el.missionSteps.appendChild(li);
    });
    this.el.missionPanel.classList.remove('hidden');
  }

  updateMission(steps, current, detail = '') {
    if (!this.el.missionSteps.children.length) return;
    for (let i = 0; i < this.el.missionSteps.children.length; i++) {
      const li = this.el.missionSteps.children[i];
      li.classList.toggle('done', !!steps[i].complete);
      li.classList.toggle('current', i === current);
      const count = li.querySelector('.ms-count');
      if (count) count.textContent = i === current ? detail : '';
    }
  }

  setWaypoint(label, x, y, z) {
    if (!this.waypoint) return;
    this.waypoint.hidden = false;
    this.waypoint.pos.set(x, y, z);
    this.waypoint.labelEl.textContent = label;
  }

  clearWaypoint() {
    if (!this.waypoint) return;
    this.waypoint.hidden = true;
    this.waypoint.shown = false;
    this.waypoint.el.style.opacity = '0';
  }

  setBoss(active, name = '', health = 0, max = 1) {
    if (!this.el.bossBar) return;
    this.el.bossBar.classList.toggle('hidden', !active);
    if (!active) return;
    if (this.el.bossName.textContent !== name) this.el.bossName.textContent = name;
    const pct = clamp(health / (max || 1), 0, 1) * 100;
    this.el.bossFill.style.width = pct.toFixed(1) + '%';
  }

  /* ---------------------------------------------------------------- */
  /* Radio comms                                                       */
  /* ---------------------------------------------------------------- */
  transmit(speaker, text, duration = 0) {
    if (!text) return;
    this.commsQueue.push({
      speaker: speaker || 'MOTH',
      text,
      duration: duration || clamp(text.length / 38, 3.8, 9.5),
    });
    if (!this.commsCurrent) this.nextComms();
  }

  nextComms() {
    const line = this.commsQueue.shift();
    if (!line) {
      this.commsCurrent = null;
      this.commsLine = '';
      this.el.comms.classList.add('hidden');
      return;
    }
    this.commsCurrent = line;
    this.commsChars = 0;
    this.commsHold = line.duration;
    this.commsLine = line.text;
    this.el.commsSpeaker.textContent = line.speaker;
    this.el.commsSpeaker.dataset.role = line.speaker === 'WARDEN' ? 'warden' : 'moth';
    this.el.commsText.textContent = '';
    this.el.comms.classList.remove('hidden');
  }

  clearComms() {
    this.commsQueue.length = 0;
    this.commsCurrent = null;
    this.commsLine = '';
    this.el.comms.classList.add('hidden');
  }

  setVitals(health, stamina) {
    const hp = clamp(health, 0, 100);
    this.el.healthFill.style.width = hp + '%';
    this.el.healthText.textContent = Math.ceil(hp);
    this.el.staminaFill.style.width = clamp(stamina, 0, 100) + '%';
    this.el.staminaText.textContent = Math.ceil(stamina);
    this.el.vitals.classList.toggle('low', hp < 32);
    this.el.lowHealth.style.opacity = hp < 32 ? String(0.25 + (1 - hp / 32) * 0.45) : '0';
  }

  setAmmo(mag, reserve, reloading, weapon) {
    this.el.ammoMag.textContent = mag;
    this.el.ammoReserve.textContent = reserve;
    this.el.ammo.classList.toggle('reloading', reloading);
    this.el.ammo.classList.toggle('empty', mag === 0 && !reloading);

    if (weapon) {
      if (weapon.id !== this.lastWeaponId) {
        this.el.weaponName.textContent = weapon.name;
        for (const slot of this.el.weaponSlots) {
          slot.classList.toggle('active', Number(slot.dataset.weapon) === weapon.slot);
        }
        this.lastWeaponId = weapon.id;
      }
      this.el.ammoState.textContent = reloading
        ? 'RELOADING'
        : mag === 0
          ? 'EMPTY // R'
          : weapon.hud;
      return;
    }

    this.el.ammoState.textContent = reloading ? 'RELOADING' : mag === 0 ? 'EMPTY // R' : 'BALLISTIC // AUTO';
  }

  setCargo(scrap, cores, mass, max) {
    this.el.cargoCores.textContent = cores;
    this.el.cargoScrap.textContent = formatNumber(scrap);
    this.el.cargoFill.style.width = clamp((mass / max) * 100, 0, 100) + '%';
    this.el.cargoText.textContent = `${mass} / ${max} KG`;
    this.el.cargo.classList.toggle('full', mass >= max);
  }

  setStorm(active, remaining, warning) {
    const pct = clamp(remaining / (active ? 26 : 70), 0, 1) * 100;
    this.el.stormFill.style.width = pct + '%';
    this.el.stormLabel.textContent = active ? 'ETHER-STORM' : 'ATMOSPHERE';
    this.el.stormText.textContent = active
      ? `STORM ACTIVE // ${Math.ceil(remaining)}S`
      : warning
        ? `STORM INBOUND // ${Math.ceil(remaining)}S`
        : `CLEAR // ${Math.ceil(remaining)}S`;
    this.el.storm.classList.toggle('storming', active);
    this.el.storm.classList.toggle('warn', !active && warning);
    this.el.stormVignette.style.opacity = active ? '1' : '0';
  }

  setObjective(text) {
    if (this.el.objective.textContent !== text) this.el.objective.textContent = text;
  }

  setPrompt(text, progress = 0) {
    if (text === null) {
      if (this.lastPrompt !== null) {
        this.el.prompt.classList.add('hidden');
        this.lastPrompt = null;
      }
      return;
    }
    if (this.lastPrompt !== text) {
      this.el.prompt.classList.remove('hidden');
      this.el.promptText.textContent = text;
      this.lastPrompt = text;
    }
    this.el.promptFill.style.width = clamp(progress, 0, 1) * 100 + '%';
  }

  setCrosshair(spread) {
    this.el.crosshair.style.setProperty('--gap', (5 + spread * 26).toFixed(1) + 'px');
  }

  hitmarker(kill = false) {
    const el = this.el.hitmarker;
    el.classList.remove('show');
    el.classList.toggle('kill', kill);
    void el.offsetWidth;
    el.classList.add('show');
  }

  damage() {
    this.damageLevel = Math.min(1, this.damageLevel + 0.55);
  }

  toast(text, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = text;
    this.el.toasts.appendChild(el);
    this.toastCount++;
    while (this.el.toasts.children.length > 4) this.el.toasts.firstChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, 1900);
  }

  setExtraction(active, remaining = 0, total = 12) {
    this.el.extractPanel.classList.toggle('hidden', !active);
    if (!active) return;
    this.el.extractCount.textContent = Math.max(0, Math.ceil(remaining));
    this.el.extractFill.style.width = clamp(1 - remaining / total, 0, 1) * 100 + '%';
  }

  updateMarkers(camera, visible) {
    if (!visible) {
      for (const m of this.markers) {
        if (m.shown) {
          m.el.style.opacity = '0';
          m.shown = false;
        }
      }
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const m of this.markers) {
      if (m.hidden) {
        if (m.shown) {
          m.el.style.opacity = '0';
          m.shown = false;
        }
        continue;
      }
      this.vec.copy(m.pos).project(camera);
      const dist = camera.position.distanceTo(m.pos);
      const onScreen = this.vec.z > -1 && this.vec.z < 1 && Math.abs(this.vec.x) < 1.15 && Math.abs(this.vec.y) < 1.15;
      const show = onScreen && dist < (m.id === 'waypoint' ? 420 : 260);
      m.el.style.opacity = show ? '1' : '0';
      m.shown = show;
      if (!show) continue;
      const x = clamp((this.vec.x * 0.5 + 0.5) * w, 34, w - 34);
      const y = clamp((-this.vec.y * 0.5 + 0.5) * h, 70, h - 90);
      m.el.style.left = x + 'px';
      m.el.style.top = y + 'px';
      m.distEl.textContent = Math.round(dist) + ' M';
    }
  }

  update(dt) {
    if (this.damageLevel > 0) {
      this.damageLevel = Math.max(0, this.damageLevel - dt * 1.9);
      this.el.vignette.style.opacity = this.damageLevel.toFixed(2);
    }

    if (this.commsCurrent) {
      if (this.commsChars < this.commsLine.length) {
        this.commsChars = Math.min(this.commsLine.length, this.commsChars + dt * 62);
        this.el.commsText.textContent = this.commsLine.slice(0, Math.floor(this.commsChars));
      } else {
        this.commsHold -= dt;
        if (this.commsHold <= 0) this.nextComms();
      }
    }
  }

  showHUD(show) {
    this.el.hud.classList.toggle('hidden', !show);
  }

  showStart(show) {
    this.el.start.classList.toggle('hidden', !show);
  }

  showHelp(show) {
    this.el.help.classList.toggle('hidden', !show);
  }

  showPause(show) {
    this.el.pause.classList.toggle('hidden', !show);
  }

  showEnd(data) {
    const el = this.el.end;
    const campaign = data.campaign;
    el.classList.remove('hidden');
    el.classList.toggle('fail', !data.success);
    el.classList.toggle('campaign', !!campaign);

    if (campaign) {
      if (campaign.final) {
        this.el.endKicker.textContent = `CAMPAIGN COMPLETE // ${CAMPAIGN_TITLE}`;
      } else if (campaign.failed) {
        this.el.endKicker.textContent = `OPERATION ${campaign.op} FAILED`;
      } else {
        this.el.endKicker.textContent = `OPERATION ${campaign.op} COMPLETE`;
      }
      this.el.endTitle.textContent = campaign.title;
      this.el.endNote.textContent = campaign.note;
      this.el.redeploy.textContent = campaign.action || (data.success ? 'Next Operation' : 'Retry Operation');
    } else if (data.success) {
      this.el.endKicker.textContent = 'EXTRACTION COMPLETE';
      this.el.endTitle.textContent = 'Cargo secured';
      this.el.endNote.textContent = 'Lift 04 broke atmosphere with your haul intact. Scrap is banked and Ether-Core has been refined into $AETHER.';
      this.el.redeploy.textContent = 'Redeploy';
    } else if (data.abandoned) {
      this.el.endKicker.textContent = 'RUN ABANDONED';
      this.el.endTitle.textContent = 'Extraction called off';
      this.el.endNote.textContent = 'You turned back before the lift. Cargo and cores were left in the red zone — the rifle comes home with you.';
      this.el.redeploy.textContent = 'Redeploy';
    } else {
      this.el.endKicker.textContent = 'SIGNAL LOST';
      this.el.endTitle.textContent = 'The wasteland keeps it';
      this.el.endNote.textContent = 'Your integrity failed out in the red zone. Cargo, cores and the run are gone — your rifle is all you get back.';
      this.el.redeploy.textContent = 'Redeploy';
    }
    this.el.endScrap.textContent = formatNumber(data.scrap);
    this.el.endCores.textContent = formatNumber(data.cores);
    this.el.endAether.textContent = formatAether(data.aether);
    this.el.endTotal.textContent = formatAether(data.total);
  }

  hideEnd() {
    this.el.end.classList.add('hidden');
  }

  setMuted(muted) {
    this.el.mute.classList.toggle('muted', muted);
  }

  setGamepad(connected, label = 'CONTROLLER') {
    this.el.padChip?.classList.toggle('hidden', !connected);
    this.el.padNote?.classList.toggle('hidden', !connected);
    if (!connected) return;
    if (this.el.padLabel) this.el.padLabel.textContent = label;
    if (this.el.padChip) this.el.padChip.title = `Controller connected: ${label}`;
  }
}
