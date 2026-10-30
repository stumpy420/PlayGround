import { Game, CREW_COLORS } from "./game.js";
import { TASKS } from "./map.js";
import { Renderer } from "./render.js";
import { AudioSys } from "./audio.js";
import { Input } from "./input.js";
import { meetingView } from "./meetings.js";

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const canvas = $("world");
const minimap = $("minimap");
const renderer = new Renderer(canvas, minimap);
const audio = new AudioSys();

let game = null;
let roleChoice = "crew";
let colorIndex = 0;
let selectedVote = null;
let meetingOpen = false;
let last = performance.now();
let started = performance.now();
let lastHud = {};
let toastSeq = 0;
let tiltStatus = "off";
let hintTimers = [];

const ROLE_TEXT = {
  crew: "Deploy as crew. Complete all twelve consoles or eject both impostors before the round clock dies.",
  impostor: "Deploy as impostor. Fake the work, isolate the crew, sabotage a site, and survive the vote.",
  random: "Let the draw decide. Half crew, half impostor. Either way, one round only.",
};

const input = new Input({
  onAction: () => game?.pressAction(),
  onRelease: () => game?.releaseAction(),
  onReload: () => game?.reload(game.player),
  onSabotage: () => game?.playerSabotage?.(),
  onTilt: () => toggleTilt(),
  onMute: () => toggleMute(),
  onState: (s) => updateTiltUi(s.tilt),
});

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function addToast(text, tone = "info", ms = 2800) {
  const stack = $("toastStack");
  if (!stack) return;
  const el = document.createElement("div");
  el.className = `toast ${tone}`;
  el.textContent = text;
  el.dataset.id = String(++toastSeq);
  stack.appendChild(el);
  while (stack.children.length > 3) stack.firstElementChild.remove();
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .25s"; setTimeout(() => el.remove(), 280); }, ms);
}

function beanHtml(color, big = false) {
  return `<span class="bean${big ? " big" : ""}" style="--body:${color.body};--dark:${color.dark};--visor:${color.visor}"></span>`;
}

function updateTiltUi(status) {
  tiltStatus = status;
  const btn = $("tiltBtn");
  const ind = $("tiltIndicator");
  if (!btn) return;
  btn.classList.toggle("on", status === "on" || status === "calibrating");
  btn.classList.toggle("warn", status === "denied" || status === "unsupported");
  btn.textContent = status === "on" ? "TILT ON" : status === "calibrating" ? "HOLD…" : status === "denied" ? "TILT !" : "TILT";
  const label = $("aimStickLabel");
  if (label) label.textContent = status === "on" || status === "calibrating" ? "FIRE / TILT" : "AIM / FIRE";
  if (ind) ind.classList.toggle("hidden", !(status === "on" || status === "calibrating"));
}

async function toggleTilt() {
  audio.init();
  const status = await input.toggleTilt();
  updateTiltUi(status);
  if (status === "on" || status === "calibrating") addToast(status === "calibrating" ? "HOLD STILL — CALIBRATING TILT" : "TILT AIM ON — TAP TILT TO RECENTER", "good", 2600);
  else if (status === "denied") addToast("MOTION PERMISSION DENIED — STICK AIM STILL WORKS", "warn", 3400);
  else if (status === "unsupported") addToast("NO MOTION SENSOR ON THIS DEVICE", "warn", 2600);
}

function toggleMute() {
  audio.init();
  audio.setEnabled(!audio.enabled);
  const btn = $("muteBtn");
  if (btn) {
    btn.textContent = audio.enabled ? "SND" : "MUTE";
    btn.classList.toggle("warn", !audio.enabled);
  }
  addToast(audio.enabled ? "AUDIO ON" : "AUDIO MUTED", "info", 1600);
}

