import { Game } from './game.js';
import { UI } from './ui.js';

const ui = new UI();
const canvas = document.getElementById('game');

let game;
try {
  game = new Game(canvas, ui);
} catch (error) {
  console.error(error);
  document.getElementById('fatal').classList.remove('hidden');
}

if (game) {
  const startBtn = document.getElementById('start-btn');
  const helpBtn = document.getElementById('help-btn');
  const helpClose = document.getElementById('help-close');
  const helpDone = document.getElementById('help-done');
  const resumeBtn = document.getElementById('resume-btn');
  const pauseHelpBtn = document.getElementById('pause-help-btn');
  const abandonBtn = document.getElementById('abandon-btn');
  const redeployBtn = document.getElementById('redeploy-btn');
  const muteBtn = document.getElementById('mute-btn');

  let helpReturn = 'start';

  const openHelp = (from) => {
    helpReturn = from;
    ui.showHelp(true);
    if (from === 'start') ui.showStart(false);
    if (from === 'pause') ui.showPause(false);
  };

  const closeHelp = () => {
    ui.showHelp(false);
    if (helpReturn === 'start') {
      ui.showStart(true);
    } else if (helpReturn === 'pause') {
      ui.showPause(true);
    }
  };

  startBtn.addEventListener('click', () => {
    game.audio.resume();
    game.audio.click();
    game.startRun();
  });

  helpBtn.addEventListener('click', () => {
    game.audio.resume();
    game.audio.click();
    openHelp('start');
  });

  helpClose.addEventListener('click', closeHelp);
  helpDone.addEventListener('click', closeHelp);

  resumeBtn.addEventListener('click', () => {
    game.audio.click();
    game.resume();
  });

  pauseHelpBtn.addEventListener('click', () => openHelp('pause'));
  abandonBtn.addEventListener('click', () => {
    game.audio.click();
    game.abandon();
  });

  redeployBtn.addEventListener('click', () => {
    game.audio.click();
    game.startRun();
  });

  muteBtn.addEventListener('click', () => {
    game.audio.resume();
    game.toggleMute();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (!ui.el.help.classList.contains('hidden')) {
      closeHelp();
      e.stopPropagation();
    }
  });

  // show touch controls on coarse-pointer devices or narrow screens
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const syncTouch = () => {
    const show = coarse || 'ontouchstart' in window || window.innerWidth < 760;
    const touchUI = document.getElementById('touch-ui');
    if (!touchUI) return;
    touchUI.classList.toggle('hidden', !show);
    document.body.classList.toggle('touch-enabled', show);
  };
  syncTouch();
  window.addEventListener('resize', syncTouch);

  // expose for debugging / capture
  window.__aethelgard = game;
}