function buildMenu() {
  const colors = $("colors");
  colors.innerHTML = "";
  CREW_COLORS.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "swatch" + (i === colorIndex ? " selected" : "");
    b.style.background = c.body;
    b.title = c.name;
    b.setAttribute("aria-label", `${c.name} suit`);
    b.addEventListener("click", () => {
      colorIndex = i;
      colors.querySelectorAll(".swatch").forEach((el, j) => el.classList.toggle("selected", j === i));
    });
    colors.appendChild(b);
  });

  const picker = $("rolePicker");
  picker.querySelectorAll(".role-card").forEach((card) => {
    card.addEventListener("click", () => {
      roleChoice = card.dataset.role;
      picker.querySelectorAll(".role-card").forEach((c) => c.classList.toggle("selected", c === card));
      $("roleDesc").textContent = ROLE_TEXT[roleChoice];
    });
  });

  $("deployBtn").addEventListener("click", deploy);
  $("beginBtn").addEventListener("click", beginRound);
  $("muteBtn").addEventListener("click", toggleMute);
  $("tiltBtn").addEventListener("click", toggleTilt);
  $("confirmVote").addEventListener("click", confirmVote);
  $("skipVote").addEventListener("click", () => castVote("skip"));
  $("againBtn").addEventListener("click", () => { startMatch(roleChoice, colorIndex); });
  $("menuBtn").addEventListener("click", backToMenu);
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", () => setTimeout(onResize, 120));
}

function onResize() {
  renderer.resize();
  updateRotateHint();
}

function updateRotateHint() {
  const el = $("rotateHint");
  if (!el) return;
  const portrait = window.innerHeight > window.innerWidth;
  el.classList.toggle("hidden", !(portrait && input.coarse && game && !meetingOpen && game.phase === "playing"));
}

function deploy() {
  audio.init();
  startMatch(roleChoice, colorIndex);
}

function startMatch(role, color) {
  hideAllScreens();
  $("hud").classList.remove("hidden");
  $("controls").classList.remove("hidden");
  $("resultScreen").classList.add("hidden");
  $("menu").classList.add("hidden");
  meetingOpen = false;
  selectedVote = null;
  meetingChatReset();

  game = new Game({ audio, onEvent: handleEvent });
  game.start(role, color);
  const p = game.player;
  renderer.cam.x = p.x;
  renderer.cam.y = p.y;
  // let the first frame settle the camera, then show role
}

function beginRound() {
  if (!game) return;
  $("roleScreen").classList.add("hidden");
  $("hud").classList.remove("hidden");
  $("controls").classList.remove("hidden");
  game.beginRound();
  updateRotateHint();
  hintTimers.forEach((t) => clearTimeout(t));
  hintTimers = [
    setTimeout(() => addToast("LEFT STICK MOVES · RIGHT STICK AIMS + FIRES", "info", 3200), 700),
    setTimeout(() => addToast("HOLD THE ACTION BUTTON AT GLOWING CONSOLES", "task", 3200), 4300),
    setTimeout(() => addToast("REPORT BODIES · VOTE AT MEETINGS · WATCH THE CLOCK", "warn", 3400), 8200),
  ];
}

function hideAllScreens() {
  for (const id of ["menu", "roleScreen", "meetingScreen", "resultScreen"]) $(id).classList.add("hidden");
}

function backToMenu() {
  game = null;
  audio.setSabotage(false);
  hideAllScreens();
  $("menu").classList.remove("hidden");
  $("hud").classList.add("hidden");
  $("controls").classList.add("hidden");
  meetingOpen = false;
  selectedVote = null;
  hintTimers.forEach((t) => clearTimeout(t));
  renderer.cam.x = 768;
  renderer.cam.y = 480;
  updateRotateHint();
}

function handleEvent(type, data) {
  if (!game) return;
  switch (type) {
    case "roleReveal":
      showRole(data);
      break;
    case "roundStart":
      $("hud").classList.remove("hidden");
      $("controls").classList.remove("hidden");
      updateRotateHint();
      break;
    case "toast":
      addToast(data.text, data.tone);
      break;
    case "meetingStart":
      showMeeting(data);
      break;
    case "meetingChat":
      addChatMessage(data);
      break;
    case "meetingVote":
      markVoted(data.voterId);
      break;
    case "meetingResult":
      showMeetingResult(data);
      break;
    case "meetingEnd":
      closeMeeting();
      break;
    case "playerDown":
    case "playerEjected":
      $("ghostBar").classList.remove("hidden");
      updateRotateHint();
      break;
    case "roundEnding":
      $("controls").classList.add("hidden");
      addToast(data.winner === "crew" ? "CREW SECURED THE FACILITY" : "IMPOSTORS TOOK THE FACILITY", data.winner === "crew" ? "good" : "bad", 2400);
      break;
    case "results":
      showResults(data);
      break;
    case "sabotageStart":
      addToast("SABOTAGE — GET TO THE BOMB", "danger", 2800);
      break;
    case "sabotageEnd":
      addToast("SABOTAGE CLEARED", "good", 2200);
      break;
    default:
      break;
  }
}

function showRole(data) {
  hideAllScreens();
  $("hud").classList.add("hidden");
  $("controls").classList.add("hidden");
  const screen = $("roleScreen");
  screen.classList.remove("hidden");
  screen.classList.toggle("impostor", data.role === "impostor");
  $("roleLine").textContent = data.role === "impostor" ? "2 IMPOSTORS · 5 CREW" : "2 IMPOSTORS HIDDEN AMONG 7";
  $("roleTitle").textContent = data.role === "impostor" ? "IMPOSTOR" : "CREWMATE";
  $("roleBlurb").textContent = data.role === "impostor"
    ? "You work against the room. Fake the tasks, take the isolated ones quietly, and put the blame somewhere else."
    : "Secure twelve consoles with the crew. If the room turns on itself, trust the evidence — not the loudest voice.";
  const mates = $("roleMates");
  mates.innerHTML = "";
  if (data.role === "impostor" && data.mates?.length) {
    mates.classList.remove("hidden");
    mates.innerHTML = `YOUR PARTNER: ${data.mates.map((m) => `${beanHtml(m.color)} <b>${m.name}</b>`).join(" ")}`;
  } else {
    mates.classList.add("hidden");
  }
  const list = $("roleObjectives");
  list.innerHTML = "";
  if (data.role === "impostor") {
    const items = [
      "Fake a console hold to blend in",
      "Knife isolated crew — silent, 22s cooldown",
      "Sabotage a bomb site and camp the defuse",
      "Vent between Cafeteria/Storage and Medbay/Server",
      "Lie in meetings; vote with the room",
    ];
    items.forEach((t) => { const li = document.createElement("li"); li.textContent = t; list.appendChild(li); });
  } else {
    for (const t of TASKS) {
      const li = document.createElement("li");
      li.textContent = `${t.name} — ${t.room}`;
      list.appendChild(li);
    }
    const li = document.createElement("li");
    li.textContent = "Defuse sabotages · report bodies · eject impostors";
    list.appendChild(li);
  }
  $("beginBtn").focus({ preventScroll: true });
}

function meetingChatReset() {
  const log = $("chatLog");
  if (log) log.innerHTML = "";
}

function showMeeting(data) {
  meetingOpen = true;
  selectedVote = null;
  $("meetingScreen").classList.remove("hidden");
  $("controls").classList.add("hidden");
  $("hud").classList.remove("hidden");
  $("meetingResult").classList.add("hidden");
  $("meetingKicker").textContent = data.type === "report" ? "BODY REPORTED" : "EMERGENCY MEETING";
  $("meetingTitle").textContent = data.victimName ? `${data.victimName} IS DEAD` : "WHO IS LYING?";
  $("meetingSub").textContent = data.victimName
    ? `FOUND IN ${String(data.room || "THE FACILITY").toUpperCase()} · REPORTED BY ${data.reporterName || "UNKNOWN"}`
    : "EMERGENCY BUTTON · CAFETERIA";
  $("meetingTimer").textContent = Math.ceil(data.time);
  meetingChatReset();
  renderVoteGrid(data);
  setVoteActions(data.canVote);
  const hint = data.canVote
    ? "Select a suspect, then confirm. Skip if you have no read."
    : "GHOST PROTOCOL — you can watch, but ghosts cannot vote.";
  $("voteHint").textContent = hint;
  addChatSystem(`NOBODY TALKS. EVERYONE VOTES.`, data.type === "report" ? "REPORT" : "EMERGENCY");
  if (data.playerVoted) setVoteActions(false);
  updateRotateHint();
}

function renderVoteGrid(data) {
  const grid = $("voteGrid");
  grid.innerHTML = "";
  for (const p of data.players) {
    const card = document.createElement("button");
    card.className = "vote-card";
    card.dataset.id = p.id;
    card.disabled = !p.alive || !data.canVote;
    if (!p.alive) card.classList.add("dead");
    if (p.voted) card.classList.add("voted");
    card.innerHTML = `
      ${beanHtml(p.color)}
      <span class="vc-name">${p.name}</span>
      ${p.isPlayer ? '<span class="vc-tag">YOU</span>' : ""}
      <span class="vc-voted">${p.voted ? "VOTED" : ""}</span>
    `;
    card.addEventListener("click", () => selectVote(p.id, card));
    grid.appendChild(card);
  }
  if (data.result) showMeetingResult({ ...data.result, view: data });
}

function selectVote(id, card) {
  if (!meetingOpen || !game?.meeting || game.meeting.phase !== "discuss") return;
  if (!game.player.alive) return;
  if (id === game.player.id) return;
  selectedVote = id;
  document.querySelectorAll(".vote-card").forEach((c) => c.classList.toggle("selected", c === card));
  $("confirmVote").disabled = false;
}

function setVoteActions(canVote) {
  $("confirmVote").disabled = !canVote || selectedVote == null;
  $("skipVote").disabled = !canVote;
  $("confirmVote").style.opacity = canVote ? "" : "0.3";
  $("skipVote").style.opacity = canVote ? "" : "0.3";
}

function confirmVote() {
  if (selectedVote == null) return;
  castVote(selectedVote);
}

function castVote(target) {
  if (!game?.meeting || !game.player.alive || game.meeting.playerVoted) return;
  game.castPlayerVote(target);
  game.meeting.playerVoted = true;
  setVoteActions(false);
  const targetName = target === "skip" ? "SKIP" : game.players.find((p) => p.id === target)?.name || "?";
  addChatSystem(`YOU VOTED ${targetName}.`, "VOTE");
  markVoted(game.player.id);
  document.querySelectorAll(".vote-card").forEach((c) => c.classList.remove("selected"));
}

function markVoted(voterId) {
  const card = document.querySelector(`.vote-card[data-id="${voterId}"]`);
  if (!card) return;
  card.classList.add("voted");
  const v = card.querySelector(".vc-voted");
  if (v) v.textContent = "VOTED";
}

function addChatSystem(text, tag = "SYSTEM") {
  const log = $("chatLog");
  if (!log) return;
  const div = document.createElement("div");
  div.className = "chat-msg system";
  div.innerHTML = `<b>${tag}</b>${escapeHtml(text)}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function addChatMessage(line) {
  const log = $("chatLog");
  if (!log) return;
  const div = document.createElement("div");
  const tone = line.kind === "accuse" ? "hot" : line.kind === "clear" ? "clear" : "info";
  div.className = `chat-msg ${tone}`;
  const name = line.speaker || "SYSTEM";
  const color = line.color?.body || "#ff8f98";
  div.innerHTML = `<b style="color:${color}">${escapeHtml(name)}</b>${escapeHtml(line.text)}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function showMeetingResult(data) {
  const box = $("meetingResult");
  box.classList.remove("hidden");
  const ejected = data.ejectedName;
  $("ejectLabel").textContent = ejected ? "EJECTED" : "NO EJECTION";
  $("ejectName").textContent = ejected || (data.tie ? "TIED VOTE" : "SKIPPED");
  const roleEl = $("ejectRole");
  roleEl.className = "";
  if (ejected) {
    if (data.role === "impostor") {
      roleEl.textContent = `${ejected} WAS AN IMPOSTOR.`;
      roleEl.classList.add("imp");
    } else {
      roleEl.textContent = `${ejected} WAS NOT AN IMPOSTOR.`;
      roleEl.classList.add("clear");
    }
  } else {
    roleEl.textContent = data.tie ? "The vote tied. Nobody was ejected." : "The crew skipped. Nobody was ejected.";
  }
  const avatar = $("ejectAvatar");
  avatar.innerHTML = ejected ? beanHtml(data.ejectedColor || CREW_COLORS[0], true) : "";
  const counts = $("ejectCounts");
  counts.innerHTML = "";
  if (data.counts) {
    for (const [id, n] of Object.entries(data.counts)) {
      const p = game?.players.find((q) => q.id === Number(id));
      if (p) { const s = document.createElement("span"); s.textContent = `${p.name} ${n}`; counts.appendChild(s); }
    }
  }
  if (data.skip) {
    const s = document.createElement("span");
    s.textContent = `SKIP ${data.skip}`;
    counts.appendChild(s);
  }
  const bar = $("autoBar");
  if (bar) {
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "autoFill 4.6s linear forwards";
  }
  $("meetingTimer").textContent = "0";
  $("voteGrid").style.opacity = "0.25";
  $("voteGrid").style.pointerEvents = "none";
}

function closeMeeting() {
  meetingOpen = false;
  selectedVote = null;
  $("meetingScreen").classList.add("hidden");
  $("meetingResult").classList.add("hidden");
  $("voteGrid").style.opacity = "";
  $("voteGrid").style.pointerEvents = "";
  $("controls").classList.remove("hidden");
  updateRotateHint();
}

function showResults(data) {
  meetingOpen = false;
  hideAllScreens();
  $("hud").classList.add("hidden");
  $("controls").classList.add("hidden");
  $("ghostBar").classList.add("hidden");
  const screen = $("resultScreen");
  screen.classList.remove("hidden");
  screen.classList.toggle("impostor-win", data.winner === "impostor");
  $("resultKicker").textContent = data.winner === "crew" ? "FACILITY SECURED" : "FACILITY LOST";
  $("resultTitle").textContent = data.winner === "crew" ? "CREW WINS" : "IMPOSTORS WIN";
  $("resultReason").textContent = data.reason;
  $("statTasks").textContent = `${data.tasksDone}/${data.tasksTotal}`;
  $("statKills").textContent = data.stats.kills;
  $("statVotes").textContent = data.stats.votes;
  $("statTime").textContent = fmtTime(data.timeLeft);
  const roster = $("roster");
  roster.innerHTML = "";
  for (const p of data.players) {
    const card = document.createElement("div");
    card.className = "roster-card" + (p.role === "impostor" ? " imp" : "") + (!p.alive ? " out" : "");
    card.innerHTML = `${beanHtml(p.color)}<span class="rc-name">${p.name}${p.isPlayer ? " (YOU)" : ""}</span><span class="rc-role">${p.role === "impostor" ? "IMPOSTOR" : "CREW"}${p.ejected ? " · EJECTED" : !p.alive ? " · DEAD" : ""}</span>`;
    roster.appendChild(card);
  }
  updateRotateHint();
}

/* ---------------- per-frame ---------------- */

function syncInput() {
  if (!game) return;
  const k = input.keyboardVector();
  let mx = k.x, my = k.y;
  if (input.move.active) { mx += input.move.x; my += input.move.y; }
  const mag = Math.hypot(mx, my);
  if (mag > 1) { mx /= mag; my /= mag; }
  game.input.mx = mx;
  game.input.my = my;
  game.input.firing = input.isFiring();

  if (input.tiltEnabled) {
    game.input.aim = input.tiltAngle;
  } else if (input.aim.active && Math.hypot(input.aim.x, input.aim.y) > 0.15) {
    game.input.aim = input.aim.angle;
  } else if (!input.coarse && input.mouse.active && game.player) {
    const wx = renderer.cam.x + (input.mouse.x - renderer.w / 2) / renderer.zoom;
    const wy = renderer.cam.y + (input.mouse.y - renderer.h / 2) / renderer.zoom;
    game.input.aim = Math.atan2(wy - game.player.y, wx - game.player.x);
  }
}

function updateHud() {
  if (!game) return;
  const g = game;
  const p = g.player;
  const timer = $("timer");
  if (timer) timer.textContent = fmtTime(g.roundTime);
  const taskCount = $("taskCount");
  const done = g.tasksDone;
  const total = TASKS.length;
  if (taskCount) taskCount.textContent = `${done}/${total}`;
  const bar = $("taskBar");
  if (bar) bar.style.width = `${(done / total) * 100}%`;
  const alive = $("aliveCount");
  if (alive) alive.textContent = g.players.filter((q) => q.alive).length;
  const ammoText = $("ammoText");
  if (ammoText && p) ammoText.textContent = p.alive ? `${p.ammo} / ${p.reserve}` : "GHOST";
  const badge = $("roleBadge");
  if (badge && p) {
    badge.textContent = p.role === "impostor" ? "IMPOSTOR" : "CREW";
    badge.classList.toggle("imp", p.role === "impostor");
    badge.style.opacity = p.ghost ? "0.55" : "1";
  }
  const ghost = $("ghostBar");
  if (ghost) ghost.classList.toggle("hidden", !(p && p.ghost));
  updateObjective(g);
  updateAction(g);
  updateSabotageButton(g);
  updateTiltIndicator();
  updateMeetingLive(g);
  updateRotateHint();
}

let objectiveKey = "";
function updateObjective(g) {
  const el = $("objective");
  if (!el) return;
  if (!g.sabotage) {
    if (objectiveKey) { el.classList.add("hidden"); objectiveKey = ""; }
    return;
  }
  const site = { A: "REACTOR CORE", B: "CARGO HOLD" }[g.sabotage.siteId] || "SITE";
  const t = Math.ceil(g.sabotage.timeLeft);
  const key = `${site}:${t}`;
  if (key !== objectiveKey) {
    objectiveKey = key;
    $("objectiveTitle").textContent = "SABOTAGE ARMED";
    $("objectiveSub").textContent = `${site} · DEFUSE WITH THE ACTION BUTTON`;
    $("objectiveTimer").textContent = String(t).padStart(2, "0");
    el.classList.remove("hidden");
  }
}

let actionKey = "";
function updateAction(g) {
  const btn = $("actionBtn");
  if (!btn) return;
  const ctx = g.getContext();
  const p = g.player;
  let label = "——";
  let sub = "NO TARGET";
  let tone = "";
  let ready = false;
  let pct = 0;
  if (ctx) {
    label = ctx.label;
    sub = ctx.sub;
    tone = ctx.tone || "";
    ready = ctx.ready;
    if (g.action) {
      if (g.action.type === "task") pct = (g.action.progress || 0) * 100;
      if (g.action.type === "defuse") pct = g.sabotage?.defuse || 0;
      sub = g.action.type === "task" && p.role === "impostor" ? "FAKING" : "WORKING";
    } else if (ctx.type === "kill" && p.knifeCd > 0) {
      pct = (1 - p.knifeCd / 22) * 100;
    } else if (ctx.type === "vent" && p.ventCd > 0) {
      pct = (1 - p.ventCd / 7) * 100;
    }
  } else if (g.player?.reloading) {
    label = "RELOAD";
    sub = "WORKING";
    tone = "warn";
    pct = (1 - p.reloadT / 1.25) * 100;
    ready = false;
  }
  const key = `${label}|${sub}|${tone}|${ready}|${Math.round(pct)}|${p?.role}|${p?.alive}|${p?.ghost}`;
  if (key === actionKey) return;
  actionKey = key;
  btn.className = "action-btn" + (tone ? ` ${tone}` : "") + (ready ? "" : " disabled");
  $("actionLabel").textContent = label;
  $("actionSub").textContent = sub;
  btn.style.setProperty("--p", String(clamp(pct, 0, 100)));
}

let sabKey = "";
function updateSabotageButton(g) {
  const btn = $("sabotageBtn");
  if (!btn) return;
  const p = g.player;
  const show = p && p.role === "impostor" && p.alive && g.phase === "playing";
  btn.classList.toggle("hidden", !show);
  if (!show) return;
  const cd = Math.ceil(p.sabotageCd);
  const active = !!g.sabotage;
  const sub = active ? "ACTIVE" : cd > 0 ? `${cd}s` : "READY";
  const key = `${sub}|${active}`;
  if (key === sabKey) return;
  sabKey = key;
  $("sabotageSub").textContent = sub;
  btn.classList.toggle("cooling", cd > 0 || active);
  btn.disabled = cd > 0 || active;
}

function updateTiltIndicator() {
  const ind = $("tiltIndicator");
  if (!ind) return;
  ind.classList.toggle("hidden", !(input.tiltEnabled && game));
  if (!input.tiltEnabled) return;
  const needle = $("tiltNeedle");
  if (needle) needle.style.transform = `translate(0,-50%) rotate(${input.tiltAngle}rad)`;
}

let meetingKey = "";
function updateMeetingLive(g) {
  if (!meetingOpen || !g.meeting) return;
  const t = Math.ceil(g.meeting.time);
  const timer = $("meetingTimer");
  if (timer) timer.textContent = t;
  const status = $("voteStatus");
  const canVote = g.player?.alive && !g.meeting.playerVoted;
  if (g.meeting.phase === "discuss") {
    setVoteActions(canVote);
    if (!g.player?.alive) $("voteHint").textContent = "GHOST PROTOCOL — you can watch, but ghosts cannot vote.";
  }
}

function frame(now) {
  const dt = clamp((now - last) / 1000, 0, 0.1);
  last = now;
  if (game) {
    syncInput();
    game.update(dt);
    renderer.render(game, (now - started) / 1000, false);
    updateHud();
    audio.setSabotage(!!game.sabotage && game.phase === "playing");
  } else {
    renderer.render(null, (now - started) / 1000, true);
  }
  requestAnimationFrame(frame);
}

/* ---------------- boot ---------------- */

buildMenu();
input.attach();
onResize();
updateRotateHint();
document.body.classList.toggle("fine", window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(pointer: coarse)").matches);
updateTiltUi("off");
requestAnimationFrame(frame);

window.addEventListener("blur", () => {
  if (game?.input) game.input.firing = false;
});
window.__crewstrike = {
  get game() { return game; },
  deploy: () => deploy(),
  start: (role = "crew") => startMatch(role, colorIndex),
  begin: () => beginRound(),
  renderer,
};
